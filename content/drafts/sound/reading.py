# Подсказки чтения в карточке слова (D-48): какие правила уроков звучания касаются леммы.
# Используют build.py (новые статьи) и запуск этого файла (дописать правила в готовый словарь:
# существующие id не трогаем, недостающие добавляем в конец).
# Запуск: python3 content/drafts/sound/reading.py
import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

ES = [
    ('es-n-tilde', r'ñ'),
    ('es-c-before-e-i', r'c[eiéí]'),
    ('es-z', r'z'),
    ('es-qu', r'qu'),
    ('es-g-before-e-i', r'g[eiéí]|gü'),
    ('es-h-silent', r'(^|[^c])h'),
    ('es-ch', r'ch'),
    ('es-ll-y', r'll|y[aeiouáéíóú]'),
    ('es-r-rr', r'rr|^r|[nls]r'),
    ('es-b-v', r'v'),
    ('es-stress-tilde', r'[áéíóú]'),
]

EN = [
    ('en-th', r'th'),
    ('en-sh-ch', r'sh|ch'),
    ('en-ph', r'ph'),
    ('en-ck', r'ck'),
    ('en-ng', r'ng$|ng[^aeiouy]'),
    ('en-igh', r'igh'),
    ('en-tion', r'[ts]ion'),
    ('en-silent-letters', r'^kn|^wr|mb$|alk|ould|^hour|^honest|stle|sten$'),
    ('en-ee-ea', r'ee|ea'),
    ('en-oo', r'oo'),
    ('en-ai-ay', r'ai|ay'),
    ('en-oa-ow', r'oa|ow'),
    ('en-oi-oy', r'oi|oy|au|aw'),
    ('en-open-syllable', r'^[^aeiouy]*[aeiouy][^aeiouywx]e$'),
    ('en-c-g-soft', r'c[eiy]|^g[eiy](?!t|v|r|ve)|ge$'),
]

# Слова-исключения: правило к ним не подходит, подсказка только запутает.
EXCEPT = {
    'en-open-syllable': {'have', 'give', 'live', 'come', 'some', 'done', 'one', 'gone', 'love', 'move',
                         'lose', 'whose', 'none', 'above', 'were', 'there', 'where', 'are', 'glove',
                         'shove', 'dove', 'prove', 'once'},
}

RULES = {'es': [(r, re.compile(p)) for r, p in ES], 'en': [(r, re.compile(p)) for r, p in EN]}


def rules_for(lang, lemma):
    word = lemma.lower()
    return [r for r, rx in RULES[lang] if rx.search(word) and word not in EXCEPT.get(r, ())]


def main():
    added = 0
    for name in sorted(os.listdir(os.path.join(ROOT, 'dictionary'))):
        path = os.path.join(ROOT, 'dictionary', name)
        with open(path, encoding='utf8') as f:
            d = json.load(f)
        for e in d['entries']:
            have = list(e.get('rules', []))
            new = [r for r in rules_for(d['lang'], e['lemma']) if r not in have]
            if not new:
                continue
            added += len(new)
            # Порядок ключей статьи: rules — на своём месте, если был; иначе перед translations.
            rules = have + new
            if 'rules' in e:
                e['rules'] = rules
            else:
                body = {}
                for k, v in e.items():
                    if k == 'translations':
                        body['rules'] = rules
                    body[k] = v
                body.setdefault('rules', rules)
                e.clear()
                e.update(body)
        with open(path, 'w', encoding='utf8') as f:
            f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print(f'подсказок чтения добавлено: {added}')


if __name__ == '__main__':
    main()
