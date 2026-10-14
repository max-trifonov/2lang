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

Код берётся только из GitHub — сначала `git push`, потом:

```bash
ssh hawk@bots.nidavellir.ru /home/hawk/2lang/deploy/deploy.sh             # origin/main
ssh hawk@bots.nidavellir.ru /home/hawk/2lang/deploy/deploy.sh <ref>       # тег / коммит
```

Скрипт: `git fetch` → `checkout --detach <ref>` → `npm ci && npm run build` в контейнере → копия `app/dist` в новый релиз → атомарная подмена `current`. Упавшая сборка живой сайт не трогает. Перезагружать nginx не нужно.

Проверка после деплоя:

```bash
curl -sI https://2lang.nidavellir.ru/ | head -1                  # 200
curl -s https://2lang.nidavellir.ru/sw.js | head -c 200          # service worker отдаётся
curl -sI https://2lang.nidavellir.ru/rules | head -1             # 200 (SPA-маршрут → index.html)
```

Установленное PWA подхватывает релиз при следующем заходе: `index.html`, `sw.js`, `manifest.webmanifest` отдаются с `no-cache`, `assets/` — `immutable` (имена с хэшем).

## Откат

```bash
ssh hawk@bots.nidavellir.ru /home/hawk/2lang/deploy/deploy.sh --rollback   # current → предыдущий релиз
```

Или конкретный коммит: `deploy.sh <sha>`.

## Изменение конфига nginx

```bash
cd /home/hawk/2lang && deploy/deploy.sh   # подтянуть репо с новым конфигом
sudo cp /etc/nginx/sites-available/2lang.nidavellir.ru.conf{,.bak-$(date +%F)}
sudo cp deploy/nginx/2lang.nidavellir.ru.conf /etc/nginx/sites-available/
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` упал — вернуть `.bak` и не перезагружать: nginx общий, падение задевает все сайты сервера.

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
- **404 на всё / 403** — `current` указывает в никуда: `ls -l /home/hawk/2lang/.releases/` → `deploy.sh --rollback` или новый деплой.
- **После деплоя у пользователей старая версия** — проверить `curl -sI .../sw.js` на `Cache-Control: no-cache`; PWA обновляется на следующем открытии, не мгновенно.
