# ИИ-черновик (D-25): английские прилагательные партии 4 (LNG-S1-032) — остаток каркаса.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
present|присутствующий; нынешний|Is everyone present?|Все присутствуют?|friends|more
smart|умный; нарядный|That was a smart idea.|Это была умная мысль.|it|er
key|ключевой|The key point is the price.|Ключевой момент — цена.|it|
certain|определённый; уверенный|I'm certain we booked a double room.|Я уверен, что мы бронировали двухместный номер.|travel|more
interested|заинтересованный|I'm interested in Spanish music.|Я интересуюсь испанской музыкой.|friends|more|interested in + существительное; interesting — «интересный»
major|главный, крупный|There is a major problem with the server.|Есть серьёзная проблема с сервером.|it|
difficult|трудный|The exam was difficult.|Экзамен был трудным.|daily|more
personal|личный|This is a personal message.|Это личное сообщение.|friends|more
proud|гордый|I'm proud of you.|Я горжусь тобой.|friends|er
angry|злой, сердитый|He was angry about the delay.|Он был зол из-за задержки.|travel|er
sad|грустный|The ending was really sad.|Концовка была очень грустной.|friends|er dbl
drunk|пьяный|He was a bit drunk after the party.|Он немного перебрал после вечеринки.|friends|more
honest|честный|Be honest with me.|Будь со мной честен.|friends|more
third|третий|Our room is on the third floor.|Наш номер на третьем этаже.|travel|
hungry|голодный|I'm hungry, let's eat.|Я проголодался, давай поедим.|friends|cmp=hungrier/hungriest
private|частный; личный|Is it a private beach?|Это частный пляж?|travel|more
cute|милый|Your dog is so cute!|Твоя собака такая милая!|friends|er
slow|медленный|The wifi is very slow.|Вайфай очень медленный.|travel|er
large|большой|We need a large table.|Нам нужен большой стол.|friends|er
french|французский|They speak French at the hotel.|В отеле говорят по-французски.|travel|
impossible|невозможный|It's impossible to book a table tonight.|Сегодня вечером невозможно забронировать столик.|friends|more
huge|огромный|The room is huge.|Номер огромный.|travel|er
south|южный|We went to the south of Spain.|Мы ездили на юг Испании.|travel|
dirty|грязный|The towels were dirty.|Полотенца были грязными.|travel|er
fat|жирный; толстый|Cheese has a lot of fat.|В сыре много жира.|daily|er dbl
final|окончательный; финальный|This is the final price.|Это окончательная цена.|travel|more
low|низкий|The price is quite low.|Цена довольно низкая.|travel|er
nervous|нервничающий|I'm nervous before flights.|Я нервничаю перед полётами.|travel|more
fit|в форме; подходящий|He's very fit for his age.|Для своего возраста он в отличной форме.|daily|er dbl
awesome|потрясающий|The concert was awesome!|Концерт был потрясающим!|friends|more
surprised|удивлённый|I was surprised to see you here.|Я удивился, увидев тебя здесь.|friends|more
innocent|невиновный|The kids look so innocent.|Дети выглядят такими невинными.|friends|more
guilty|виноватый|I feel guilty about being late.|Мне стыдно, что я опоздал.|friends|er
heavy|тяжёлый|My suitcase is too heavy.|Мой чемодан слишком тяжёлый.|travel|er
pregnant|беременная|She is five months pregnant.|У неё пятый месяц беременности.|daily|more
favorite|любимый|What's your favorite song?|Какая твоя любимая песня?|friends|
silly|глупый, дурацкий|It's a silly mistake.|Это глупая ошибка.|friends|er
fresh|свежий|The bread is fresh.|Хлеб свежий.|travel|er
complete|полный; завершённый|The installation is complete.|Установка завершена.|it|more
double|двойной|We booked a double room.|Мы забронировали двухместный номер.|travel|
wild|дикий|We saw wild horses.|Мы видели диких лошадей.|travel|er
empty|пустой|The bus was almost empty.|Автобус был почти пустой.|travel|er
warm|тёплый|The sea is warm in August.|В августе море тёплое.|travel|er
ridiculous|нелепый|The price is ridiculous.|Цена просто нелепая.|travel|more
medical|медицинский|You need medical insurance.|Вам нужна медицинская страховка.|travel|
famous|известный|This café is famous for its churros.|Это кафе известно своими чуррос.|travel|more
asleep|спящий|The kids are asleep.|Дети спят.|travel|
awful|ужасный|The weather was awful.|Погода была ужасной.|travel|more
willing|готовый, согласный|Are you willing to help?|Ты готов помочь?|friends|more
excellent|отличный|The service was excellent.|Обслуживание было отличным.|travel|
responsible|ответственный|Who is responsible for the booking?|Кто отвечает за бронирование?|it|more
common|распространённый, общий|It's a common mistake.|Это распространённая ошибка.|daily|er|Сравнительная: commoner или more common
main|главный|The main station is near the center.|Главный вокзал рядом с центром.|travel|
necessary|необходимый|Is a visa necessary?|Нужна ли виза?|travel|more
several|несколько|We waited several hours.|Мы ждали несколько часов.|travel|
blind|слепой|The shop has a blind corner.|В магазине есть слепой угол.|daily|er
tight|тугой; тесный; плотный|The schedule is tight.|График плотный.|travel|er
powerful|мощный|This laptop is powerful.|Этот ноутбук мощный.|it|more
natural|природный; естественный|The park is a natural wonder.|Парк — природное чудо.|travel|more
loud|громкий|The music was too loud.|Музыка была слишком громкой.|friends|er
horrible|ужасный|The traffic was horrible.|Пробки были ужасными.|travel|more
weak|слабый|The signal is weak here.|Здесь слабый сигнал.|travel|er
incredible|невероятный|The view was incredible.|Вид был невероятным.|travel|more
dumb|глупый|That was a dumb question.|Это был глупый вопрос.|friends|er
fake|поддельный|Be careful, it's a fake ticket.|Осторожно, это поддельный билет.|travel|
original|оригинальный; первоначальный|Do you have the original document?|У вас есть оригинал документа?|travel|more
bright|яркий|The room is bright and sunny.|Номер светлый и солнечный.|travel|er
dry|сухой|The weather is dry in summer.|Летом погода сухая.|travel|cmp=drier/driest
jealous|ревнивый; завидующий|She is jealous of my trip.|Она завидует моей поездке.|friends|more
ugly|уродливый|The building is ugly but useful.|Здание некрасивое, но удобное.|travel|cmp=uglier/ugliest
comfortable|удобный|The bed is very comfortable.|Кровать очень удобная.|travel|more
usual|обычный|I'll have the usual, please.|Мне как обычно, пожалуйста.|friends|more
aware|осведомлённый|Are you aware of the delay?|Вы знаете о задержке?|travel|more
british|британский|He has a British accent.|У него британский акцент.|friends|
social|социальный; общительный|She is very social.|Она очень общительная.|friends|more
tiny|крошечный|The room was tiny.|Номер был крошечным.|travel|er
soft|мягкий|The pillow is too soft.|Подушка слишком мягкая.|travel|er
lonely|одинокий|I felt lonely in a new city.|В новом городе я чувствовал себя одиноко.|friends|er
brave|храбрый|You were very brave.|Ты был очень смелым.|friends|er
handsome|красивый (о мужчине)|He is a handsome man.|Он красивый мужчина.|friends|more
ancient|древний|We visited an ancient temple.|Мы посетили древний храм.|travel|more
flat|плоский; ровный|The road is flat here.|Здесь дорога ровная.|travel|er dbl
insane|безумный|The traffic here is insane.|Движение здесь безумное.|travel|more
tall|высокий|My brother is very tall.|Мой брат очень высокий.|friends|er
spare|запасной|Do you have a spare key?|У вас есть запасной ключ?|travel|
loose|свободный; расшатанный|These trousers are too loose.|Эти брюки слишком свободны.|travel|er
fancy|причудливый; шикарный|It's a fancy restaurant.|Это шикарный ресторан.|friends|cmp=fancier/fanciest
sudden|внезапный|There was a sudden storm.|Случилась внезапная гроза.|travel|
exciting|захватывающий|The trip was exciting.|Поездка была захватывающей.|travel|more
subject|тематический, подверженный|Prices are subject to change.|Цены могут измениться.|travel|
legal|законный|Is it legal to park here?|Здесь законно парковаться?|travel|more
rough|грубый; неровный; бурный|The sea was rough.|Море было неспокойным.|travel|er
likely|вероятный|It's likely to rain tomorrow.|Завтра, вероятно, будет дождь.|travel|cmp=likelier/likeliest
''', 'en', 'adj')
