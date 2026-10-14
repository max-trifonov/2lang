# Генератор уроков грамматики из компактных описаний (LNG-S1-033, D-38):
# en.txt / es.txt → content/lessons/<lang>-grammar-NN.json; затем отсылки уроков слов к правилам (link.py).
#
# Блок урока (порядок строк внутри блока — свободный, кроме упражнений: они идут в порядке записи):
#   === <номер> <уровень> <раздел>        — номер = order и код программы (ES-7), раздел — GRAMMAR_SECTIONS
#   title: ru | en | es
#   words: id id                         — необяз.: слова-условие открытия темы (из уроков слов, D-14)
#   see: 8 9                             — необяз.: связанные темы того же языка (номера)
#   p: оригинал | ru                     — паттерн, 3–4 примера
#   formula: …                           — формула правила
#   rule: ru | en | es                   — правило, 1–3 фразы
#   table: шапка | шапка …  /  row: ячейка | ячейка …
#   time: past-now | ru | en | es        — отрезок линии времени (from[-until])
#   bridge: <номер в другом языке> | формула | пример | ru | заметка ru
#   tf: утверждение || negative = ответ / вариант || question = ответ
#   choose: предложение с ___ | вариант, вариант | ответ | ru
#   fill: предложение с ___ | ответ / вариант | ru
#   build: предложение | ru | лишний,блок
#   compose: ru | en | es || шаблон || образец / образец
# Варианты ответа разделяются « / » (с пробелами).
# Запуск: python3 content/drafts/grammar/gen.py   (перезаписывает уроки грамматики из описаний).
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'lessons')
sys.path.insert(0, HERE)
import link  # noqa: E402

SECTIONS = {'sentence', 'verbs', 'tenses', 'modals', 'nouns', 'adjectives', 'pronouns'}
FORMS = {'negative', 'question', 'wh-question', 'imperative', 'polite', 'past', 'future'}
POINTS = {'past', 'now', 'future'}
OTHER = {'en': 'es', 'es': 'en'}


def die(msg):
    sys.exit(msg)


def split(v, n=None, where=''):
    parts = [x.strip() for x in v.split('|')]
    if n is not None and len(parts) != n:
        die(f'{where}: ожидается {n} полей через |, а не {len(parts)}: {v}')
    return parts


def alts(v):
    out = [a.strip() for a in v.split(' / ') if a.strip()]
    return out[0] if len(out) == 1 else out


def lesson_id(lang, order):
    return f'{lang}-grammar-{order:02d}'


def dictionary(lang):
    ids = set()
    for name in ('verbs', 'nouns', 'adjectives', 'adverbs'):
        with open(f'{ROOT}/dictionary/{lang}.{name}.json', encoding='utf8') as f:
            ids |= {e['id'] for e in json.load(f)['entries']}
    return ids


def lesson_words(lang):
    """Слова уроков слов языка: условие открытия темы должно быть достижимо (D-14)."""
    out = set()
    for name in os.listdir(OUT):
        if name.startswith(f'{lang}-') and name.endswith('.json'):
            with open(os.path.join(OUT, name), encoding='utf8') as f:
                d = json.load(f)
            if d.get('kind') == 'words':
                out |= set(d['words'])
    return out


def parse(lang):
    blocks, cur = [], None
    with open(os.path.join(HERE, f'{lang}.txt'), encoding='utf8') as f:
        for n, raw in enumerate(f, 1):
            line = raw.rstrip('\n')
            if not line.strip() or line.lstrip().startswith('#'):
                continue
            if line.startswith('==='):
                order, level, section = line[3:].split()
                cur = {'order': int(order), 'level': level, 'section': section, 'items': [], 'line': n}
                blocks.append(cur)
                continue
            if cur is None:
                die(f'{lang}.txt:{n}: строка вне блока')
            key, _, val = line.partition(':')
            cur['items'].append((key.strip(), val.strip(), n))
    return blocks


def build(lang, b, known, reachable):
    order = b['order']
    lid = lesson_id(lang, order)
    where = f'{lang}.txt {lid}'
    if b['section'] not in SECTIONS:
        die(f'{where}: незнакомый раздел {b["section"]}')
    d = {
        'format': '2lang/lesson', 'version': 1, 'id': lid, 'lang': lang, 'kind': 'grammar',
        'section': b['section'], 'code': f'{lang.upper()}-{order}', 'order': order, 'level': b['level'],
    }
    pattern, rule, table, timeline, bridges, exercises = [], {}, None, [], [], []
    for key, val, n in b['items']:
        at = f'{lang}.txt:{n}'
        if key == 'title':
            ru, en, es = split(val, 3, at)
            d['title'] = {'ru': ru, 'en': en, 'es': es}
        elif key == 'words':
            words = val.split()
            bad = [w for w in words if w not in known or w not in reachable]
            if bad:
                die(f'{at}: слов нет в словаре или ни в одном уроке слов: {bad}')
            d['words'] = words
        elif key == 'see':
            d['see'] = [lesson_id(lang, int(x)) for x in val.split()]
        elif key == 'p':
            o, ru = split(val, 2, at)
            pattern.append({lang: o, 'ru': ru})
        elif key == 'formula':
            rule['formula'] = val
        elif key == 'rule':
            ru, en, es = split(val, 3, at)
            rule['text'] = {'ru': ru, 'en': en, 'es': es}
        elif key == 'table':
            table = {'head': split(val), 'rows': []}
        elif key == 'row':
            if table is None:
                die(f'{at}: row до table')
            row = split(val)
            if len(row) != len(table['head']):
                die(f'{at}: в строке {len(row)} ячеек, в шапке {len(table["head"])}')
            table['rows'].append(row)
        elif key == 'time':
            span, ru, en, es = split(val, 4, at)
            ends = span.split('-')
            if any(e not in POINTS for e in ends):
                die(f'{at}: отрезок из past/now/future: {span}')
            seg = {'from': ends[0]}
            if len(ends) > 1:
                seg['until'] = ends[1]
            seg['label'] = {'ru': ru, 'en': en, 'es': es}
            timeline.append(seg)
        elif key == 'bridge':
            other, formula, ex, ex_ru, note = split(val, 5, at)
            blang = OTHER[lang]
            br = {'lang': blang}
            if other:
                br['lesson'] = lesson_id(blang, int(other))
            br['formula'] = formula
            br['examples'] = [{blang: ex, 'ru': ex_ru}]
            if note:
                br['note'] = {'ru': note}
            bridges.append(br)
        elif key == 'tf':
            src, *forms = [x.strip() for x in val.split('||')]
            into = []
            for f in forms:
                form, _, ans = f.partition('=')
                form = form.strip()
                if form not in FORMS:
                    die(f'{at}: незнакомая форма {form}')
                into.append({'form': form, 'answer': alts(ans)})
            exercises.append({'type': 'transform', lang: src, 'into': into})
        elif key == 'choose':
            s, opts, ans, ru = split(val, 4, at)
            options = [o.strip() for o in opts.split(',')]
            if ans not in options:
                die(f'{at}: ответа {ans} нет среди вариантов')
            exercises.append({'type': 'choose', lang: s, 'options': options, 'answer': ans, 'ru': ru})
        elif key == 'fill':
            s, ans, ru = split(val, 3, at)
            if s.count('___') != 1:
                die(f'{at}: нужен ровно один ___')
            exercises.append({'type': 'fill', lang: s, 'answer': alts(ans), 'ru': ru})
        elif key == 'build':
            p = split(val, None, at)
            ex = {'type': 'build', lang: p[0], 'ru': p[1]}
            if len(p) > 2 and p[2]:
                ex['extra'] = [x.strip() for x in p[2].split(',')]
            exercises.append(ex)
        elif key == 'compose':
            prompt, template, sample = [x.strip() for x in val.split('||')]
            ru, en, es = split(prompt, 3, at)
            ex = {'type': 'compose', 'prompt': {'ru': ru, 'en': en, 'es': es}}
            if template:
                ex['template'] = template
            ex['sample'] = alts(sample)
            exercises.append(ex)
        else:
            die(f'{at}: незнакомый ключ {key}')
    if 'title' not in d or 'text' not in rule:
        die(f'{where}: нужны title и rule')
    if not 3 <= len(pattern) <= 4:
        die(f'{where}: в паттерне {len(pattern)} примеров, нужно 3–4')
    if table:
        rule['table'] = table
    if timeline:
        rule['timeline'] = timeline
    # Порядок ключей правила — как в формате: text, formula, table, timeline.
    d['pattern'] = pattern
    d['rule'] = {k: rule[k] for k in ('text', 'formula', 'table', 'timeline') if k in rule}
    if bridges:
        d['bridge'] = bridges
    d['exercises'] = exercises
    d['ext'] = {'draft': True}
    return d


def main():
    all_ids = {}
    out = []
    for lang in ('en', 'es'):
        known, reachable = dictionary(lang), lesson_words(lang)
        blocks = parse(lang)
        orders = [b['order'] for b in blocks]
        if len(set(orders)) != len(orders):
            die(f'{lang}.txt: повтор номера темы')
        for b in blocks:
            d = build(lang, b, known, reachable)
            out.append(d)
            all_ids[d['id']] = d
    for d in out:
        refs = list(d.get('see', [])) + [b['lesson'] for b in d.get('bridge', []) if 'lesson' in b]
        missing = [r for r in refs if r not in all_ids]
        if missing:
            die(f'{d["id"]}: отсылки на несуществующие темы {missing}')
    # Старые уроки грамматики, которых больше нет в описаниях, удаляются: id занят описанием.
    for name in os.listdir(OUT):
        if '-grammar-' in name and name[:-5] not in all_ids:
            os.remove(os.path.join(OUT, name))
    for d in out:
        with open(os.path.join(OUT, d['id'] + '.json'), 'w', encoding='utf8') as f:
            f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print(f'уроков грамматики записано: {len(out)}')
    link.main()


if __name__ == '__main__':
    main()
