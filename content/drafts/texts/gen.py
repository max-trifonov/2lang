# Генератор текстов из компактных описаний (LNG-S1-032): texts.txt → content/texts/<id>.<lang>.json.
#   === id | kind | lang | название | название ru | название на мосту | автор | год | уровень | теги через запятую
#   note: ru | en | es           — комментарий к тексту (необязательно)
#   S: [id] [type]               — начало строфы
#   R: id                        — повтор объявленной строфы
#   L: оригинал | ru | мост      — строка (мост: en для ES-текстов, es для EN-текстов)
#   P: фрагмент | ru | мост | заметка ru    — фраза к последней строке
#   N: заметка ru                — заметка к последней строке
# Только public-domain (D-5).
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'texts'))

def sp(v): return [x.strip() for x in v.split('|')]

def main():
    texts, cur, st = [], None, None
    for raw in open(os.path.join(HERE, 'texts.txt'), encoding='utf8'):
        line = raw.rstrip('\n')
        if not line.strip() or line.startswith('#'): continue
        if line.startswith('==='):
            f = sp(line[3:])
            id_, kind, lang, t, tru, tbr, author, year, level, tags = f
            bridge = 'en' if lang == 'es' else 'es'
            cur = {'format': '2lang/text', 'version': 1, 'id': id_, 'kind': kind, 'lang': lang, 'license': 'public-domain',
                   'title': {lang: t, 'ru': tru, bridge: tbr}, 'author': author}
            if year: cur['year'] = int(year)
            cur['level'] = level
            cur['tags'] = [x.strip() for x in tags.split(',')]
            cur['stanzas'] = []
            cur['_bridge'] = bridge
            texts.append(cur)
            continue
        key, _, val = line.partition(':')
        val = val.strip()
        lang, bridge = cur['lang'], cur['_bridge']
        if key == 'note':
            r = sp(val)
            cur['note'] = {'ru': r[0], 'en': r[1], 'es': r[2]} if len(r) == 3 else {'ru': r[0]}
        elif key == 'S':
            toks = val.split()
            st = {}
            for t in toks:
                if t in ('verse', 'chorus', 'bridge', 'intro', 'outro') and 'type' not in st: st['type'] = t
                else: st['id'] = t
            st['lines'] = []
            cur['stanzas'].append(st)
        elif key == 'R':
            cur['stanzas'].append({'ref': val})
        elif key == 'L':
            o, ru, br = sp(val)
            st['lines'].append({lang: o, 'ru': ru, bridge: br})
        elif key == 'P':
            p = sp(val)
            d = {lang: p[0], 'ru': p[1], bridge: p[2]}
            if len(p) > 3 and p[3]: d['note'] = {'ru': p[3]}
            st['lines'][-1].setdefault('phrases', []).append(d)
        elif key == 'N':
            st['lines'][-1]['note'] = {'ru': val}
        else:
            sys.exit(f'неизвестный ключ: {line}')
    for t in texts:
        del t['_bridge']
        # порядок ключей как в формате: note перед stanzas
        stanzas = t.pop('stanzas')
        if 'note' in t: t['note'] = t.pop('note')
        t['stanzas'] = stanzas
        path = os.path.join(OUT, f"{t['id']}.{t['lang']}.json")
        with open(path, 'w', encoding='utf8') as f:
            f.write(json.dumps(t, ensure_ascii=False, indent=2) + '\n')
    print(f'текстов записано: {len(texts)}')

if __name__ == '__main__':
    main()
