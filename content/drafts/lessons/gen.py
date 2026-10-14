# Генератор уроков слов из компактных описаний (LNG-S1-032): en.txt / es.txt → content/lessons/<id>.json.
# Блок урока:
#   === <тема> <номер> <уровень>
#   title: ru | en | es            — название
#   words: id id id                — статьи словаря языка урока
#   phrase: оригинал | ru | перевод на третий язык
#   rule: ru | en | es             — мини-правило
#   ex: оригинал | ru              — пример к правилу (2 шт.)
#   fill: предложение с ___ | ответ[/вариант] | ru
#   build: предложение | ru | лишний,блок
#   tr: ru | ответ / ответ
# Запуск: python3 content/drafts/lessons/gen.py   (перезаписывает только уроки из описаний).
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'lessons')

def dictionary(lang):
    ids = set()
    for name in ('verbs', 'nouns', 'adjectives', 'adverbs'):
        with open(f'{ROOT}/dictionary/{lang}.{name}.json', encoding='utf8') as f:
            ids |= {e['id'] for e in json.load(f)['entries']}
    return ids

def split(v): return [x.strip() for x in v.split('|')]

def build(lang, topic, num, level, f):
    third = 'es' if lang == 'en' else 'en'
    t, ph, rl = split(f['title'][0]), split(f['phrase'][0]), split(f['rule'][0])
    if len(t) != 3 or len(ph) != 3 or len(rl) != 3:
        sys.exit(f'{lang}-{topic}-{num:02d}: title/phrase/rule — по три поля')
    ex = []
    for e in f.get('ex', []):
        o, ru = split(e)
        ex.append({lang: o, 'ru': ru})
    exercises = []
    for kind, v in f['_order']:
        p = split(v)
        if kind == 'fill':
            ans = [a.strip() for a in p[1].split('/')]
            exercises.append({'type': 'fill', lang: p[0], 'answer': ans[0] if len(ans) == 1 else ans, 'ru': p[2]})
        elif kind == 'build':
            d = {'type': 'build', lang: p[0], 'ru': p[1]}
            if len(p) > 2 and p[2]: d['extra'] = [x.strip() for x in p[2].split(',')]
            exercises.append(d)
        elif kind == 'tr':
            exercises.append({'type': 'translate', 'ru': p[0], 'answer': [a.strip() for a in p[1].split('/')]})
    return {
        'format': '2lang/lesson', 'version': 1, 'id': f'{lang}-{topic}-{num:02d}', 'lang': lang, 'kind': 'words',
        'topic': topic, 'order': num, 'level': level,
        'title': {'ru': t[0], 'en': t[1], 'es': t[2]},
        'words': f['words'][0].split(),
        'phrase': {lang: ph[0], 'ru': ph[1], third: ph[2]},
        'rule': {'text': {'ru': rl[0], 'en': rl[1], 'es': rl[2]}, 'examples': ex},
        'exercises': exercises,
        'ext': {'draft': True},
    }

def main():
    n = 0
    for lang in ('en', 'es'):
        path = os.path.join(HERE, f'{lang}.txt')
        if not os.path.exists(path): continue
        known = dictionary(lang)
        blocks, cur = [], None
        for raw in open(path, encoding='utf8'):
            line = raw.rstrip('\n')
            if not line.strip() or line.startswith('#'): continue
            if line.startswith('==='):
                topic, num, level = line[3:].split()
                cur = dict(head=(topic, int(num), level), _order=[])
                blocks.append(cur)
                continue
            key, _, val = line.partition(':')
            val = val.strip()
            if key in ('fill', 'build', 'tr'): cur['_order'].append((key, val))
            cur.setdefault(key, []).append(val)
        for b in blocks:
            topic, num, level = b['head']
            data = build(lang, topic, num, level, b)
            missing = [w for w in data['words'] if w not in known]
            if missing: sys.exit(f"{data['id']}: нет в словаре: {missing}")
            with open(os.path.join(OUT, data['id'] + '.json'), 'w', encoding='utf8') as f:
                f.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
            n += 1
    print(f'уроков записано: {n}')

if __name__ == '__main__':
    main()
