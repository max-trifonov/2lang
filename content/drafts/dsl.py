# Компактная запись черновиков словаря (партия 4, LNG-S1-032): одна строка = одна статья.
#   лемма | перевод | пример | перевод примера | тема | опции | заметка
# Опции — токены через пробел (без пробелов внутри), см. parse(). Формы, которые можно вывести
# по правилам, строит код; исключения задаются опциями. Выверка — в content/dictionary/ (D-28).
import re

# --- испанский: правильное спряжение (используют и build.py) -------------------------------
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

def _swap_last(stem, a, b):
    i = stem.rfind(a)
    return stem[:i] + b + stem[i + len(a):] if i >= 0 else stem

def es_verb_forms(lemma, tags):
    """Формы неправильного глагола ES по тегам; всё, чего нет, — по правилам."""
    base = es_regular(lemma)
    pres, pret = list(base['present']), list(base['preterite'])
    stem, cls = lemma[:-2], lemma[-2:]
    F = {}
    for t in tags:
        key, _, val = t.partition('=')
        if t in ('ie', 'ue', 'i', 'ie-i', 'ue-u'):
            a, b = {'ie': ('e', 'ie'), 'ue': ('o', 'ue'), 'i': ('e', 'i'), 'ie-i': ('e', 'ie'), 'ue-u': ('o', 'ue')}[t]
            if lemma.startswith('jug'): a = 'u'
            for k in (0, 1, 2, 5):
                pres[k] = _swap_last(stem, a, b) + END[cls][0][k]
            if t in ('i', 'ie-i', 'ue-u'):  # глаголы на -ir: 3-е лицо pretérito и gerundio
                c, d = ('o', 'u') if t == 'ue-u' else ('e', 'i')
                ch = _swap_last(stem, c, d)
                pret[2], pret[5] = ch + 'ió', ch + 'ieron'
                F['gerund'] = ch + 'iendo'
        elif t == 'zco':
            pres[0] = (stem[:-1] if stem.endswith('c') else stem) + 'zco'
        elif t == 'jo':
            pres[0] = stem[:-1] + 'jo'
        elif t == 'uy':
            for k in (0, 1, 2, 5):
                pres[k] = stem + ('yo', 'yes', 'ye', '', '', 'yen')[k]
            pret[2], pret[5] = stem + 'yó', stem + 'yeron'
            F['gerund'] = stem + 'yendo'
        elif t == 'ey':
            pret = [stem + e for e in ('í', 'íste', 'yó', 'ímos', 'ísteis', 'yeron')]
            F['gerund'] = stem + 'yendo'
            F['participle'] = stem + 'ído'
        elif t == 'uml':
            pret[0] = stem[:-2] + 'güé'
        elif key == 'yo': pres[0] = val
        elif key == 'pres': pres = val.split(',')
        elif key == 'pret': pret = val.split(',')
        elif key == 'ger': F['gerund'] = val
        elif key == 'part': F['participle'] = val
        elif key == 'imp': F['imperfect'] = val.split(',')
        else: raise SystemExit(f'es verb {lemma}: неизвестная опция {t}')
    F['present'], F['preterite'] = pres, pret
    return F

# --- английский: формы по правилам ---------------------------------------------------------
VOW = 'aeiou'

def en_s(w):
    if re.search(r'(s|x|z|ch|sh|o)$', w): return w + 'es'
    if re.search(r'[^aeiou]y$', w): return w[:-1] + 'ies'
    return w + 's'

def en_ed(w, dbl=False):
    if w.endswith('e'): return w + 'd'
    if re.search(r'[^aeiou]y$', w): return w[:-1] + 'ied'
    return w + (w[-1] if dbl else '') + 'ed'

def en_ing(w, dbl=False):
    if w.endswith('ie'): return w[:-2] + 'ying'
    if w.endswith('e') and not w.endswith(('ee', 'ye')): return w[:-1] + 'ing'
    return w + (w[-1] if dbl else '') + 'ing'

def en_er(w, dbl=False):
    if w.endswith('e'): return w + 'r', w + 'st'
    if re.search(r'[^aeiou]y$', w): return w[:-1] + 'ier', w[:-1] + 'iest'
    d = w[-1] if dbl else ''
    return w + d + 'er', w + d + 'est'

# --- разбор строк ---------------------------------------------------------------------------
def parse(text, lang, pos):
    out = {}
    for n, line in enumerate(text.strip().splitlines(), 1):
        line = line.strip()
        if not line or line.startswith('#'): continue
        f = [x.strip() for x in line.split('|')]
        if len(f) < 5: raise SystemExit(f'{lang}.{pos} строка {n}: меньше 5 полей: {line[:60]}')
        lemma, tr, ex, exru, topic = f[:5]
        opts = f[5].split() if len(f) > 5 and f[5] else []
        d = dict(tr=tr, ex=[(ex, exru, topic)])
        if len(f) > 6 and f[6]: d['note'] = f[6]
        kv = {}
        tags = []
        for o in opts:
            k, eq, v = o.partition('=')
            if eq and k in ('pair', 'lvl', 'irr', 'pl', 'cmp', 'fm', 'fpl'): kv[k] = v
            else: tags.append(o)
        if 'pair' in kv: d['pair'] = ('es:' if lang == 'en' else 'en:') + kv['pair']
        if 'lvl' in kv: d['lvl'] = kv['lvl']
        if lang == 'en':
            if pos == 'verb':
                dbl = 'dbl' in tags
                if 'modal' in tags: pass
                else:
                    if 'irr' in kv:
                        past, part = kv['irr'].split('/')
                        d['irr'] = 1
                        past, part = past.replace(',', ' / '), part.replace(',', ' / ')
                    else:
                        past = part = en_ed(lemma, dbl)
                    d['F'] = dict(s=en_s(lemma), past=past, participle=part, ing=en_ing(lemma, dbl))
            elif pos == 'noun' and 'nopl' not in tags:
                d['F'] = dict(plural=kv.get('pl') or en_s(lemma))
            elif pos == 'adj' and ('er' in tags or 'cmp' in kv or 'more' in tags):
                if 'cmp' in kv: c, s = kv['cmp'].split('/')
                elif 'more' in tags: c, s = 'more ' + lemma, 'most ' + lemma
                else: c, s = en_er(lemma, 'dbl' in tags)
                d['F'] = dict(comparative=c, superlative=s)
        else:
            if pos == 'verb':
                vt = [t for t in tags if t != 'irr']
                if vt:
                    d['irr'] = 1
                    d['F'] = es_verb_forms(lemma, vt)
                    # правильные формы сборка выведет сама; здесь оставляем только исключения
                    reg = es_regular(lemma)
                    d['F'] = {k: v for k, v in d['F'].items() if v != reg[k]}
                    if not d['F']: del d['F']
            elif pos == 'noun':
                if 'np' in tags: d['noplural'] = 1
                if 'pl' in kv: d['F'] = dict(plural=kv['pl'])
            elif pos == 'adj':
                if 'nf' in tags: d['noforms'] = 1
                if 'fm' in kv:
                    d['F'] = dict(f=kv['fm'], pl=kv.get('pl', ''), fpl=kv.get('fpl', ''))
                    d['F'] = {k: v for k, v in d['F'].items() if v}
        out[lemma] = d
    return out
