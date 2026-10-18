# CLAUDE.md — 2Lang

> PWA для изучения двух языков одновременно (EN + ES), для себя и семьи. Позже из того же кода — мобильное приложение.

## Холодный старт

1. Этот файл.
2. Блок **«Сейчас»** в [`.flow/roadmap.md`](.flow/roadmap.md).
3. Файл активной задачи в `.flow/tasks/`.
4. [`.flow/code-map.md`](.flow/code-map.md).

| Артефакт | Путь |
|---|---|
| Brief (продукт + методика) | [`.flow/brief.md`](.flow/brief.md) |
| Roadmap + «Сейчас» | `.flow/roadmap.md` |
| Задачи | `.flow/tasks/` (закрытые — `tasks/done/`) |
| Журнал решений | `.flow/decisions.md` |
| Code map | `.flow/code-map.md` |
| Техдолг | `.flow/tech-debt.md` |
| Баги (открытые / пофикшенные) | `.flow/bugs.md` / `.flow/bugfix.md` |
| Runbook (прод, деплой, откат) | [`.flow/runbook.md`](.flow/runbook.md): `make deploy-prod` / `rollback-prod` / `status-prod` (`deploy/prod.sh` → `deploy/deploy.sh` на сервере), nginx `deploy/nginx/` (D-39) |
| Программа курса EN/ES (звучание, грамматика) | [`.flow/curriculum.md`](.flow/curriculum.md) |
| Формат текстов (песни и стихи) v1 | [`.flow/content-format.md`](.flow/content-format.md), схема `content/schema/text.schema.json` |
| Формат словаря v1 | [`.flow/dictionary-format.md`](.flow/dictionary-format.md), схема `content/schema/dictionary.schema.json`, словари `content/dictionary/` (черновики ИИ — `ext.draft`; сборка из `content/drafts/` — `python3 content/drafts/build.py`, слияние, D-28), каркас `content/frequency/` |
| Формат урока v1 (слова, звучание, грамматика) | [`.flow/lesson-format.md`](.flow/lesson-format.md), схема `content/schema/lesson.schema.json`, пример `content/lessons/` |
| Уроки грамматики и отсылки к правилам (D-38) | исходники `content/drafts/grammar/{es,en}.txt` → `python3 content/drafts/grammar/gen.py` (темы `*-grammar-NN.json` + поле `see` уроков слов через `link.py`) |
| Записи слов словаря (Piper, D-36) | `content/audio/words/` — после правки словаря: `<venv с piper-tts>/bin/python content/audio/words/build.py --voices <каталог .onnx>` |
| Контент в поставке (public-domain / own) | `content/texts/` |
| Личные тексты (`license: personal`) | `content/private/` — в git (D-41) и в поставке PWA (D-43) |

**Префикс задач:** `LNG`. Режим тестов: фронт лёгкий (К2 — unit на чистые функции: валидатор контента, FSRS, подбор урока; К3 — без тестов).

## Команды — `Makefile` (корень)

```bash
make help            # все цели
make check           # typecheck + lint + test (Node из app/.nvmrc)
make deploy-prod     # прод: гейты → проверки → выкладка HEAD → смоук (runbook)
make rollback-prod   # прод: предыдущий релиз
```

## Приложение — `app/`

Vue 3 + Ionic Vue + Capacitor из App Shell `~/Projects/templates-app` (`D-11`, `D-15`): appId `com.trifonov.twolang`, PWA + Android + iOS, push; языки интерфейса `ru`/`en`/`es`, по умолчанию `ru`. Параметры — `app/app.manifest.json`.

```bash
cd app
npm ci
npm run dev
npm run typecheck && npm run lint && npm run test   # проверка перед закрытием задачи
npm run build                                       # PWA: dist/ с sw.js
npm run native:generate                             # Android/iOS-проекты (iOS — macOS)
npm run icons                                       # иконки PWA из assets/icon.svg (нужен Chrome)
npm run content:frequency -- --src <wordhoard>     # частотный каркас словаря → content/frequency/
```

- Домен — `app/src/features/<name>/`. Ядро (`src/shared`, `src/app`) экранами продукта не засорять.
- Capacitor — только через `src/shared/native`, `fetch` — только через `src/shared/api` (ESLint).
- Вкладки — данные в `src/app/navigation/tabs.ts`.
- Dev-сервер из фоновой команды — `npm --prefix app run dev`: `cd app && npx vite` в фоне может стартовать из корня и скачать чужой vite.
- Улучшения ядра — сначала в `~/Projects/templates-app` (upstream-first).

## Правила контента

- Тексты, защищённые авторским правом, — только в `content/private/` (`license: personal`): в git (D-41) и в поставке PWA (D-43); `content/texts/` — только public-domain и own.
- Любой текст интерфейса — из словаря i18n (RU / EN / ES, D-4): ключ без перевода роняет `npm run test`; числа — формами через `|` (`t(key, { n }, n)`).
