#!/usr/bin/env bash
# Прод 2Lang с рабочей машины: гейты → deploy/deploy.sh на сервере → смоук.
# Точка входа — цели Makefile (make deploy-prod и др.), порядок — .flow/runbook.md.
#
#   deploy/prod.sh deploy     # REF (по умолчанию HEAD), SKIP_CHECKS=1 — без typecheck/lint/test
#   deploy/prod.sh rollback   # current → предыдущий релиз
#   deploy/prod.sh status     # живой релиз, список релизов, version.txt
#   deploy/prod.sh smoke      # HTTP-проверки прода (EXPECT_SHA — ожидаемый коммит)
#   deploy/prod.sh nginx      # выкатить deploy/nginx/ из чекаута сервера (sudo, с откатом)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROD_HOST="${PROD_HOST:-hawk@bots.nidavellir.ru}"
PROD_DIR="${PROD_DIR:-/home/hawk/2lang}"
PROD_URL="${PROD_URL:-https://2lang.nidavellir.ru}"
NGINX_CONF="2lang.nidavellir.ru.conf"

log() { printf '\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m!!  %s\033[0m\n' "$*" >&2; }
die() { printf '\033[31mxx  %s\033[0m\n' "$*" >&2; exit 1; }

remote() { ssh -o BatchMode=yes "$PROD_HOST" "$@"; }

# Проверки — на той же версии Node, что и сборка на сервере (app/.nvmrc).
checks() {
  log "typecheck, lint, test"
  (
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    # shellcheck disable=SC1091
    [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" --no-use >/dev/null 2>&1
    cd "$ROOT/app"
    { command -v nvm >/dev/null 2>&1 && nvm use >/dev/null 2>&1; } || warn "nvm не найден — Node $(node -v)"
    [[ -d node_modules ]] || npm ci --no-audit --no-fund
    npm run --silent typecheck
    npm run --silent lint
    npm run --silent test
  )
}

http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$1"; }

# sha живого релиза. У релизов без version.txt SPA-фолбэк отдаёт index.html — это «—».
live_version() {
  local v
  v="$(curl -s --max-time 15 "$PROD_URL/version.txt" | head -c 64 | tr -d '[:space:]')"
  [[ "$v" =~ ^[0-9a-f]{40}$ ]] && echo "$v" || echo "—"
}

smoke() {
  local expect="${1:-${EXPECT_SHA:-}}" fail=0 code live=""
  log "Смоук $PROD_URL"
  for path in / /rules /manifest.webmanifest; do
    code="$(http_code "$PROD_URL$path")"
    [[ "$code" == 200 ]] && echo "  ok   $path" || { echo "  FAIL $path → $code"; fail=1; }
  done
  # Без no-cache на sw.js установленное PWA не увидит релиз.
  if curl -sI --max-time 15 "$PROD_URL/sw.js" | tr -d '\r' | grep -qi '^cache-control: no-cache'; then
    echo "  ok   /sw.js (no-cache)"
  else
    echo "  FAIL /sw.js: нет ответа или Cache-Control ≠ no-cache"; fail=1
  fi
  if [[ -n "$expect" ]]; then
    live="$(live_version)"
    [[ "$live" == "$expect" ]] && echo "  ok   version.txt = ${expect:0:12}" \
      || { echo "  FAIL version.txt = ${live:0:12}, ждали ${expect:0:12}"; fail=1; }
  fi
  ((fail == 0)) || die "Смоук не прошёл — откат: make rollback-prod"
  log "Смоук зелёный"
}

cmd_deploy() {
  cd "$ROOT"
  local ref="${REF:-HEAD}" sha head
  git fetch --quiet --prune origin
  sha="$(git rev-parse --verify --quiet "$ref^{commit}")" || die "Нет такого коммита: $ref"
  head="$(git rev-parse HEAD)"

  # Сервер собирает из GitHub — незапушенный коммит там не найдётся.
  [[ -n "$(git branch -r --contains "$sha" 2>/dev/null)" ]] \
    || die "$(git rev-parse --short "$sha") нет в origin — сначала git push"
  # Без REF выкатывается локальный HEAD: если он отстаёт от origin/main (забыли git pull),
  # на прод ушла бы старая версия под видом свежей.
  if [[ -z "${REF:-}" && "$sha" != "$(git rev-parse origin/main)" ]] \
    && git merge-base --is-ancestor "$sha" origin/main; then
    die "Локальный HEAD $(git rev-parse --short "$sha") отстаёт от origin/main ($(git rev-parse --short origin/main)) — сначала git pull. Старый коммит — REF=<sha>"
  fi
  [[ "$sha" == "$(git rev-parse origin/main)" ]] \
    || warn "Выкатывается $(git rev-parse --short "$sha"), а не origin/main ($(git rev-parse --short origin/main))"

  if [[ "${SKIP_CHECKS:-}" == 1 ]]; then
    warn "SKIP_CHECKS=1 — typecheck/lint/test пропущены"
  else
    # Проверяется рабочее дерево, поэтому оно обязано совпадать с выкатываемым коммитом.
    [[ "$sha" == "$head" ]] \
      || die "REF ≠ HEAD: проверки шли бы не по тому коду. Переключитесь на REF или SKIP_CHECKS=1 (откат на старый коммит)"
    [[ -z "$(git status --porcelain --untracked-files=no)" ]] \
      || die "Незакоммиченные правки — проверки не отражают коммит. Закоммитьте или спрячьте"
    [[ -z "$(git status --porcelain -- app content)" ]] \
      || warn "Неотслеживаемые файлы в app/ или content/ — в проверках участвуют, в прод не попадут"
    checks
  fi

  log "Деплой $(git log -1 --format='%h %s' "$sha") → $PROD_HOST"
  # Сначала чекаут на целевой коммит: иначе выкладку вёл бы deploy.sh прошлого релиза.
  # Правки в чекауте сервера checkout не затрёт: конфликт — ошибка, остальное поймает deploy.sh.
  remote "git -C $PROD_DIR fetch --quiet --prune --tags origin \
    && git -C $PROD_DIR checkout --quiet --detach $sha \
    && $PROD_DIR/deploy/deploy.sh $sha"
  smoke "$sha"
  log "Прод: $PROD_URL ($(git rev-parse --short "$sha"))"
}

cmd_rollback() {
  remote "$PROD_DIR/deploy/deploy.sh" --rollback
  smoke "$(remote cat "$PROD_DIR/.releases/current/version.txt" 2>/dev/null || true)"
}

cmd_status() {
  remote "cd $PROD_DIR/.releases && echo \"current → \$(basename \"\$(readlink -f current)\")\" && ls -1d 2*/"
  echo "version.txt: $(live_version)"
}

# nginx общий для всех сайтов сервера: копия, nginx -t, при ошибке — возврат копии без reload.
cmd_nginx() {
  ssh -t "$PROD_HOST" "set -e
    src=$PROD_DIR/deploy/nginx/$NGINX_CONF dst=/etc/nginx/sites-available/$NGINX_CONF
    if sudo cmp -s \"\$src\" \"\$dst\"; then echo 'Конфиг nginx не изменился'; exit 0; fi
    sudo diff -u \"\$dst\" \"\$src\" || true
    bak=\"\$dst.bak-\$(date +%F-%H%M%S)\"
    sudo cp -a \"\$dst\" \"\$bak\"
    sudo cp \"\$src\" \"\$dst\"
    if sudo nginx -t; then sudo systemctl reload nginx; echo \"nginx перезагружен, копия: \$bak\"
    else sudo cp -a \"\$bak\" \"\$dst\"; echo 'nginx -t упал — конфиг возвращён, reload не делался' >&2; exit 1; fi"
  smoke
}

case "${1:-}" in
  deploy) cmd_deploy ;;
  rollback) cmd_rollback ;;
  status) cmd_status ;;
  smoke) smoke ;;
  nginx) cmd_nginx ;;
  *) die "Использование: $0 deploy|rollback|status|smoke|nginx" ;;
esac
