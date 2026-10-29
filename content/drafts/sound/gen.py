# Уроки звучания: алфавиты и правила чтения EN / ES (BL-18, D-48) → content/lessons/<lang>-sound-NN.json.
# Буква: название, IPA, как читается, слоги для тренировки, слова, ссылки на правила чтения.
# Правило: глобальный id (на него ссылаются буквы и статьи словаря), заголовок, текст, примеры.
# es-sound-03 написан вручную и генератором не перезаписывается.
# Запуск: python3 content/drafts/sound/gen.py
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, '..', '..', 'lessons'))


def T(ru, en, es=None):
    """Локализованная строка: ru, en и (если есть) es."""
    out = {'ru': ru, 'en': en}
    if es:
        out['es'] = es
    return out


def ex(lang, pairs):
    """«слово — перевод; слово — перевод» → примеры."""
    out = []
    for item in pairs.split(';'):
        word, _, ru = item.partition('—')
        out.append({lang: word.strip(), 'ru': ru.strip()})
    return out


def letter(lang, ch, name, ipa, sound_ru, sound_en, syllables, examples, rules=()):
    d = {'letter': ch, 'name': name}
    if ipa:
        d['ipa'] = ipa
    d['sound'] = T(sound_ru, sound_en)
    d['syllables'] = syllables.split()
    d['examples'] = ex(lang, examples)
    if rules:
        d['rules'] = list(rules)
    return d


def rule(lang, rid, title, text, ipa, examples):
    d = {'id': rid, 'title': title, 'text': text}
    if ipa:
        d['ipa'] = ipa
    d['examples'] = ex(lang, examples)
    return d


def lesson(lang, order, title, *, level='A1', letters=None, rules=None, exercises=None):
    d = {
        'format': '2lang/lesson', 'version': 1, 'id': f'{lang}-sound-{order:02d}', 'lang': lang,
        'kind': 'sound', 'code': f'{lang.upper()}-P{order}', 'order': order, 'level': level,
    }
    if order > 1:
        d['requires'] = [f'{lang}-sound-01']
    d['title'] = title
    if letters:
        d['letters'] = letters
    if rules:
        d['rules'] = rules
    if exercises:
        d['exercises'] = [{'type': t, 'items': items} for t, items in exercises]
    return d


def pairs(s):
    return [p.split('/') for p in s.split()]


# ── Испанский ───────────────────────────────────────────────────────────────────────────

E = 'es'
ES_LETTERS = [
    letter(E, 'a', 'a', 'a', 'Всегда чистое [а], как в «мама», — и под ударением, и без.', 'Always a clear [a], stressed or not.', 'ma pa la ta sa', 'casa — дом; mapa — карта; agua — вода'),
    letter(E, 'b', 'be', 'b', 'Как русское «б». Между гласными мягче: губы почти не смыкаются [β]. b и v звучат одинаково.', 'Like English b; softer between vowels [β]. b and v sound the same.', 'ba be bi bo bu', 'barco — корабль; bueno — хороший; Cuba — Куба', ['es-b-v']),
    letter(E, 'c', 'ce', 'k / θ', 'Перед a, o, u и согласными — [к]: casa. Перед e, i — [θ] (как английское th в think, Испания) или [с] (Латинская Америка): cena. ch — «ч».', 'Before a, o, u and consonants — [k]; before e, i — [θ] (Spain) or [s] (Latin America). ch = [tʃ].', 'ca co cu ce ci', 'casa — дом; cosa — вещь; cena — ужин; cine — кино', ['es-c-before-e-i', 'es-ch']),
    letter(E, 'd', 'de', 'd', 'Как «д», но кончик языка у зубов. Между гласными и в конце слова — мягко, почти как th в this [ð]: nada, Madrid.', 'Like d, tongue on the teeth; between vowels and at the end it softens to [ð].', 'da de di do du', 'dedo — палец; nada — ничего; Madrid — Мадрид', ['es-d-soft']),
    letter(E, 'e', 'e', 'e', 'Чистое [э], без «й» в начале: mesa [мэса], leche [лэчэ].', 'A clear [e], never a diphthong.', 'me pe le te se', 'mesa — стол; leche — молоко; café — кофе'),
    letter(E, 'f', 'efe', 'f', 'Как «ф».', 'Like English f.', 'fa fe fi fo fu', 'foto — фото; café — кофе; fiesta — праздник'),
    letter(E, 'g', 'ge', 'g / x', 'Перед a, o, u — [г]: gato. Перед e, i — хриплое [х], как j: gente. gue, gui — [ге], [ги] (u немая); güe, güi — [гуэ], [гуи].', 'Before a, o, u — [g]; before e, i — [x] like j. gue, gui = [ge], [gi]; güe, güi = [gwe], [gwi].', 'ga go gu ge gi gue gui', 'gato — кот; gente — люди; guitarra — гитара', ['es-g-before-e-i']),
    letter(E, 'h', 'hache', '', 'Не читается никогда: hola [ола], ahora [аора]. Звучит только в сочетании ch — «ч».', 'Always silent: hola [ola]. Only ch is pronounced [tʃ].', 'ha he hi ho hu', 'hola — привет; hotel — отель; ahora — сейчас', ['es-h-silent', 'es-ch']),
    letter(E, 'i', 'i', 'i', 'Чистое [и]. Рядом с другой гласной без ударения — короткое «й»: bien [бйен].', 'A clear [i]; next to another vowel it glides to [j]: bien.', 'mi pi li ti si', 'isla — остров; vida — жизнь; sí — да', ['es-diphthongs']),
    letter(E, 'j', 'jota', 'x', 'Хриплое [х] из глубины горла — сильнее русского «х»: jamón, ojo.', 'A rough [x] from the back of the throat.', 'ja je ji jo ju', 'jamón — хамон; ojo — глаз; Juan — Хуан'),
    letter(E, 'k', 'ka', 'k', 'Как «к». Редкая буква — в заимствованиях: kilo, kiwi.', 'Like k; only in loanwords.', 'ka ke ki ko ku', 'kilo — килограмм; kiosco — киоск'),
    letter(E, 'l', 'ele', 'l', 'Светлое «л» — средняя между «л» и «ль», в конце слова не твёрдая: sol, papel. ll — отдельный звук «й».', 'A clear l, never dark; ll is a different sound.', 'la le li lo lu', 'luna — луна; sol — солнце; papel — бумага', ['es-ll-y']),
    letter(E, 'm', 'eme', 'm', 'Как «м».', 'Like m.', 'ma me mi mo mu', 'mamá — мама; mano — рука; mismo — тот же'),
    letter(E, 'n', 'ene', 'n', 'Как «н». Перед b, v, p читается как [м]: un beso [ум бэсо].', 'Like n; before b, v, p it becomes [m].', 'na ne ni no nu', 'nada — ничего; noche — ночь; nombre — имя'),
    letter(E, 'ñ', 'eñe', 'ɲ', 'Мягкое «нь» одним звуком: España [эспанья], año [анйо]. Отдельная буква после n.', 'A palatal [ɲ] like ny in canyon; a separate letter after n.', 'ña ñe ñi ño ñu', 'año — год; niño — ребёнок; España — Испания', ['es-n-tilde']),
    letter(E, 'o', 'o', 'o', 'Чистое [о] — без аканья, даже без ударения: todo [тодо], como [комо].', 'A clear [o], never reduced.', 'mo po lo to so', 'ojo — глаз; todo — всё; como — как'),
    letter(E, 'p', 'pe', 'p', 'Как «п», без придыхания.', 'Like p, without a puff of air.', 'pa pe pi po pu', 'pan — хлеб; papá — папа; sopa — суп'),
    letter(E, 'q', 'cu', 'k', 'Только в que, qui = [ке], [ки]; u не читается: queso [кэсо].', 'Only in que, qui = [ke], [ki]; the u is silent.', 'que qui', 'queso — сыр; aquí — здесь; ¿qué? — что?', ['es-qu']),
    letter(E, 'r', 'erre', 'ɾ / r', 'Между гласными и в конце — один удар языком [ɾ]: pero, mar. В начале слова, после n, l, s и в rr — раскатистое [р]: rosa, perro.', 'One tap [ɾ] between vowels; a trill [r] at the start of a word, after n, l, s and for rr.', 'ra re ri ro ru', 'pero — но; perro — собака; rosa — роза', ['es-r-rr']),
    letter(E, 's', 'ese', 's', 'Всегда глухое [с], даже между гласными: casa [каса], не [каза].', 'Always voiceless [s], even between vowels.', 'sa se si so su', 'sol — солнце; casa — дом; más — больше'),
    letter(E, 't', 'te', 't', 'Как «т», кончик языка у зубов, без придыхания.', 'Like t, tongue on the teeth, no puff of air.', 'ta te ti to tu', 'taza — чашка; tomate — помидор; tío — дядя'),
    letter(E, 'u', 'u', 'u', 'Чистое [у]. Немая в que, qui, gue, gui. Рядом с другой гласной — короткое «у»: bueno [буэно].', 'A clear [u]; silent in que, qui, gue, gui; glides to [w] before vowels.', 'mu pu lu tu su', 'uno — один; luna — луна; bueno — хороший', ['es-diphthongs']),
    letter(E, 'v', 'uve', 'b', 'Читается как b: vino [бино]. Губы не касаются зубов, как в русском «в».', 'Pronounced like b: vino [bino].', 'va ve vi vo vu', 'vino — вино; vaso — стакан; nuevo — новый', ['es-b-v']),
    letter(E, 'w', 'uve doble', 'w', 'Только в заимствованиях: web [уэб], wifi [уифи].', 'Only in loanwords: web, wifi.', 'wa we wi', 'web — сайт; wifi — вай-фай; kiwi — киви'),
    letter(E, 'x', 'equis', 'ks', 'Между гласными — [кс]: taxi, examen. В начале слова часто [с]. В México, Oaxaca — старое [х].', '[ks] between vowels; often [s] at the start; [x] in México.', 'xa xe xi xo', 'taxi — такси; examen — экзамен; México — Мексика'),
    letter(E, 'y', 'ye', 'ʝ / i', 'Перед гласной — согласный «й» (в Аргентине — «ж», «ш»): yo, playa. Отдельно и в конце слова — гласная [и]: y, hoy, muy.', 'Before a vowel — consonant [ʝ] (Argentina [ʃ]); alone or at the end — vowel [i].', 'ya ye yo yu', 'yo — я; playa — пляж; hoy — сегодня', ['es-ll-y']),
    letter(E, 'z', 'zeta', 'θ / s', 'В Испании — межзубное [θ], как th в think; в Латинской Америке — [с]: zapato. Перед e, i пишут c: lápiz → lápices.', '[θ] in Spain, [s] in Latin America; before e, i Spanish writes c.', 'za zo zu', 'zapato — ботинок; plaza — площадь; azul — синий', ['es-z']),
]

ES = [
    lesson(E, 1, T('Алфавит и диктовка по буквам', 'The alphabet and spelling out', 'El alfabeto y deletrear'),
           letters=ES_LETTERS,
           rules=[{
               'id': 'es-n-tilde',
               'title': T('ñ — отдельная буква', 'ñ is a separate letter', 'La ñ es una letra'),
               'text': T('ñ читается как мягкое «нь» [ɲ] и стоит в алфавите после n. Без тильды это другое слово: año «год», ano — совсем не то.',
                         'ñ sounds like “ny” in canyon [ɲ] and comes after n. Without the tilde it is a different word: año “year”.',
                         'La ñ suena [ɲ] y va después de la n en el alfabeto. Sin tilde es otra palabra.'),
               'ipa': 'ɲ',
               'examples': ex(E, 'año — год; mañana — завтра, утро; España — Испания'),
           }],
           exercises=[('spell', ['García', 'Peña', 'ana.garcia@mail.com']), ('pairs', pairs('pena/peña mono/moño')), ('dictation', ['año', 'mañana', 'España'])]),
    lesson(E, 2, T('Гласные и слоги: как пишется, так и читается', 'Vowels and syllables: read as written', 'Vocales y sílabas: se lee como se escribe'),
           rules=[
               rule(E, 'es-five-vowels', T('Пять чистых гласных', 'Five pure vowels', 'Cinco vocales puras'),
                    T('В испанском пять гласных: a, e, i, o, u — и каждая всегда звучит одинаково, ударная она или нет. Никакого аканья: todo — [тодо], а не [тада]; e — [э], а не [йэ]. Гласные короткие и чёткие, без скольжения.',
                      'Spanish has five vowels — a, e, i, o, u — and each always sounds the same, stressed or not. No reduction: todo is [todo]. Vowels are short and clear.'),
                    'a e i o u', 'casa — дом; mesa — стол; piso — квартира; todo — всё; luna — луна'),
               rule(E, 'es-open-syllables', T('Читаем по слогам', 'Reading syllable by syllable', 'Leer por sílabas'),
                    T('Испанский слог чаще всего открытый: согласная + гласная. Одна согласная между гласными отходит к следующему слогу: ca-sa, pe-lo-ta, ma-ña-na. Две согласные делятся: per-ro, can-tar; но pl, pr, bl, br, cl, cr, tr, dr не делятся: pro-ble-ma. ch, ll, rr — один звук и не делятся.',
                      'Spanish syllables are mostly open (consonant + vowel): ca-sa, pe-lo-ta. Two consonants split (can-tar) except pl, pr, bl, br, cl, cr, tr, dr (pro-ble-ma). ch, ll, rr stay together.'),
                    '', 'pelota — мяч; mañana — завтра; problema — проблема; chocolate — шоколад'),
               rule(E, 'es-read-as-written', T('Как пишется, так и читается', 'Read as written', 'Se lee como se escribe'),
                    T('Почти каждая буква — один звук, поэтому любое новое слово можно прочитать сразу. Исключений немного, и все они — правила чтения: c и g перед e, i (ES-P3), немая h, qu и gu, ll и y, r и rr, b = v (ES-P4). Куда падает ударение, тоже видно по написанию (ES-P5).',
                      'Almost every letter is one sound, so any new word can be read at once. The few exceptions are reading rules: c and g before e, i, silent h, qu, gu, ll, y, r / rr, b = v. Stress is also visible from spelling.'),
                    '', 'momento — момент; Toledo — Толедо; banana — банан'),
           ],
           exercises=[('read', ['mamá', 'pelota', 'Toledo', 'momento', 'banana', 'problema']), ('pairs', pairs('peso/piso mesa/misa bola/bula pata/pato')), ('dictation', ['luna', 'tomate', 'camino'])]),
    lesson(E, 4, T('ll и y, ch, r и rr, b и v, мягкое d', 'll and y, ch, r and rr, b and v, soft d', 'll y y, ch, r y rr, b y v, la d suave'),
           rules=[
               rule(E, 'es-ll-y', T('ll и y — «й»', 'll and y', 'll e y'),
                    T('ll и y перед гласной читаются одинаково — как напряжённое «й», почти «дж»: calle [кайе], llave, playa. В Аргентине и Уругвае — как «ж» или «ш»: calle [каже]. В конце слова и как союз y — гласная [и]: hoy, muy, y.',
                      'll and y before a vowel sound the same — a strong [ʝ], close to “y” in yes: calle, llave, playa. In Argentina and Uruguay — [ʒ] or [ʃ]. At the end of a word and as the word y — [i].'),
                    'ʝ', 'calle — улица; llave — ключ; playa — пляж; llamar — звать, звонить'),
               rule(E, 'es-ch', T('ch — «ч»', 'ch', 'ch'),
                    T('ch — один звук «ч» [tʃ], твёрже русского: chico, noche, mucho. В слогах ch не делится: co-che.',
                      'ch is one sound [tʃ] like in church: chico, noche, mucho.'),
                    'tʃ', 'chico — парень; noche — ночь; mucho — много'),
               rule(E, 'es-r-rr', T('r и rr', 'r and rr', 'r y rr'),
                    T('r между гласными и в конце слога — один короткий удар кончиком языка [ɾ]: pero «но», caro, hablar. rr, а также r в начале слова и после n, l, s — раскатистое [r] из нескольких ударов: perro «собака», carro, rosa, Enrique. Пары pero / perro, caro / carro различаются только этим.',
                      'r between vowels and at the end of a syllable is a single tap [ɾ]: pero, hablar. rr, and r at the start of a word or after n, l, s, is a trill [r]: perro, rosa, Enrique. pero / perro differ only in this.'),
                    'ɾ / r', 'pero — но; perro — собака; rosa — роза; carro — машина (Лат. Ам.)'),
               rule(E, 'es-b-v', T('b и v — один звук', 'b and v are the same sound', 'b y v suenan igual'),
                    T('b и v читаются одинаково: в начале фразы и после m, n — как «б» [b]: vino [бино], también; между гласными — мягче, губы едва смыкаются [β]: cabo, nuevo. Звука «в» с зубами в испанском нет. Какую букву писать — надо запомнить: vaso, beso.',
                      'b and v are pronounced the same: [b] at the start and after m, n (vino, también), a soft [β] between vowels (nuevo). Spanish has no [v]. The spelling must be learned.'),
                    'b / β', 'vino — вино; beso — поцелуй; nuevo — новый; haber — иметь (вспом.)'),
               rule(E, 'es-d-soft', T('Мягкое d', 'Soft d', 'La d suave'),
                    T('d между гласными и в конце слова звучит мягко, почти как английское th в this [ð]: nada, cansado, Madrid, usted. В разговорной речи окончание -ado часто звучит как [ао]: cansao.',
                      'd between vowels and at the end of a word is soft, close to th in this [ð]: nada, cansado, Madrid. In casual speech -ado often sounds like [ao].'),
                    'ð', 'nada — ничего; cansado — уставший; Madrid — Мадрид; usted — вы'),
           ],
           exercises=[('pairs', pairs('pero/perro caro/carro coro/corro para/parra')), ('read', ['calle', 'chocolate', 'perro', 'vivir', 'radio', 'ciudad']), ('dictation', ['llamar', 'noche', 'barrio', 'nuevo'])]),
    lesson(E, 5, T('Ударение и знак ударения', 'Word stress and the accent mark', 'El acento y la tilde'),
           rules=[
               rule(E, 'es-stress-vowel-n-s', T('Кончается на гласную, n или s — ударение на предпоследний слог', 'Ending in a vowel, n or s — stress on the second-to-last syllable', 'Llanas: vocal, n o s'),
                    T('Если слово кончается на гласную, n или s, ударение падает на предпоследний слог: CA-sa, HA-blan, LU-nes, e-XA-men. Так устроено большинство испанских слов.',
                      'Words ending in a vowel, n or s are stressed on the second-to-last syllable: CA-sa, HA-blan, LU-nes, e-XA-men.'),
                    '', 'casa — дом; hablan — говорят; lunes — понедельник; examen — экзамен'),
               rule(E, 'es-stress-consonant', T('Кончается на другую согласную — ударение на последний слог', 'Ending in another consonant — stress on the last syllable', 'Agudas: otra consonante'),
                    T('Если слово кончается на согласную, кроме n и s, ударение на последнем слоге: ha-BLAR, ciu-DAD, es-pa-ÑOL, re-LOJ. Поэтому все инфинитивы ударны на конце: comer, vivir.',
                      'Words ending in any consonant except n or s are stressed on the last syllable: ha-BLAR, ciu-DAD, es-pa-ÑOL. All infinitives are stressed at the end.'),
                    '', 'hablar — говорить; ciudad — город; español — испанский; reloj — часы'),
               rule(E, 'es-stress-tilde', T('Знак ´ — ударение здесь', 'The accent mark shows the stress', 'La tilde marca el acento'),
                    T('Если ударение нарушает два правила выше, его отмечают знаком ´ — и читают ударным именно этот слог: ca-FÉ, ÁR-bol, MÚ-si-ca, can-CIÓN, te-LÉ-fo-no. Ударение на третий от конца слог всегда со знаком. Знак ещё различает короткие слова: si / sí, tu / tú (ES-51).',
                      'When stress breaks the two rules above, it is marked with ´ on the stressed vowel: ca-FÉ, ÁR-bol, MÚ-si-ca, can-CIÓN. Stress on the third-to-last syllable always has a mark. The mark also tells short words apart: si / sí, tu / tú.'),
                    '', 'café — кофе; árbol — дерево; música — музыка; canción — песня; teléfono — телефон'),
           ],
           level='A2',
           exercises=[('read', ['teléfono', 'hablamos', 'Madrid', 'lápiz', 'examen', 'exámenes']), ('pairs', pairs('papa/papá hablo/habló termino/terminó')), ('dictation', ['canción', 'árbol', 'fácil'])]),
    lesson(E, 6, T('Дифтонги, слияние слов, интонация', 'Diphthongs, linking and intonation', 'Diptongos, enlace y entonación'),
           rules=[
               rule(E, 'es-diphthongs', T('Дифтонги: ie, ue, ai, au…', 'Diphthongs', 'Diptongos'),
                    T('Безударные i и u рядом с другой гласной сливаются с ней в один слог: i звучит как «й», u — как короткое «у»: bien [бйен], bueno [буэ-но], aire [ай-рэ], ciudad [сьу-дад]. Так получаются дифтонги — их произносят одним движением.',
                      'Unstressed i and u next to another vowel merge with it into one syllable — i as [j], u as [w]: bien, bueno, aire, ciudad.'),
                    'j / w', 'bien — хорошо; bueno — хороший; aire — воздух; ciudad — город'),
               rule(E, 'es-hiatus', T('Две гласные — два слога', 'Two vowels, two syllables', 'Hiato'),
                    T('Две «сильные» гласные (a, e, o) рядом — это два слога: le-er, a-e-ro-puer-to. Ударные í и ú со знаком тоже отделяются: dí-a, pa-ís, rí-o. Сравните: pais [пайс] не существует — país [па-ис] «страна».',
                      'Two strong vowels (a, e, o) form two syllables: le-er. Accented í, ú also split off: dí-a, pa-ís, rí-o.'),
                    '', 'día — день; país — страна; leer — читать; río — река'),
               rule(E, 'es-linking', T('Слова сливаются в речи', 'Words run together', 'Enlace'),
                    T('В речи слова не разделяют паузами: конечная согласная цепляется к гласной следующего слова, а одинаковые гласные сливаются: los amigos [ло-са-ми-гос], mi hermano [мьер-ма-но] — h не читается. Поэтому испанская речь кажется очень быстрой.',
                      'Words are linked: a final consonant joins the next vowel and equal vowels merge: los amigos [lo-sa-mi-gos], mi hermano. That is why Spanish sounds fast.'),
                    '', 'los amigos — друзья; mi hermano — мой брат; está aquí — он здесь'),
               rule(E, 'es-intonation', T('¿…? и ¡…!: интонация с начала фразы', '¿…? and ¡…!: intonation from the start', 'Entonación: ¿…? ¡…!'),
                    T('Перевёрнутые ¿ и ¡ стоят в начале вопроса и восклицания — чтобы интонация была видна сразу. Общий вопрос без вопросительного слова звучит как утверждение, но с подъёмом голоса в конце: ¿Vienes? ↗ В вопросе с qué, dónde, cómo голос в конце опускается.',
                      'Inverted ¿ and ¡ open questions and exclamations so you know the tune in advance. Yes / no questions rise at the end: ¿Vienes? ↗ Questions with qué, dónde, cómo fall.'),
                    '', '¿Vienes? — Придёшь?; ¡Qué bonito! — Как красиво!; ¿Dónde vives? — Где ты живёшь?'),
           ],
           level='A2',
           exercises=[('read', ['bueno', 'ciudad', 'día', 'país', 'aeropuerto', 'Europa']), ('dictation', ['tiempo', 'nuevo', 'aire'])]),
]

# ── Английский ──────────────────────────────────────────────────────────────────────────

N = 'en'
VOWEL = 'Гласная читается по-разному — смотря какой слог. '
EN_LETTERS = [
    letter(N, 'a', 'a', 'eɪ', VOWEL + 'Открытый (a + согласная + немая e): [eɪ] «эй», как название буквы — cake, name. Закрытый (кончается на согласную): [æ] — между «а» и «э», рот широко — cat, bag. a + r: долгое [ɑː] — car. a + re: [eə] «эа» — care.',
           'Open syllable (a + consonant + silent e): [eɪ] — cake. Closed: [æ] — cat. a + r: [ɑː] — car. a + re: [eə] — care.',
           'cat cake car care', 'cat — кошка; name — имя; car — машина; care — забота', ['en-open-syllable', 'en-closed-syllable', 'en-vowel-r']),
    letter(N, 'b', 'bee', 'biː', 'Название «би». Читается как «б»; в конце слова не оглушается: cab ≠ cap. После m в конце немая: climb, comb.', 'Like b; stays voiced at the end; silent after m: climb.',
           'bat bet bit bot but', 'bag — сумка; job — работа; climb — карабкаться', ['en-final-voiced', 'en-silent-letters']),
    letter(N, 'c', 'cee', 'siː', 'Название «си». Перед e, i, y — [s]: city, cent, cycle. Перед a, o, u и согласными — [k]: cat, cup, clock. ck — [k]: back. ch — «ч»: chip.', 'Before e, i, y — [s]: city; otherwise [k]: cat. ck = [k], ch = [tʃ].',
           'cat cot cut cent city', 'cat — кошка; city — город; clock — часы; back — назад', ['en-c-g-soft', 'en-ck', 'en-sh-ch']),
    letter(N, 'd', 'dee', 'diː', 'Название «ди». Как «д», но кончик языка на бугорках за зубами, а не на зубах. В конце не оглушается: bad ≠ bat.', 'Tongue on the ridge behind the teeth; stays voiced at the end: bad ≠ bat.',
           'dad dog dig did', 'dog — собака; bed — кровать; red — красный', ['en-final-voiced']),
    letter(N, 'e', 'e', 'iː', VOWEL + 'Открытый: [iː] долгое «и», как название — he, Pete, these. Закрытый: [e] «э» — bed, pen. e + r: [ɜː] — her. e + re: [ɪə] «иа» — here. Немая e в конце слова не читается, а только «открывает» слог: make, time.',
           'Open: [iː] — he, Pete. Closed: [e] — bed. e + r: [ɜː] — her. e + re: [ɪə] — here. Final e is silent and makes the vowel before it open.',
           'pen Pete her here', 'bed — кровать; he — он; her — её; here — здесь', ['en-open-syllable', 'en-closed-syllable', 'en-vowel-r']),
    letter(N, 'f', 'ef', 'ef', 'Название «эф». Как «ф». Тот же звук даёт ph: phone. Исключение: of — [ɒv].', 'Like f; ph also gives [f]. Exception: of [ɒv].',
           'fat fit fun fog', 'fish — рыба; off — выключено; coffee — кофе', ['en-ph']),
    letter(N, 'g', 'gee', 'dʒiː', 'Название «джи». Перед e, i, y часто [dʒ] «дж»: gym, page, giant. Иначе — [g]: go, big, glass. Частые исключения с [g]: get, give, girl, begin.', 'Before e, i, y often [dʒ]: gym, page; otherwise [g]: go. Exceptions: get, give, girl.',
           'gap got gum gem gym', 'go — идти; page — страница; gym — спортзал; girl — девочка', ['en-c-g-soft', 'en-igh']),
    letter(N, 'h', 'aitch', 'eɪtʃ', 'Название «эйч». Лёгкий выдох, а не русское «х»: hat, home. Немая в hour, honest и в wh: what. В сочетаниях sh, ch, th, ph, gh — часть другого звука.', 'A light breath, not a Russian [x]. Silent in hour, honest; part of sh, ch, th, ph.',
           'hat hot hit hut', 'hat — шляпа; hello — привет; hour — час', ['en-silent-letters', 'en-th', 'en-sh-ch']),
    letter(N, 'i', 'i', 'aɪ', VOWEL + 'Открытый: [aɪ] «ай», как название — bike, time. Закрытый: [ɪ] — короткое, между «и» и «ы»: sit, big. i + r: [ɜː] — girl. i + re: [aɪə] — fire. igh — тоже [aɪ]: night.',
           'Open: [aɪ] — bike. Closed: [ɪ] — sit. i + r: [ɜː] — girl. i + re: [aɪə] — fire. igh = [aɪ].',
           'sit site bird fire', 'big — большой; time — время; girl — девочка; fire — огонь', ['en-open-syllable', 'en-closed-syllable', 'en-vowel-r', 'en-igh']),
    letter(N, 'j', 'jay', 'dʒeɪ', 'Название «джей». Всегда [dʒ] «дж» одним звуком: job, jam, July.', 'Always [dʒ]: job, jam.',
           'jam jet jog jug', 'job — работа; jam — джем; July — июль'),
    letter(N, 'k', 'kay', 'keɪ', 'Название «кей». Как «к» с придыханием. Перед n в начале слова немая: know, knife. ck в конце — [k]: back.', 'Like k with a puff of air; silent before n: know, knife.',
           'kit kid key', 'key — ключ; kind — добрый; know — знать', ['en-silent-letters', 'en-ck']),
    letter(N, 'l', 'el', 'el', 'Название «эл». В начале слога — светлое [l]: light. В конце — тёмное, «глубокое» [ɫ]: feel, ball. Немая в talk, walk, half, could.', 'Clear [l] at the start, dark [ɫ] at the end; silent in talk, half, could.',
           'lap let lit lot', 'lamp — лампа; ball — мяч; walk — идти пешком', ['en-silent-letters']),
    letter(N, 'm', 'em', 'em', 'Название «эм». Как «м».', 'Like m.', 'map men mix mop', 'map — карта; time — время; summer — лето'),
    letter(N, 'n', 'en', 'en', 'Название «эн». Как «н», язык на бугорках. ng — носовой [ŋ] без «г» на конце: sing, long. nk — [ŋk]: think.', 'Like n; ng is [ŋ] with no [g]: sing; nk = [ŋk].',
           'nap net nod nut', 'name — имя; sing — петь; think — думать', ['en-ng']),
    letter(N, 'o', 'o', 'əʊ', VOWEL + 'Открытый: [əʊ] «оу», как название — home, note, go. Закрытый: [ɒ] — короткое открытое «о»: hot, dog (в американском ближе к «а»). o + r: [ɔː] долгое «о» — fork. o + re: [ɔː] — more. Безударная o часто звучит как [ə]: today.',
           'Open: [əʊ] — home. Closed: [ɒ] — hot. o + r and o + re: [ɔː] — fork, more. Unstressed o is often [ə].',
           'not note fork more', 'hot — горячий; home — дом; fork — вилка; more — больше', ['en-open-syllable', 'en-closed-syllable', 'en-vowel-r', 'en-schwa']),
    letter(N, 'p', 'pee', 'piː', 'Название «пи». Как «п» с заметным придыханием в начале слова: pen [pʰen]. ph — [f]: phone.', 'Aspirated at the start of a word; ph = [f].',
           'pat pet pit pot', 'pen — ручка; stop — стоп; apple — яблоко', ['en-ph']),
    letter(N, 'q', 'cue', 'kjuː', 'Название «кью». Почти всегда с u: qu — [kw] «кв»: queen, quick, question.', 'Almost always qu = [kw]: queen.',
           'quit quiz queen', 'queen — королева; quick — быстрый; question — вопрос'),
    letter(N, 'r', 'ar', 'ɑː', 'Название «а:». Язык не вибрирует: кончик загнут назад и не касается нёба — red, try. После гласной в британском не читается, а удлиняет гласную: car [kɑː], her; в американском — слышно.', 'No trill: the tongue curls back. After a vowel it is silent in British English and lengthens the vowel: car [kɑː].',
           'rat red rid rot', 'red — красный; try — пытаться; car — машина', ['en-vowel-r']),
    letter(N, 's', 'ess', 'es', 'Название «эс». Обычно [s]: sun, bus. Между гласными и в окончаниях после звонких часто [z]: rose, is, dogs. sh — [ʃ] «ш». sion — [ʒən] или [ʃən].', 'Usually [s]; often [z] between vowels and after voiced sounds: rose, dogs. sh = [ʃ].',
           'sat set sit sun', 'sun — солнце; rose — роза; dogs — собаки', ['en-s-endings', 'en-sh-ch']),
    letter(N, 't', 'tee', 'tiː', 'Название «ти». Как «т» с придыханием, язык на бугорках. th — особые звуки [θ] / [ð]. -tion — [ʃən]: station.', 'Aspirated t; th is [θ] / [ð]; -tion = [ʃən].',
           'tap ten tip top', 'ten — десять; that — тот; station — станция', ['en-th', 'en-tion']),
    letter(N, 'u', 'u', 'juː', VOWEL + 'Открытый: [juː] «ю», как название — cute, tube, music. Закрытый: [ʌ] — короткое, похоже на безударное «а»: cup, bus, sun. u + r: [ɜː] — turn. u + re: [jʊə] — pure. После l, r, j часто без «й»: rule [ruːl].',
           'Open: [juː] — cute. Closed: [ʌ] — cup. u + r: [ɜː] — turn. u + re: [jʊə] — pure.',
           'cut cute turn pure', 'cup — чашка; music — музыка; turn — поворачивать; pure — чистый', ['en-open-syllable', 'en-closed-syllable', 'en-vowel-r']),
    letter(N, 'v', 'vee', 'viː', 'Название «ви». Настоящее «в»: верхние зубы на нижней губе. Не путать с w: vest «жилет» ≠ west «запад».', 'A real [v] with teeth on the lip; vest ≠ west.',
           'van vet vim', 'van — фургон; very — очень; live — жить', ['en-w-v']),
    letter(N, 'w', 'double u', 'ˈdʌbəljuː', 'Название «дабл-ю». Губы трубочкой и сразу в гласную, зубы не участвуют: we, window. wh — тоже [w]: what, when (кроме who [huː]). wr — w немая: write.', 'Rounded lips, no teeth: we. wh = [w] (but who [huː]); silent in wr: write.',
           'wet win wag', 'we — мы; what — что; write — писать', ['en-w-v', 'en-silent-letters']),
    letter(N, 'x', 'ex', 'eks', 'Название «экс». Обычно [ks]: box, six. Перед ударной гласной часто [gz]: exam [ɪgˈzæm]. В начале слова — [z]: xylophone.', 'Usually [ks]: box; [gz] in exam; [z] at the start: xylophone.',
           'box fix six', 'box — коробка; six — шесть; exam — экзамен'),
    letter(N, 'y', 'wye', 'waɪ', 'Название «уай». В начале слова — согласная «й»: yes, you. В конце односложного слова — [aɪ]: my, fly. В конце длинного — [i]: happy, city. Внутри слова — как i: gym [ɪ], type [aɪ].', 'Consonant [j] at the start: yes. [aɪ] at the end of one-syllable words: my; [i] in happy; like i inside: gym, type.',
           'yes my gym happy', 'yes — да; my — мой; happy — счастливый; gym — спортзал', ['en-open-syllable']),
    letter(N, 'z', 'zed', 'zed', 'Название «зед» (в Америке — «зи»). Как «з»: zoo, size, lazy.', 'Like z; called zee in American English.',
           'zip zoo zap', 'zoo — зоопарк; size — размер; lazy — ленивый'),
]

EN = [
    lesson(N, 1, T('Алфавит и диктовка по буквам', 'The alphabet and spelling out', 'El alfabeto inglés y deletrear'),
           letters=EN_LETTERS,
           rules=[
               rule(N, 'en-letter-names', T('Названия букв: где путают', 'Letter names: common mix-ups', 'Nombres de letras: confusiones'),
                    T('Названия гласных — это их звук в открытом слоге: A [eɪ] «эй», E [iː] «и», I [aɪ] «ай», O [əʊ] «оу», U [juː] «ю». Чаще всего путают: E [iː] и I [aɪ]; G [dʒiː] и J [dʒeɪ]; R [ɑː]; Y [waɪ]; W [ˈdʌbəljuː]. Двойные буквы диктуют так: double l, double o (Hollywood: H-O-double L-Y-W-double O-D).',
                      'Vowel names are their open-syllable sounds: A [eɪ], E [iː], I [aɪ], O [əʊ], U [juː]. Common mix-ups: E / I, G / J, R, Y, W. Double letters: double l.'),
                    '', 'email — электронная почта; Hollywood — Голливуд; Smith — Смит'),
               rule(N, 'en-spelling-symbols', T('Как диктовать email и коды', 'Spelling emails and codes', 'Dictar correos y códigos'),
                    T('@ — at, точка — dot, дефис — dash (или hyphen), _ — underscore, / — slash. Цифры диктуют по одной: 2026 — two-oh-two-six (0 — «oh» или zero). Пример: anna_lee@mail.com — anna underscore lee at mail dot com.',
                      '@ is at, . is dot, - is dash, _ is underscore, / is slash. Digits one by one; 0 is “oh” or zero.'),
                    '', 'anna_lee@mail.com — адрес почты; www.site.org — адрес сайта'),
           ],
           exercises=[('spell', ['Smith', 'Hughes', 'john.lee@mail.com', 'Kate_99']), ('dictation', ['queen', 'jazz', 'yellow'])]),
    lesson(N, 2, T('Сочетания гласных: ee, ea, oo, ai, ou…', 'Vowel teams: ee, ea, oo, ai, ou…', 'Grupos de vocales: ee, ea, oo, ai, ou…'),
           rules=[
               rule(N, 'en-ee-ea', T('ee, ea — долгое [iː]', 'ee, ea', 'ee, ea'),
                    T('ee и ea обычно читаются как долгое «и» [iː]: see, meet, sea, read. У ea есть исключения с [e]: bread, head, weather, и с [eɪ]: great, break.',
                      'ee and ea usually give a long [iː]: see, sea. Exceptions with [e]: bread, head; with [eɪ]: great.'),
                    'iː', 'see — видеть; meet — встречать; sea — море; bread — хлеб'),
               rule(N, 'en-oo', T('oo — [uː] или [ʊ]', 'oo', 'oo'),
                    T('oo чаще долгое «у» [uː]: food, moon, school. Перед k и в нескольких частых словах — краткое [ʊ]: book, look, good, foot. Сравните: pool / pull, fool / full.',
                      'oo is usually long [uː]: food, moon; short [ʊ] before k and in good, foot: book, look.'),
                    'uː / ʊ', 'food — еда; moon — луна; book — книга; good — хороший'),
               rule(N, 'en-ai-ay', T('ai, ay — [eɪ]', 'ai, ay', 'ai, ay'),
                    T('ai (внутри слова) и ay (в конце) читаются [eɪ] «эй»: rain, wait, day, play. Исключение: said [sed], says [sez].',
                      'ai (inside a word) and ay (at the end) give [eɪ]: rain, day. Exception: said [sed].'),
                    'eɪ', 'rain — дождь; wait — ждать; day — день; play — играть'),
               rule(N, 'en-oa-ow', T('oa, ow — [əʊ] или [aʊ]', 'oa, ow', 'oa, ow'),
                    T('oa — [əʊ] «оу»: boat, road, coat. ow бывает двух видов: [əʊ] в конце многих слов — show, know, window — и [aʊ] «ау» — now, how, town, down. ou тоже чаще [aʊ]: out, house, mouse.',
                      'oa = [əʊ]: boat. ow is [əʊ] in show, know or [aʊ] in now, town; ou is usually [aʊ]: out, house.'),
                    'əʊ / aʊ', 'boat — лодка; show — шоу; now — сейчас; house — дом'),
               rule(N, 'en-oi-oy', T('oi, oy — [ɔɪ]; au, aw — [ɔː]', 'oi, oy; au, aw', 'oi, oy; au, aw'),
                    T('oi (внутри) и oy (в конце) — [ɔɪ] «ой»: coin, boy, enjoy. au и aw — долгое [ɔː]: August, author, saw, draw.',
                      'oi, oy = [ɔɪ]: coin, boy. au, aw = [ɔː]: August, saw.'),
                    'ɔɪ / ɔː', 'coin — монета; boy — мальчик; saw — видел; August — август'),
               rule(N, 'en-igh', T('igh — [aɪ]', 'igh', 'igh'),
                    T('В сочетании igh буквы gh немые, а i читается [aɪ] «ай»: night, light, high, right. Тот же звук в eigh даёт [eɪ]: eight, weight.',
                      'In igh the gh is silent and i is [aɪ]: night, light. eigh gives [eɪ]: eight.'),
                    'aɪ', 'night — ночь; light — свет; right — правый; eight — восемь'),
           ],
           exercises=[('read', ['street', 'teacher', 'moon', 'rain', 'boat', 'town', 'enjoy', 'night']), ('pairs', pairs('pool/pull fool/full meet/met boat/bought')), ('dictation', ['green', 'school', 'today'])]),
    lesson(N, 3, T('Четыре типа слога: как читать гласные', 'Four syllable types: how vowels are read', 'Cuatro tipos de sílaba: cómo leer las vocales'),
           rules=[
               rule(N, 'en-open-syllable', T('Открытый слог: гласная «как в алфавите»', 'Open syllable: the vowel says its name', 'Sílaba abierta'),
                    T('Если слог кончается на гласную (go, he, my) или после гласной стоит одна согласная и немая e (cake, time, home, cute), гласная читается как её название в алфавите: a [eɪ], e [iː], i / y [aɪ], o [əʊ], u [juː]. Немая e в конце не читается — она «открывает» слог.',
                      'If a syllable ends in a vowel (go, he, my) or has vowel + consonant + silent e (cake, time, home, cute), the vowel says its name: a [eɪ], e [iː], i / y [aɪ], o [əʊ], u [juː].'),
                    'eɪ iː aɪ əʊ juː', 'cake — торт; Pete — Пит; time — время; home — дом; cute — милый'),
               rule(N, 'en-closed-syllable', T('Закрытый слог: краткая гласная', 'Closed syllable: short vowel', 'Sílaba cerrada'),
                    T('Если слог кончается на согласную (cat, bed, sit, hot, cup), гласная краткая: a [æ], e [e], i / y [ɪ], o [ɒ], u [ʌ]. Отсюда пары, где всё решает немая e: hat / hate, kit / kite, not / note, cut / cute. Удвоенная согласная закрывает слог: hopping (от hop) ≠ hoping (от hope).',
                      'A syllable ending in a consonant has a short vowel: a [æ], e [e], i [ɪ], o [ɒ], u [ʌ]. Hence hat / hate, kit / kite, not / note, cut / cute; a double consonant keeps it closed: hopping vs hoping.'),
                    'æ e ɪ ɒ ʌ', 'cat — кошка; bed — кровать; sit — сидеть; hot — горячий; cup — чашка'),
               rule(N, 'en-vowel-r', T('Гласная + r и гласная + re', 'Vowel + r and vowel + re', 'Vocal + r, vocal + re'),
                    T('Гласная + r: ar — [ɑː] (car), or — [ɔː] (fork), er, ir, ur — одинаковое [ɜː] (her, girl, turn). Гласная + re: are — [eə] (care), ere — [ɪə] (here), ire — [aɪə] (fire), ore — [ɔː] (more), ure — [jʊə] (pure). В британском r после гласной не звучит.',
                      'Vowel + r: ar [ɑː], or [ɔː], er / ir / ur [ɜː]. Vowel + re: are [eə], ere [ɪə], ire [aɪə], ore [ɔː], ure [jʊə]. British English does not pronounce this r.'),
                    'ɑː ɔː ɜː', 'car — машина; fork — вилка; girl — девочка; care — забота; here — здесь'),
               rule(N, 'en-long-short', T('Долгие и краткие: ship / sheep', 'Long and short: ship / sheep', 'Largas y cortas: ship / sheep'),
                    T('В английском долгота гласной меняет слово: ship [ʃɪp] «корабль» / sheep [ʃiːp] «овца», live / leave, full / fool. Долгие [iː], [uː], [ɑː], [ɔː], [ɜː] тяните, краткие [ɪ], [ʊ], [æ], [ɒ], [ʌ] — обрывайте.',
                      'Vowel length changes the word: ship / sheep, live / leave, full / fool. Hold long vowels, cut short ones.'),
                    'ɪ / iː', 'ship — корабль; sheep — овца; live — жить; leave — уходить'),
           ],
           exercises=[('pairs', pairs('hat/hate kit/kite not/note cut/cute ship/sheep live/leave')), ('read', ['plane', 'pin', 'fork', 'care', 'tune', 'bird']), ('dictation', ['make', 'sit', 'her', 'home'])]),
    lesson(N, 4, T('Согласные: th, w и v, sh и ch, звонкие на конце', 'Consonants: th, w and v, sh and ch, final voiced', 'Consonantes: th, w y v, sh y ch'),
           rules=[
               rule(N, 'en-th', T('th — [θ] и [ð]', 'th', 'th'),
                    T('th — звука нет в русском: кончик языка между зубами, выдыхаем. Глухой [θ] — think, three, thanks; звонкий [ð] — this, the, mother. Не заменяйте на «с», «з», «ф», «т»: think ≠ sink, three ≠ tree.',
                      'Put the tongue between the teeth: voiceless [θ] in think, voiced [ð] in this. Do not replace it with s, z, f or t: think ≠ sink.'),
                    'θ / ð', 'think — думать; three — три; this — это; mother — мама'),
               rule(N, 'en-w-v', T('w и v', 'w and v', 'w y v'),
                    T('w — губы вытянуты трубочкой, зубы не касаются губы, сразу переходим в гласную: we, west, window. v — верхние зубы на нижней губе, как русское «в»: vest, very. west ≠ vest, wine ≠ vine.',
                      'w: rounded lips, no teeth (we, west). v: top teeth on the lower lip (vest, very). west ≠ vest.'),
                    'w / v', 'west — запад; vest — жилет; wine — вино; very — очень'),
               rule(N, 'en-final-voiced', T('Звонкие на конце не оглушаются', 'Final voiced consonants stay voiced', 'Sonoras finales'),
                    T('В русском «код» звучит как «кот», а в английском конечные звонкие остаются звонкими — иначе получится другое слово: bad / bat, dog / dock, bag / back, eyes / ice. Гласная перед звонкой согласной чуть длиннее.',
                      'Do not devoice final consonants: bad / bat, dog / dock, bag / back. The vowel before a voiced consonant is a bit longer.'),
                    '', 'bad — плохой; bat — летучая мышь; bag — сумка; back — спина'),
               rule(N, 'en-sh-ch', T('sh — [ʃ], ch и tch — [tʃ]', 'sh, ch, tch', 'sh, ch, tch'),
                    T('sh — мягкое «ш» [ʃ]: she, shop, fish. ch и tch — «ч» [tʃ]: chip, much, watch. Пары: ship / chip, sheep / cheap, wash / watch. В греческих словах ch = [k]: school, Christmas.',
                      'sh is [ʃ]: she, fish. ch and tch are [tʃ]: chip, watch. ship / chip. In Greek words ch = [k]: school.'),
                    'ʃ / tʃ', 'shop — магазин; chip — чипс; watch — часы; school — школа'),
               rule(N, 'en-ph', T('ph — [f]', 'ph', 'ph'),
                    T('ph всегда [f]: phone, photo, alphabet. Это след греческих слов.', 'ph is always [f]: phone, photo.'),
                    'f', 'phone — телефон; photo — фото; alphabet — алфавит'),
               rule(N, 'en-ck', T('ck — [k]', 'ck', 'ck'),
                    T('ck в конце слога после краткой гласной — один звук [k]: back, clock, sick. Он сохраняет слог закрытым: back [bæk].', 'ck after a short vowel is one [k]: back, clock.'),
                    'k', 'back — назад; clock — часы; sick — больной'),
               rule(N, 'en-ng', T('ng — носовой [ŋ]', 'ng', 'ng'),
                    T('ng в конце слова — один носовой звук [ŋ], задняя часть языка у нёба, «г» не произносится: sing, long, morning. В середине слова иногда с [g]: finger, English.',
                      'ng at the end is one nasal [ŋ] with no [g]: sing, long; inside some words with [g]: finger.'),
                    'ŋ', 'sing — петь; long — длинный; morning — утро; English — английский'),
               rule(N, 'en-c-g-soft', T('c и g перед e, i, y', 'c and g before e, i, y', 'c y g ante e, i, y'),
                    T('Перед e, i, y буква c читается [s] (city, cent, bicycle), g — часто [dʒ] (gym, page, giant). Перед другими буквами — [k] и [g]: cat, cup, go, big. У g много исключений с [g]: get, give, girl, together.',
                      'Before e, i, y: c is [s] (city), g is often [dʒ] (gym). Elsewhere [k] and [g]. g has exceptions: get, give, girl.'),
                    's / dʒ', 'city — город; cent — цент; gym — спортзал; page — страница'),
           ],
           exercises=[('pairs', pairs('think/sink west/vest bad/bat sheep/cheap thin/tin three/tree')), ('read', ['three', 'this', 'phone', 'clock', 'sing', 'city', 'watch']), ('dictation', ['thank', 'very', 'fish'])]),
    lesson(N, 5, T('Окончания -s и -ed', 'Endings -s and -ed', 'Terminaciones -s y -ed'),
           level='A2',
           rules=[
               rule(N, 'en-s-endings', T('-s: [s], [z] или [ɪz]', '-s: [s], [z] or [ɪz]', '-s: [s], [z] o [ɪz]'),
                    T('Окончание -s (множественное число, he works, притяжательное \'s) читается по предыдущему звуку. После глухих (p, t, k, f, θ) — [s]: cats, works. После звонких и гласных — [z]: dogs, plays, Tom\'s. После шипящих и свистящих (s, z, sh, ch, x, ge) — [ɪz]: boxes, watches, pages.',
                      '-s is [s] after voiceless sounds (cats), [z] after voiced sounds and vowels (dogs, plays), [ɪz] after s, z, sh, ch, x, ge (boxes, pages).'),
                    's / z / ɪz', 'cats — кошки; dogs — собаки; boxes — коробки; watches — часы'),
               rule(N, 'en-ed-endings', T('-ed: [t], [d] или [ɪd]', '-ed: [t], [d] or [ɪd]', '-ed: [t], [d] o [ɪd]'),
                    T('Окончание -ed (Past Simple, EN-19) читается тоже по предыдущему звуку. После глухих (p, k, f, s, sh, ch) — [t]: worked, stopped. После звонких и гласных — [d]: played, called. После t и d — отдельный слог [ɪd]: wanted, needed. Лишнего слога не добавляйте: worked — [wɜːkt], а не «воркед».',
                      '-ed is [t] after voiceless sounds (worked), [d] after voiced ones (played), [ɪd] after t and d (wanted). Never add an extra syllable: worked is [wɜːkt].'),
                    't / d / ɪd', 'worked — работал; played — играл; wanted — хотел; needed — нуждался'),
           ],
           exercises=[('read', ['cats', 'dogs', 'boxes', 'worked', 'played', 'wanted', 'watches']), ('pairs', pairs('play/played want/wanted cat/cats')), ('dictation', ['stopped', 'pages', 'called'])]),
    lesson(N, 6, T('Безударный звук, немые буквы, -tion', 'Schwa, silent letters, -tion', 'La schwa, letras mudas, -tion'),
           level='A2',
           rules=[
               rule(N, 'en-schwa', T('Schwa [ə] — самый частый звук', 'Schwa [ə]', 'La schwa [ə]'),
                    T('Безударные гласные в английском почти всегда звучат как нейтральный короткий [ə] — что бы ни было написано: about [əˈbaʊt], banana [bəˈnɑːnə], doctor, today. Служебные слова в потоке речи тоже «слабеют»: to [tə], for [fə], can [kən]: I can swim [aɪ kən swɪm].',
                      'Unstressed vowels usually become a short neutral [ə]: about, banana, doctor. Function words weaken too: to [tə], for [fə], can [kən].'),
                    'ə', 'about — о, около; banana — банан; doctor — врач; today — сегодня'),
               rule(N, 'en-silent-letters', T('Немые буквы', 'Silent letters', 'Letras mudas'),
                    T('Некоторые буквы пишутся, но не читаются: k перед n — know, knife; w перед r — write, wrong; b после m — climb, comb; l в talk, walk, half, could; h в hour, honest; gh в night, daughter; t в listen, castle. Это следы старого произношения.',
                      'Some letters are written but not pronounced: k in know, w in write, b in climb, l in talk, h in hour, gh in night, t in listen.'),
                    '', 'know — знать; write — писать; climb — карабкаться; hour — час; listen — слушать'),
               rule(N, 'en-tion', T('-tion, -sion — [ʃən]', '-tion, -sion', '-tion, -sion'),
                    T('Окончание -tion читается [ʃən] «шн»: station, information, action. -sion после согласной — тоже [ʃən] (mission), после гласной — [ʒən] (television, decision). Ударение — на слог перед окончанием: infor-MA-tion.',
                      '-tion is [ʃən]: station. -sion is [ʃən] after a consonant (mission), [ʒən] after a vowel (television). Stress falls just before: infor-MA-tion.'),
                    'ʃən', 'station — станция; information — информация; decision — решение'),
           ],
           exercises=[('read', ['about', 'banana', 'know', 'write', 'hour', 'station', 'decision']), ('dictation', ['listen', 'knife', 'action'])]),
    lesson(N, 7, T('Ударение в слове и во фразе', 'Word and sentence stress', 'El acento en la palabra y la frase'),
           level='A2',
           rules=[
               rule(N, 'en-word-stress', T('Ударение в слове', 'Word stress', 'Acento de palabra'),
                    T('Ударение в английском не обозначается, его учат вместе со словом (в словаре — знак ˈ перед ударным слогом). Подсказки: двусложные существительные чаще ударны на первом слоге — TA-ble, DOC-tor, а глаголы — на втором — be-GIN, de-CIDE. Одно и то же слово может менять ударение: a REC-ord «запись» / to re-CORD «записывать», a PRES-ent «подарок» / to pre-SENT «представлять».',
                      'Stress is not written: learn it with the word (ˈ in dictionaries). Two-syllable nouns are often stressed first (TA-ble), verbs second (be-GIN). Some words shift: a REC-ord / to re-CORD.'),
                    'ˈ', 'record — запись / записывать; present — подарок / представлять; doctor — врач; begin — начинать'),
               rule(N, 'en-sentence-stress', T('Ударение во фразе', 'Sentence stress', 'Acento de frase'),
                    T('Во фразе ударны смысловые слова — существительные, глаголы, прилагательные, вопросительные слова: I WANT to GO HOME. Служебные — артикли, предлоги, местоимения, вспомогательные глаголы — проговариваются быстро и слабо (EN-P6). Поэтому английская речь звучит ритмично: удар — быстрые слоги — удар.',
                      'Content words are stressed (I WANT to GO HOME); function words are quick and weak. That gives English its rhythm.'),
                    '', 'I want to go home. — Я хочу домой.; Where do you live? — Где ты живёшь?'),
           ],
           exercises=[('read', ['record', 'present', 'begin', 'doctor', 'information']), ('pairs', pairs('desert/dessert'))]),
]


def main():
    out = ES + EN
    for d in out:
        with open(os.path.join(OUT, d['id'] + '.json'), 'w', encoding='utf8') as f:
            f.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print(f'уроков звучания записано: {len(out)}')


if __name__ == '__main__':
    main()
