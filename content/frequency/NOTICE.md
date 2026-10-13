# Частотный каркас словаря — источники и лицензия

Файлы `<язык>.<часть речи>.csv` и `report.<язык>.md` в этом каталоге — производные данные (LNG-S1-012, решение D-24):

- **wordhoard** v0.1.0 — https://github.com/natema/wordhoard — данные CC BY-SA 4.0. Частотность — OpenSubtitles-2018 через FrequencyWords (hermitdave, CC BY-SA 4.0), леммы и части речи — модели spaCy, род и формы — Wiktionary через kaikki.org (CC BY-SA 4.0).

Изменения относительно источника: оставлены глаголы (VERB + AUX), существительные, прилагательные и наречия; применены алиасы, стоп-лист и поправки рода из `config.json`; ранг пересчитан внутри части речи; отобраны первые 500 / 1000 / 200 / 200.

Лицензия этого каталога и словарей `content/dictionary/`, построенных на нём: **CC BY-SA 4.0** — https://creativecommons.org/licenses/by-sa/4.0/

Пересборка: распаковать `wordhoard-csv-v0.1.0.zip` из релиза v0.1.0 и выполнить в `app/`:

```bash
npm run content:frequency -- --src <каталог с wordhoard-*.csv>
```
