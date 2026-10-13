# Сборка словаря из партий ИИ-черновика (LNG-S1-013, LNG-S1-018): каркас content/frequency +
# модули batch-*/<lang>_<pos>.py → content/dictionary/<lang>.<list>.json. Ранг, род и id — из
# каркаса; правильные формы ES — по правилам; rules ES — по написанию; пары — при наличии второй
# статьи. По умолчанию — слияние (D-1 LNG-S1-018): статья, уже лежащая в словаре, — источник
# истины после выверки автора и не меняется; добавляются только новые. --rebuild — пересборка
# всего словаря из черновиков (сотрёт выверку).
import csv, glob, importlib.util, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
LISTS = {'verb': 'verbs', 'noun': 'nouns', 'adj': 'adjectives', 'adv': 'adverbs'}
SRC = 'Черновик ИИ (D-25) на частотном каркасе wordhoard v0.1.0 (CC BY-SA 4.0, D-24): https://github.com/natema/wordhoard; см. content/frequency/NOTICE.md'

def load(name):
    # Одна лемма — в одной партии: повтор между партиями скорее ошибка, чем правка.
    merged = None
    for path in sorted(glob.glob(os.path.join(HERE, 'batch-*', f'{name}.py'))):
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        merged = merged or {}
        dup = merged.keys() & mod.V.keys()
        if dup: sys.exit(f'{name}: леммы уже в прошлой партии ({path}): {sorted(dup)}')
        merged.update(mod.V)
    return merged

def skeleton(lang, pos):
    with open(f'{ROOT}/frequency/{lang}.{pos}.csv') as f:
        return {r['lemma']: r for r in csv.DictReader(f)}

# --- испанский: правильное спряжение ----------------------------------------------------
END = {
    'ar': (['o', 'as', 'a', 'amos', 'áis', 'an'], ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'], 'ando', 'ado'),
    'er': (['o', 'es', 'e', 'emos', 'éis', 'en'], ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'], 'iendo', 'ido'),
    'ir': (['o', 'es', 'e', 'imos', 'ís', 'en'], ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'], 'iendo', 'ido'),
}

def es_regular(lemma):
    inf = lemma.replace('í', 'i')  # oír → oir для окончания; формы oír даются явно
    stem, cls = inf[:-2], inf[-2:]
    pres, pret, ger, part = END[cls]
    pret = [stem + e for e in pret]
    # Орфография 1-го лица pretérito: buscar → busqué, llegar → llegué, empezar → empecé.
    if cls == 'ar':
        yo = pret[0]
        if stem.endswith('c'): yo = stem[:-1] + 'qué'
        elif stem.endswith('g'): yo = stem[:-1] + 'gué'
        elif stem.endswith('z'): yo = stem[:-1] + 'cé'
        pret[0] = yo
    return {'present': [stem + e for e in pres], 'preterite': pret, 'gerund': stem + ger, 'participle': stem + part}

ACCENT_OFF = str.maketrans('áéíóú', 'aeiou')

def es_plural(noun):
    if noun.endswith('z'): return noun[:-1] + 'ces'
    if noun[-1] in 'aeiouáéó': return noun + 's'
    if noun[-1] in 'sx' and not noun[-2:] in ('és', 'ás', 'ís', 'ós', 'ús') and len(noun) > 3: return noun  # crisis
    # razón → razones, francés → franceses: ударение уходит со знака.
    m = re.search(r'([aeiou]?)([áéíóú])([nls])$', noun)
    # país → países: í/ú после гласной — зияние, знак остаётся.
    if m and not (m.group(1) and m.group(2) in 'íú'):
        return noun[:-2] + m.group(2).translate(ACCENT_OFF) + m.group(3) + 'es'
    return noun + 'es'

def es_adj(adj):
    if adj.endswith('o'):
        s = adj[:-1]
        return {'f': s + 'a', 'pl': s + 'os', 'fpl': s + 'as'}
    pl = es_plural(adj)
    return {'f': adj, 'pl': pl, 'fpl': pl}

def es_rules(lemma):
    r = []
    if 'ñ' in lemma: r.append('es-n-tilde')
    if re.search(r'c[eiéí]', lemma): r.append('es-c-before-e-i')
    if 'z' in lemma: r.append('es-z')
    if 'qu' in lemma: r.append('es-qu')
    if re.search(r'g[eiéí]', lemma) or 'gü' in lemma: r.append('es-g-before-e-i')
    if re.search(r'(^|[^c])h', lemma): r.append('es-h-silent')
    return r

# --- сборка ------------------------------------------------------------------------------
PRIORITY = ['verb', 'noun', 'adj', 'adv']

def word_ids(lang):
    # Лемма в нескольких частях речи: простой id — у первой по приоритету во всём каркасе,
    # у остальных — <лемма>-<часть речи>. Каркас фиксирован, поэтому id стабильны между партиями.
    owner = {}
    for pos in PRIORITY:
        for lemma in skeleton(lang, pos):
            owner.setdefault(lemma, pos)
    return lambda lemma, pos: lemma if owner[lemma] == pos else f'{lemma}-{pos}'

def build_entry(lang, pos, lemma, sk, d, wid):
    e = {'id': wid(lemma, pos), 'lemma': lemma, 'pos': pos, 'rank': int(sk['rank'])}
    if d.get('irr'): e['irregular'] = True
    if lang == 'es' and pos == 'noun': e['gender'] = sk['gender']
    if d.get('ipa'): e['ipa'] = d['ipa']
    if lang == 'es':
        rules = es_rules(lemma)
        if rules: e['rules'] = rules
    e['translations'] = {'ru': d['tr'], **d.get('trx', {})}
    forms = {}
    if lang == 'es' and pos == 'verb': forms = es_regular(lemma)
    if lang == 'es' and pos == 'noun' and not d.get('noplural'): forms = {'plural': es_plural(lemma)}
    if lang == 'es' and pos == 'adj' and not d.get('noforms'): forms = es_adj(lemma)
    forms.update(d.get('F', {}))
    if forms: e['forms'] = forms
    if d.get('topics'): e['topics'] = d['topics']
    e['examples'] = [{lang: s, 'ru': ru, 'topic': t} for s, ru, t in d['ex']]
    if d.get('note'): e['note'] = {'ru': d['note']}
    if d.get('pair'): e['pair'] = d['pair']
    e['ext'] = {'draft': True}
    order = ['id', 'lemma', 'pos', 'rank', 'irregular', 'gender', 'ipa', 'rules', 'translations', 'pair', 'forms', 'topics', 'examples', 'note', 'ext']
    return {k: e[k] for k in order if k in e}

ORDER = ['id', 'lemma', 'pos', 'rank', 'irregular', 'gender', 'ipa', 'rules', 'translations', 'pair', 'forms', 'topics', 'examples', 'note', 'ext']

def existing(lang, name):
    path = f'{ROOT}/dictionary/{lang}.{name}.json'
    if not os.path.exists(path): return []
    with open(path) as f: return json.load(f)['entries']

def main():
    rebuild = '--rebuild' in sys.argv[1:]
    kept = {} if rebuild else {(lang, name): existing(lang, name) for lang in ('es', 'en') for name in LISTS.values()}
    kept_ids = {(lang, e['id']) for (lang, _), es in kept.items() for e in es}
    built = {}
    for lang in ('es', 'en'):
        for pos, name in LISTS.items():
            data = load(f'{lang}_{pos}')
            if data is None: continue
            sk = skeleton(lang, pos)
            wid = word_ids(lang)
            missing = [l for l in data if l not in sk]
            if missing: sys.exit(f'{lang}.{pos}: нет в каркасе: {missing}')
            entries = [build_entry(lang, pos, l, sk[l], d, wid) for l, d in data.items()]
            # Слияние: черновик статьи, уже лежащей в словаре, не применяется.
            built[(lang, name)] = [e for e in entries if (lang, e['id']) not in kept_ids]
    ids = {f'{lang}:{e["id"]}' for (lang, _), es in [*built.items(), *kept.items()] for e in es}
    for entries in built.values():
        for e in entries:
            if 'pair' in e and e['pair'] not in ids: del e['pair']
    # Обратные пары ES → EN: из английских статей, ссылающихся на испанскую, — той же части
    # речи и самая частотная (say/tell → decir: say). Только у новых статей.
    back = {}
    for (lang, _), entries in [*kept.items(), *built.items()]:
        if lang != 'en': continue
        for e in entries:
            if 'pair' in e: back.setdefault(e['pair'], []).append(e)
    for (lang, _), entries in built.items():
        if lang != 'es': continue
        for e in entries:
            cands = back.get(f'es:{e["id"]}', [])
            if 'pair' in e or not cands: continue
            best = min(cands, key=lambda c: (c['pos'] != e['pos'], c['rank']))
            e['pair'] = f'en:{best["id"]}'
            # Порядок ключей как в спецификации: pair перед forms.
            e_sorted = {k: e[k] for k in ORDER if k in e}
            e.clear(); e.update(e_sorted)
    for key in sorted(set(built) | set(kept)):
        lang, name = key
        added = built.get(key, [])
        old = kept.get(key, [])
        if not added and not rebuild: continue
        entries = sorted([*old, *added], key=lambda e: e['rank'])
        doc = {'format': '2lang/dictionary', 'version': 1, 'lang': lang, 'license': 'cc-by-sa', 'source': SRC, 'entries': entries}
        path = f'{ROOT}/dictionary/{lang}.{name}.json'
        if os.path.exists(path) and not rebuild:
            with open(path) as f: prev = json.load(f)
            doc = {**prev, 'entries': entries}  # заголовок файла — тоже выверка автора
        with open(path, 'w') as f:
            f.write(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
        print(f'✓ {lang}.{name}.json — {len(entries)} (+{len(added)})')

if __name__ == '__main__':
    main()
