# Отсылки уроков слов к правилам грамматики (LNG-S1-033, D-38): поле `see` уроков слов.
# Эвристика: каждой теме — шаблоны конструкции; совпадение в мини-правиле весит 3, во фразе дня — 2,
# в примерах и упражнениях — 1; общие темы (отрицание, вопрос…) вне мини-правила — вполовину. В `see` — до 3 тем
# с весом ≥ 2, самые весомые первыми. Ручную правку `see` перезапуск сотрёт — правьте шаблоны.
# Запуск: python3 content/drafts/grammar/link.py   (вызывается и из gen.py).
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'lessons')
MAX_REFS = 3
THRESHOLD = 2

I = re.IGNORECASE

# (номер темы, шаблон по тексту (оригинал и правило), общая тема)
ES = [
    (27, r"\b(he|has|ha|hemos|habéis|han)\s+(ya\s+)?\w+(ado|ido|cho|sto|rto|elto|ito)\b|haber \+|perfecto", False),
    (31, r"\b(fui|fuiste|fue|fuimos|fueron|tuve|tuvo|tuvimos|hice|hizo|hicimos|estuve|estuvo|pude|pudo|vine|vino|dije|dijo)\b", False),
    (30, r"\b\w{2,}(aste|asteis|aron|ieron|iste)\b|indefinido|\bayer\b|pasad[oa]\b", False),
    (21, r"\b(voy|vas|va|vamos|vais|van) a \w+(ar|er|ir)\b|ir a \+", False),
    (20, r"\b(tengo|tienes|tiene|tenemos|tenéis|tienen|tener) que\b|\bhay que\b|\bdeb(o|es|e|emos|éis|en|er)\b", False),
    (34, r"\b(gustaría|podría|podrías|podríamos|deberías|debería|querría)\b|condicional", False),
    (19, r"\b(quiero|quieres|quiere|queremos|quieren|puedo|puedes|puede|podemos|pueden|necesito|necesitas|necesita|necesitamos|necesitan) (\w+(ar|er|ir)(me|te|se|lo|la|nos)?)\b", False),
    (22, r"\b(gusta|gustan|encanta|encantan|interesa|interesan|duele|duelen)\b|gustar", False),
    (23, r"\b(me|te|se|nos|os) (llam\w+|levant\w+|qued\w+|duch\w+|sient\w+|vest\w+|acuest\w+|despiert\w+)\b|\b\w+(arse|erse|irse)\b|возвратн", False),
    (24, r"\b(estoy|estás|está|estamos|estáis|están|estaba|estaban) \w+(ando|iendo|yendo)\b|герунди", False),
    (26, r"\blo / la\b|\ble / les\b|местоимени\w* .{0,20}(дополн|кому)", False),
    (28, r"повелит|imperativ|^(Pulse|Gire|Abre|Cierra|Ven|Dime|Llama|Pon|Haz|Toma|Sigue|Escribe|Mira|Espera|Firme|Pase)\b", False),
    (29, r"\b(más|menos) \w+ que\b|\btan \w+ como\b|\b(mejor|peor|mayor|menor)\b|сравн", False),
    (33, r"\b\w+(aré|eré|iré|arás|erás|irás|aremos|eremos|iremos|arán|erán|irán)\b|\b(tendr|vendr|saldr|podr|sabr)(é|á|ás|emos|án)\b|\bhar(é|á|ás|emos|án)\b|futuro simple", False),
    (6, r"\bhay\b(?! que)", False),
    (13, r"согласу|женск\w* род|contento / contenta|-o / -a", False),
    (2, r"артикл|\bel / la\b|\bun / una\b|род[ау]?\b.{0,20}(el|la)\b", False),
    (3, r"множествен|мн\. ?ч", False),
    (7, r"\bcerca de\b|\blejos de\b|предлог|\ba las \+|\bde \w+ a \w+\b", False),
    (25, r"\b\w+mente\b|наречи", False),
    (32, r"\b(porque|cuando|aunque)\b|\bsi\b(?!\w)", True),
    (35, r"\b(mucho|mucha|muchos|muchas|poco|poca|pocos|pocas|demasiad\w+|bastante|algún|alguna|ningún|ninguna)\b", True),
    (5, r"\b(estoy|estás|está|estamos|estáis|están)\b|\bestar\b", True),
    (4, r"\b(soy|eres|somos|sois)\b|\bser\b", True),
    (16, r"\b(tengo|hago|salgo|pongo|vengo|digo)\b", True),
    (17, r"\b(quiero|quieres|quiere|quieren|puedo|puedes|puede|pueden|pido|pides|pide|piden|empieza|empiezo|empiezan|entiendo|entiende|vuelvo|vuelve|duermo|juego|juega|cuesta|encuentro)\b", True),
    (18, r"\b(voy|vas|vamos|van|sé|sabes|sabe|conozco|conoces|conoce)\b", True),
    (15, r"\b(este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|esto|eso)\b", True),
    (14, r"\b(mis|tus|sus|nuestro|nuestra|nuestros|nuestras)\b|притяж", True),
    (12, r"¿\s*(qué|dónde|adónde|cuándo|cómo|cuánto|cuánta|cuántos|cuántas|quién|quiénes|por qué|cuál|a qué)\b", True),
    (11, r"¿(?!\s*(qué|dónde|adónde|cuándo|cómo|cuánt\w+|quién\w*|por qué|cuál|a qué)\b)", True),
    (10, r"\bno\b|\bnunca\b|\bnadie\b|\bnada\b|\btampoco\b|отрицан", True),
]

EN = [
    (38, r"\b(have|has|'ve|'s) been \w+ing\b", False),
    (29, r"\b(have|has|haven't|hasn't)( just| already| never| ever| not)? (\w+ed|done|been|gone|seen|made|written|taken|given|got|found|lost|left|bought|sent|heard|known|met|broken|forgotten|eaten|spent|paid)\b|\b\w+'ve (just |already |never )?\w+\b|present perfect|\balready\b|\byet\b", False),
    (30, r"\bsince\b|\bfor (\w+ )?(years|months|weeks|days|hours|ages)\b|how long have", False),
    (37, r"\bif \w+ (had|were|knew|could)\b|\bwould(n't)? (\w+)\b(?<!would you)|\b\w+'d (\w+)\b(?<!'d like)", False),
    (33, r"\bif\b|\bunless\b", False),
    (36, r"\b(enjoy|enjoys|enjoyed|finish|finished|mind|avoid|keep|suggest|stop|stopped|recommend|recommended) \w+ing\b|\b(want|wants|decide|decided|plan|plans|hope|hopes|need|needs|afford|expect|expects|manage|managed|promise|promised|refuse|agree|forget|forgot|remember) to \w+", False),
    (31, r"\b(was|were) \w+ing\b", False),
    (35, r"\b(is|are|was|were|been|be|isn't|wasn't) (fixed|deployed|released|cancelled|canceled|delayed|booked|included|required|done|made|built|sent|written|stolen|sold|paid|taken|held|updated|installed|scheduled|shared|reported|solved|managed|delivered|served|located|allowed|expected)\b|пассив|passive", False),
    (22, r"\bgoing to \w+|going to\b", False),
    (25, r"\b(could you|would you|i'd like|i would like|may i|could i|would you mind)\b", False),
    (23, r"\b(must|mustn't|have to|has to|had to)\b", False),
    (24, r"\b(should|shouldn't|need to|needs to|ought to)\b", False),
    (21, r"\b(will|won't)\b|\b\w+'ll\b", False),
    (20, r"\bdidn't\b|^did\b|\bdid (you|he|she|they|we|it)\b", False),
    (19, r"past simple|\byesterday\b|\bago\b|\blast (week|night|year|month|summer|weekend|time)\b", False),
    (17, r"\b(am|is|are|'m|'re|isn't|aren't)( not)? (?!going\b)\w+ing\b|present continuous|continuous", False),
    (27, r"\b\w+er than\b|\bmore \w+ than\b|\bthe (best|worst|most \w+|\w+est)\b|\bas \w+ as\b|сравн", False),
    (34, r", (isn't|aren't|don't|doesn't|didn't|wasn't|weren't|won't|can't|haven't|hasn't|is|are|do|does|did|was) (it|you|he|she|they|we|i|there)\?|\bso (do|am|did|can) i\b|\bneither\b", False),
    (26, r"^(don't|let's|please|click|turn|open|check|take|go|call|send|press|enter|try|keep|remember|enjoy|have a)\b|повелит|imperative", False),
    (16, r"\b(always|usually|often|sometimes|rarely)\b|наречи|\b-ly\b", False),
    (5, r"\bthere (is|are|isn't|aren't|was|were|'s)\b|\b(is|are) there\b", False),
    (6, r"предлог|\bin / on\b|\bon / at\b|\bat / in\b|\b(at|from) home\b|\bon \w+days\b", False),
    (3, r"артикл|\ba / an\b", False),
    (4, r"множествен|мн\. ?ч", False),
    (11, r"\b(too|enough)\b|прилагат", False),
    (28, r"\b(much|many|a few|a little|a lot of|any)\b", True),
    (15, r"\b(can|can't|cannot|could|couldn't)\b", True),
    (32, r"\b(because|but|when|before|after|while)\b", True),
    (12, r"\b(mine|yours|ours|theirs|hers)\b|\b(?!(it|that|there|what|let|he|she|who|where|here|everything|nobody)'s)\w+'s (?!(been|got|a|an|the|not|very|really|too|so)\b)\w+|притяж", True),
    (13, r"\b(these|those)\b", True),
    (14, r"\b(have|has) (got|a|an|two|three|some|no)\b", True),
    (18, r"\b(was|were|wasn't|weren't)\b", True),
    (10, r"^(what|where|when|why|how|who|which)\b", True),
    (9, r"^(do|does|is|are|can|have|has|will|did|was|were)\b.*\?", True),
    (8, r"\b(don't|doesn't|isn't|aren't|not)\b", True),
    (2, r"\bto be\b|\bam / is / are\b|\bbe \+ (прилагат|существит)", False),
]

DETECTORS = {
    'es': [(n, re.compile(p, I | re.MULTILINE), g) for n, p, g in ES],
    'en': [(n, re.compile(p, I | re.MULTILINE), g) for n, p, g in EN],
}


def sources(d):
    """(вес, текст): мини-правило — 3, фраза дня — 2, примеры и упражнения — 1."""
    lang = d['lang']
    rule = d.get('rule') or {}
    out = [(3, rule.get('text', {}).get('ru', ''))]
    out.append((2, d['phrase'].get(lang, '')))
    rest = [e.get(lang, '') for e in rule.get('examples', [])]
    for ex in d.get('exercises', []):
        rest.append(ex.get(lang, '').replace('___', ' '.join(ex['answer']) if isinstance(ex.get('answer'), list) else ex.get('answer', '')))
        if ex.get('type') == 'translate':
            rest += ex['answer'] if isinstance(ex['answer'], list) else [ex['answer']]
    out.append((1, '\n'.join(rest)))
    return out


def refs(d, existing):
    scores = {}
    texts = sources(d)
    for rank, (n, rx, generic) in enumerate(DETECTORS[d['lang']]):
        gid = f"{d['lang']}-grammar-{n:02d}"
        if gid not in existing:
            continue
        # Общая тема вполовину — только по примерам: в мини-правиле она названа намеренно.
        score = sum((w / 2 if generic and w < 3 else w) for w, t in texts if t and rx.search(t))
        if score >= THRESHOLD:
            scores[gid] = (score, -rank)
    best = sorted(scores, key=lambda g: scores[g], reverse=True)[:MAX_REFS]
    return best


def main():
    lessons = {}
    for name in sorted(os.listdir(OUT)):
        if name.endswith('.json'):
            with open(os.path.join(OUT, name), encoding='utf8') as f:
                lessons[name] = json.load(f)
    existing = {d['id'] for d in lessons.values() if d['kind'] == 'grammar'}
    linked = empty = 0
    for name, d in lessons.items():
        if d['kind'] != 'words':
            continue
        see = refs(d, existing)
        # Порядок ключей: see — перед ext, как в формате.
        body = {k: v for k, v in d.items() if k not in ('see', 'ext')}
        if see:
            body['see'] = see
            linked += 1
        else:
            empty += 1
        if 'ext' in d:
            body['ext'] = d['ext']
        if body != d or list(body) != list(d):
            with open(os.path.join(OUT, name), 'w', encoding='utf8') as f:
                f.write(json.dumps(body, ensure_ascii=False, indent=2) + '\n')
    print(f'уроков слов с отсылками к правилам: {linked}, без отсылок: {empty}')


if __name__ == '__main__':
    main()
