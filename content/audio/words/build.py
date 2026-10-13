# Записи слов словаря (LNG-S1-031, D-36): лемма каждой статьи content/dictionary → mp3 голосом
# Piper (нейросетевой синтез, офлайн) → content/audio/words/<lang>/<ключ>.mp3. Ключ — FNV-1a
# от нормализованного текста, тот же, что считает приложение (features/dictionary/audio.ts).
# Запуск — Python окружения с piper-tts, нужен ffmpeg:
#   <venv>/bin/python content/audio/words/build.py --voices <каталог с .onnx>
# Существующие файлы не перезаписываются (--force — заново); файлы без статьи удаляются.
import argparse, glob, json, os, subprocess, sys, tempfile, unicodedata, wave

HERE = os.path.dirname(os.path.abspath(__file__))
DICTIONARY = os.path.abspath(os.path.join(HERE, '..', '..', 'dictionary'))
# Голоса с открытой лицензией (см. NOTICE.md): регион — как DEFAULT_REGION в shared/native/speech.ts.
VOICES = {'en': 'en_US-ljspeech-high', 'es': 'es_ES-davefx-medium'}
# Чуть медленнее обычного: слово для ученика, а не для диктора новостей.
LENGTH_SCALE = 1.1


def key(text):
    data = unicodedata.normalize('NFC', text.strip()).lower().encode('utf-8')
    h = 0x811C9DC5
    for b in data:
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'


def lemmas():
    out = {}
    for path in sorted(glob.glob(os.path.join(DICTIONARY, '*.json'))):
        with open(path, encoding='utf-8') as f:
            doc = json.load(f)
        for e in doc['entries']:
            out.setdefault(doc['lang'], set()).add(e['lemma'])
    return out


def encode(wav, mp3):
    # Тишина по краям срезается, в конце — короткий хвост: иначе слово обрывается на выдохе.
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB'
    flt = f'{trim},areverse,{trim},areverse,apad=pad_dur=0.12'
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', flt, '-ac', '1', '-ar', '22050',
         '-codec:a', 'libmp3lame', '-b:a', '48k', mp3],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--voices', required=True, help='каталог с <голос>.onnx и .onnx.json')
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()
    from piper import PiperVoice, SynthesisConfig

    config = SynthesisConfig(length_scale=LENGTH_SCALE)
    for lang, words in sorted(lemmas().items()):
        keys = {}
        for w in words:
            k = key(w)
            if k in keys and keys[k] != w:
                sys.exit(f'{lang}: коллизия ключа {k}: «{keys[k]}» и «{w}»')
            keys[k] = w
        out = os.path.join(HERE, lang)
        os.makedirs(out, exist_ok=True)
        todo = [k for k in sorted(keys) if args.force or not os.path.exists(os.path.join(out, f'{k}.mp3'))]
        voice = PiperVoice.load(os.path.join(args.voices, f'{VOICES[lang]}.onnx')) if todo else None
        with tempfile.TemporaryDirectory() as tmp:
            for i, k in enumerate(todo, 1):
                wav = os.path.join(tmp, f'{k}.wav')
                with wave.open(wav, 'wb') as wf:
                    voice.synthesize_wav(keys[k], wf, syn_config=config)
                encode(wav, os.path.join(out, f'{k}.mp3'))
                if i % 100 == 0:
                    print(f'{lang}: {i}/{len(todo)}')
        stale = [p for p in glob.glob(os.path.join(out, '*.mp3')) if os.path.basename(p)[:-4] not in keys]
        for p in stale:
            os.remove(p)
        print(f'{lang}: слов {len(keys)}, записано {len(todo)}, удалено {len(stale)}')


if __name__ == '__main__':
    main()
