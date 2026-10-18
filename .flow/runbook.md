# Runbook — 2Lang

Прод (D-39): **https://2lang.nidavellir.ru** — статика PWA, бэкенда нет.

| Что | Где |
|---|---|
| Сервер | `ssh hawk@bots.nidavellir.ru` (5.42.110.202; общий с Menuvo/Onrese — их не трогать) |
| Чекаут | `/home/hawk/2lang` — клон `git@github.com:max-trifonov/2lang.git`, detached HEAD |
| Релизы | `/home/hawk/2lang/.releases/<YYYYMMDD-HHMMSS>-<sha>`, живой — симлинк `current`, хранится 3 |
| Сборка | одноразовый контейнер `node:22.20.0-bookworm-slim` (Node на хосте нет) |
| nginx | `/etc/nginx/sites-available/2lang.nidavellir.ru.conf` ← копия `deploy/nginx/`, симлинк в `sites-enabled` |
| Сертификат | Let's Encrypt, `/etc/letsencrypt/live/2lang.nidavellir.ru/`, продление — системный таймер certbot (authenticator nginx) |
| Логи | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` (общие) |

## Деплой

С рабочей машины, из корня репозитория:

```bash
make deploy-prod                      # HEAD (должен быть запушен), с проверками
make deploy-prod REF=<sha|тег> SKIP_CHECKS=1   # другой коммит без проверок (например, откат на старый)
make status-prod                      # живой релиз, список релизов, version.txt
make smoke-prod                       # HTTP-смоук; EXPECT_SHA=<полный sha> — сверить версию
```

`make deploy-prod` (`deploy/prod.sh`):

1. **Гейты:** коммит есть в `origin` (сервер собирает из GitHub — сначала `git push`); нет незакоммиченных правок; `REF` = `HEAD` (проверки идут по рабочему дереву). Если выкатывается не `origin/main` — предупреждение.
2. **Проверки:** `typecheck` → `lint` → `test` на Node из `app/.nvmrc`. `SKIP_CHECKS=1` — пропустить.
3. **Выкладка:** на сервере чекаут переключается на точный sha, затем `deploy/deploy.sh <sha>` уже этого коммита: `npm ci && npm run build` в контейнере → копия `app/dist` + `version.txt` (полный sha) в новый релиз → атомарная подмена `current`. Упавшая сборка живой сайт не трогает, nginx перезагружать не нужно. Параллельный деплой отсекается `flock` (`.releases/.deploy.lock`).
4. **Смоук:** `/`, `/rules` (SPA-маршрут), `/manifest.webmanifest` → 200; `/sw.js` с `Cache-Control: no-cache`; `/version.txt` = выкатываемый sha. Красный смоук — `make rollback-prod`.

Хост, каталог и URL переопределяются: `PROD_HOST`, `PROD_DIR`, `PROD_URL`.

Без make (на сервере): `/home/hawk/2lang/deploy/deploy.sh [<ref>|--rollback]`.

Установленное PWA подхватывает релиз при следующем заходе: `index.html`, `sw.js`, `manifest.webmanifest` отдаются с `no-cache`, `assets/` — `immutable` (имена с хэшем).

## Откат

```bash
make rollback-prod                         # current → предыдущий релиз + смоук
make deploy-prod REF=<sha> SKIP_CHECKS=1   # конкретный коммит (пересборка)
```

## Изменение конфига nginx

Сначала выкатить коммит с новым `deploy/nginx/…conf` (`make deploy-prod`), затем:

```bash
make nginx-prod     # diff → копия .bak-<дата> → cp → nginx -t → reload; при ошибке nginx -t копия возвращается без reload
```

Нужен `sudo` на сервере (`ssh -t`, спросит пароль). nginx общий: падение задевает все сайты сервера, поэтому reload только после зелёного `nginx -t`.

## Первичная установка (сделано 2026-10-14)

```bash
git clone git@github.com:max-trifonov/2lang.git /home/hawk/2lang
/home/hawk/2lang/deploy/deploy.sh
sudo certbot certonly --nginx -d 2lang.nidavellir.ru        # до включения vhost: конфиг ссылается на сертификат
sudo cp /home/hawk/2lang/deploy/nginx/2lang.nidavellir.ru.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/2lang.nidavellir.ru.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Типовые сбои

- **`deploy.sh`: «В чекауте есть правки»** — кто-то правил файлы на сервере. `git -C /home/hawk/2lang diff` → перенести правку в репозиторий, на сервере `git checkout -- .`.
- **404 на всё / 403** — `current` указывает в никуда: `make status-prod` → `make rollback-prod` или новый деплой.
- **«Уже идёт другой деплой»** — дождаться; если процесса нет (`pgrep -af deploy.sh` на сервере), блокировка снимается сама — `flock` держится только пока жив процесс.
- **Смоук: `version.txt = —`** — у релиза нет `version.txt` (собран до 2026-10-18) или `current` не переключился: `make status-prod`.
- **После деплоя у пользователей старая версия** — проверить `curl -sI .../sw.js` на `Cache-Control: no-cache`; PWA обновляется на следующем открытии, не мгновенно.
