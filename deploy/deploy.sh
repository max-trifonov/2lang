#!/usr/bin/env bash
# Выкладка PWA 2Lang на сервере: обновить чекаут → собрать в одноразовом
# контейнере Node → опубликовать новый релиз подменой симлинка.
#
#   ./deploy/deploy.sh                 # последний origin/main
#   ./deploy/deploy.sh <ref>           # ветка, тег или коммит
#   ./deploy/deploy.sh --rollback      # вернуть предыдущий релиз
#
# nginx отдаёт $RELEASES/current; сборка идёт в отдельный каталог, поэтому
# упавшая сборка не трогает живой сайт, а переключение атомарно (mv -T).
# С рабочей машины вызывается через make deploy-prod (deploy/prod.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RELEASES="${RELEASES:-$ROOT/.releases}"
NODE_IMAGE="${NODE_IMAGE:-node:22.20.0-bookworm-slim}"
KEEP="${KEEP:-3}"

log() { printf '\033[1m==> %s\033[0m\n' "$*"; }

# Каталоги релизов, новые первыми (имя начинается с метки времени); симлинк
# current сюда не попадает — find с -type d по ссылкам не ходит.
releases() { find "$RELEASES" -mindepth 1 -maxdepth 1 -type d | sort -r; }

switch_to() {
  ln -sfn "$1" "$RELEASES/.current.tmp"
  mv -T "$RELEASES/.current.tmp" "$RELEASES/current"
  log "current → $(basename "$1")"
}

# Тело — в функции: bash разбирает её целиком до запуска, поэтому git checkout
# новой версии этого же файла посреди выкладки не ломает выполнение.
main() {
mkdir -p "$RELEASES"

# Два деплоя разом перетёрли бы друг другу чекаут и app/dist.
exec 9>"$RELEASES/.deploy.lock"
flock -n 9 || { echo "Уже идёт другой деплой ($RELEASES/.deploy.lock)" >&2; exit 1; }

if [[ "${1:-}" == "--rollback" ]]; then
  current="$(readlink -f "$RELEASES/current" 2>/dev/null || true)"
  prev="$(releases | grep -vxF "$current" | head -1 || true)"
  [[ -n "$prev" ]] || { echo "Нет предыдущего релиза для отката" >&2; exit 1; }
  switch_to "$prev"
  exit 0
fi

ref="${1:-origin/main}"

cd "$ROOT"
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "В чекауте $ROOT есть правки — деплой берёт код только из git" >&2
  exit 1
fi

log "git fetch, checkout $ref"
git fetch --prune --tags origin
git checkout --quiet --detach "$ref"
full_sha="$(git rev-parse HEAD)"
sha="${full_sha:0:12}"
log "Коммит $sha: $(git log -1 --format=%s)"

# Контейнер от имени владельца чекаута: node_modules и dist не уйдут в root.
log "Сборка в $NODE_IMAGE"
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e HOME=/tmp -e npm_config_cache=/tmp/.npm \
  -v "$ROOT:/repo" -w /repo/app \
  "$NODE_IMAGE" \
  sh -c 'npm ci --no-audit --no-fund && npm run build'

target="$RELEASES/$(date +%Y%m%d-%H%M%S)-$sha"
cp -a "$ROOT/app/dist" "$target"
# По нему make deploy-prod сверяет, что сайт отдаёт именно этот коммит.
printf '%s\n' "$full_sha" >"$target/version.txt"
switch_to "$target"

# Старые релизы: оставляем $KEEP последних, текущий не трогаем никогда.
current="$(readlink -f "$RELEASES/current")"
releases | grep -vxF "$current" | tail -n +"$KEEP" | xargs -r rm -rf

log "Готово: $sha"
}

main "$@"
