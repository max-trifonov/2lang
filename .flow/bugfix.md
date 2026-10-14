# Пофикшенные баги

| ID | Обнаружен | Пофикшен | Описание | Фикс |
|---|---|---|---|---|
| BUG-1 | 2026-10-14 | 2026-10-14 | Прод: чипы и тинт языков EN/ES без цвета (на dev цветные) — тема выглядит чёрно-белой | lang.css: light-dark() → светлые значения в :root + тёмные по :root[data-color-scheme='dark'] (ставит shared/theme/store.ts). Причина: Lightning CSS в сборке понижает light-dark() до var(--lightningcss-light/dark) и объявляет их только рядом с color-scheme в CSS, а схему ставит JS |
