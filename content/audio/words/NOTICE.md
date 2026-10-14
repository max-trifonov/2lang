# Записи слов — источник и лицензии

Файлы `en/*.mp3` и `es/*.mp3` синтезированы [Piper](https://github.com/OHF-Voice/piper1-gpl) скриптом `build.py` (LNG-S1-031, D-36). Имя файла — FNV-1a-ключ леммы (`features/dictionary/audio.ts`).

| Язык | Голос | Данные голоса | Лицензия |
|---|---|---|---|
| EN | `en_US-ljspeech-high` | LJ Speech Dataset (K. Ito, L. Johnson) | общественное достояние |
| ES | `es_ES-davefx-medium` | записи davefx | CC0 1.0 |

Модели голосов — [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices). Сами записи — производные от голосов с перечисленными лицензиями и распространяются на тех же условиях.

Записи для слов партии 4 (LNG-S1-032) не сгенерированы: при сборке не было доступа к моделям голосов. Для них озвучивает голос устройства (D-36); `build.py` досоздаёт недостающие файлы.
