# ИИ-черновик (D-25): английские прилагательные сверх каркаса топ-200 (LNG-S1-032).
# Ранг продолжает каркас (201+), уровень — lvl, ext.extra.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
afraid|испуганный|I'm afraid of flying.|Я боюсь летать.|travel|more lvl=A2
amazing|удивительный|The view was amazing.|Вид был удивительный.|travel|more lvl=A2
annoying|раздражающий|The noise is really annoying.|Шум действительно раздражает.|travel|more lvl=B1
anxious|тревожный|I'm anxious about the interview.|Я переживаю из-за собеседования.|it|more lvl=B2
available|доступный, свободный|Is the room available tonight?|Номер свободен на сегодня?|travel|more lvl=B1
average|средний|The average price is fifty euros.|Средняя цена — пятьдесят евро.|travel|lvl=B1
awkward|неловкий|It was an awkward silence.|Повисла неловкая тишина.|friends|er lvl=B2
bored|скучающий|I was bored at the airport.|Мне было скучно в аэропорту.|travel|more lvl=A2
boring|скучный|The film was boring.|Фильм был скучным.|friends|more lvl=A2
broken|сломанный|The elevator is broken.|Лифт сломан.|travel|lvl=A2
busy|занятый|The restaurant is busy on Friday.|В пятницу в ресторане людно.|friends|cmp=busier/busiest lvl=A2
calm|спокойный|The sea was calm.|Море было спокойным.|travel|er lvl=B1
careful|осторожный|Be careful on the stairs.|Осторожнее на лестнице.|travel|more lvl=A2
careless|небрежный|That was a careless mistake.|Это была небрежная ошибка.|it|more lvl=B2
cheerful|весёлый|She is always cheerful.|Она всегда весёлая.|friends|more lvl=B1
clever|сообразительный|That's a clever solution.|Это умное решение.|it|er lvl=B1
close|близкий|We are close friends.|Мы близкие друзья.|friends|er lvl=A2
clumsy|неуклюжий|I'm so clumsy, sorry!|Я такой неуклюжий, простите!|friends|cmp=clumsier/clumsiest lvl=B2
cold|холодный|The water is too cold.|Вода слишком холодная.|travel|er lvl=A1
colorful|красочный|The market is very colorful.|Рынок очень красочный.|travel|more lvl=B1
confident|уверенный|I feel confident about the exam.|Я уверен в себе перед экзаменом.|daily|more lvl=B1
confusing|запутанный|The map is confusing.|Карта запутанная.|travel|more lvl=B1
cozy|уютный|The café is small and cozy.|Кафе маленькое и уютное.|friends|cmp=cozier/coziest lvl=B1
crazy|сумасшедший|That's a crazy idea!|Какая безумная идея!|friends|cmp=crazier/craziest lvl=A2
creative|творческий|She has a creative job.|У неё творческая работа.|it|more lvl=B1
crowded|многолюдный|The beach was crowded.|Пляж был переполнен.|travel|more lvl=B1
curious|любопытный|I'm curious about your trip.|Мне любопытна твоя поездка.|friends|more lvl=B1
dangerous|опасный|Is it dangerous to swim here?|Здесь опасно плавать?|travel|more lvl=A2
dark|тёмный|The street was dark.|Улица была тёмной.|travel|er lvl=A1
dear|дорогой (в обращении)|Dear Anna, thank you for the invitation.|Дорогая Анна, спасибо за приглашение.|friends|er lvl=A1
deep|глубокий|The lake is very deep.|Озеро очень глубокое.|travel|er lvl=A2
delicious|вкусный|The soup was delicious.|Суп был очень вкусным.|friends|more lvl=A2
delighted|в восторге|I'm delighted to meet you.|Очень рад с вами познакомиться.|friends|more lvl=B2
disappointed|разочарованный|We were disappointed with the hotel.|Мы были разочарованы отелем.|travel|more lvl=B1
disappointing|разочаровывающий|The result was disappointing.|Результат разочаровал.|it|more lvl=B1
distant|дальний|The mountains are distant.|Горы далеко.|travel|more lvl=B2
dizzy|с головокружением|I feel dizzy.|У меня кружится голова.|daily|cmp=dizzier/dizziest lvl=B2
dull|скучный; тусклый|The meeting was dull.|Совещание было скучным.|it|er lvl=B2
eager|нетерпеливый, жаждущий|I'm eager to see you.|Мне не терпится тебя увидеть.|friends|er lvl=B2
easy|лёгкий|The test was easy.|Тест был лёгким.|daily|cmp=easier/easiest lvl=A1
efficient|эффективный|This tool is very efficient.|Этот инструмент очень эффективен.|it|more lvl=B2
elderly|пожилой|An elderly man helped us.|Нам помог пожилой мужчина.|travel|lvl=B2
embarrassed|смущённый|I was embarrassed about my mistake.|Мне было неловко из-за ошибки.|friends|more lvl=B1
embarrassing|неловкий|It was an embarrassing moment.|Это был неловкий момент.|friends|more lvl=B2
enormous|громадный|The cathedral is enormous.|Собор громадный.|travel|lvl=B2
entire|весь, целый|We spent the entire day on the beach.|Мы провели весь день на пляже.|travel|lvl=B1
exhausted|измученный|I'm exhausted after the flight.|Я вымотался после перелёта.|travel|more lvl=B1
expensive|дорогой|The hotel is too expensive.|Отель слишком дорогой.|travel|more lvl=A2
fair|справедливый; ярмарочный|That's a fair price.|Это справедливая цена.|travel|er lvl=B1
familiar|знакомый|This song sounds familiar.|Эта песня кажется знакомой.|friends|more lvl=B1
fantastic|фантастический|The concert was fantastic!|Концерт был фантастическим!|friends|more lvl=A2
fast|быстрый|The train is very fast.|Поезд очень быстрый.|travel|er lvl=A1
fierce|яростный|There was a fierce storm.|Была яростная буря.|travel|er lvl=B2
flexible|гибкий|My schedule is flexible.|Мой график гибкий.|it|more lvl=B1
foggy|туманный|It's foggy this morning.|Сегодня утром туман.|travel|cmp=foggier/foggiest lvl=B1
foreign|иностранный|I'm learning a foreign language.|Я учу иностранный язык.|daily|lvl=B1
frightened|напуганный|The kids were frightened by the thunder.|Дети испугались грома.|travel|more lvl=B1
frozen|замороженный|Is the fish fresh or frozen?|Рыба свежая или замороженная?|friends|lvl=B1
funny|смешной|He is a very funny guy.|Он очень смешной парень.|friends|cmp=funnier/funniest lvl=A1
generous|щедрый|Thanks, that's very generous.|Спасибо, это очень щедро.|friends|more lvl=B1
gentle|мягкий, нежный|The music was soft and gentle.|Музыка была мягкой и нежной.|friends|er lvl=B1
glad|рад|I'm glad you came.|Я рад, что ты пришёл.|friends|cmp=gladder/gladdest lvl=A2
gorgeous|великолепный|The view is gorgeous.|Вид великолепный.|travel|more lvl=B2
grateful|благодарный|I'm grateful for your help.|Я благодарен за твою помощь.|friends|more lvl=B1
grumpy|ворчливый|He's grumpy in the morning.|По утрам он ворчливый.|friends|cmp=grumpier/grumpiest lvl=B2
helpful|полезный; отзывчивый|The staff were very helpful.|Персонал был очень отзывчив.|travel|more lvl=B1
helpless|беспомощный|I felt helpless without my phone.|Без телефона я чувствовал себя беспомощным.|travel|more lvl=B2
hilarious|уморительный|The film was hilarious.|Фильм был уморительным.|friends|more lvl=B2
hopeful|полный надежд|We are hopeful about the weather.|Мы надеемся на хорошую погоду.|travel|more lvl=B2
hopeless|безнадёжный|I'm hopeless at cooking.|Я безнадёжен в готовке.|friends|more lvl=B2
hot|горячий, жаркий|It's very hot today.|Сегодня очень жарко.|travel|er dbl lvl=A1
humid|влажный|The air is humid in summer.|Летом воздух влажный.|travel|more lvl=B2
icy|ледяной|The road was icy.|Дорога была обледенелой.|travel|cmp=icier/iciest lvl=B2
ideal|идеальный|It's an ideal place for a picnic.|Это идеальное место для пикника.|travel|more lvl=B1
impatient|нетерпеливый|The kids were impatient.|Дети были нетерпеливы.|travel|more lvl=B2
impressive|впечатляющий|The cathedral is impressive.|Собор впечатляет.|travel|more lvl=B1
independent|независимый|She is a very independent traveler.|Она очень самостоятельный путешественник.|travel|more lvl=B2
informal|неформальный|It was an informal dinner.|Это был неформальный ужин.|friends|more lvl=B2
inexpensive|недорогой|We found an inexpensive hotel.|Мы нашли недорогой отель.|travel|more lvl=B1
interesting|интересный|It was an interesting trip.|Это была интересная поездка.|travel|more lvl=A2
irritating|раздражающий|The delay is irritating.|Задержка раздражает.|travel|more lvl=B2
jolly|весёлый|He is a jolly man.|Он весёлый человек.|friends|cmp=jollier/jolliest lvl=B2
juicy|сочный|The oranges are juicy.|Апельсины сочные.|travel|cmp=juicier/juiciest lvl=B2
keen|увлечённый|She is keen on hiking.|Она увлекается походами.|friends|er lvl=B2
kind|добрый|Thank you, you're very kind.|Спасибо, вы очень добры.|friends|er lvl=A2
lazy|ленивый|I feel lazy today.|Сегодня мне лень.|friends|cmp=lazier/laziest lvl=A2
light|лёгкий; светлый|My bag is very light.|Моя сумка очень лёгкая.|travel|er lvl=A2
literary|литературный|It's a literary prize.|Это литературная премия.|friends|lvl=B2
lively|оживлённый|The street is lively at night.|Ночью улица оживлена.|travel|cmp=livelier/liveliest lvl=B2
local|местный|Try the local food.|Попробуйте местную еду.|travel|lvl=A2
lovely|прекрасный, милый|What a lovely garden!|Какой прекрасный сад!|friends|cmp=lovelier/loveliest lvl=A2
lucky|везучий|We were lucky with the weather.|Нам повезло с погодой.|travel|cmp=luckier/luckiest lvl=A2
mad|сумасшедший; злой|Are you mad at me?|Ты на меня сердишься?|friends|er dbl lvl=B1
massive|огромный|The festival drew a massive crowd.|Фестиваль собрал огромную толпу.|friends|more lvl=B2
mature|зрелый|She is very mature for her age.|Она очень зрелая для своего возраста.|friends|er lvl=B2
mean|злой; подлый|Don't be mean to your brother.|Не будь злым с братом.|friends|er lvl=B1
messy|неряшливый|My room is messy.|В моей комнате беспорядок.|daily|cmp=messier/messiest lvl=B2
mild|мягкий (климат)|Winters are mild here.|Зимы здесь мягкие.|travel|er lvl=B2
modern|современный|The hotel is modern and clean.|Отель современный и чистый.|travel|more lvl=A2
narrow|узкий|The streets are narrow.|Улицы узкие.|travel|er lvl=B1
naughty|непослушный|The kids were naughty today.|Сегодня дети были непослушными.|friends|cmp=naughtier/naughtiest lvl=B2
neat|аккуратный|Her notes are neat.|Её записи аккуратные.|daily|er lvl=B2
neighboring|соседний|We visited the neighboring town.|Мы съездили в соседний город.|travel|lvl=B2
nice|хороший, приятный|Have a nice trip!|Приятной поездки!|friends|er lvl=A1
noisy|шумный|The street is noisy at night.|Ночью на улице шумно.|travel|cmp=noisier/noisiest lvl=A2
normal|обычный|It's a normal day.|Это обычный день.|daily|more lvl=A2
numerous|многочисленный|There are numerous restaurants nearby.|Поблизости множество ресторанов.|travel|more lvl=B2
obvious|очевидный|The answer is obvious.|Ответ очевиден.|daily|more lvl=B2
odd|странный|That's odd, the door is open.|Странно, дверь открыта.|friends|er dbl lvl=B1
offline|офлайн|The map works offline.|Карта работает офлайн.|it|lvl=B1
old-fashioned|старомодный|It's an old-fashioned café.|Это старомодное кафе.|friends|more lvl=B2
open|открытый|The shop is open until nine.|Магазин открыт до девяти.|travel|lvl=A1
optimistic|оптимистичный|I'm optimistic about the weather.|Я настроен оптимистично насчёт погоды.|travel|more lvl=B2
ordinary|обыкновенный|It was an ordinary day.|Это был обычный день.|daily|more lvl=B2
organized|организованный|She is very organized.|Она очень организованная.|it|more lvl=B1
outdoor|уличный|We love outdoor concerts.|Мы любим концерты под открытым небом.|friends|lvl=B1
packed|переполненный|The train was packed.|Поезд был набит битком.|travel|more lvl=B1
painful|болезненный|My foot is painful.|У меня болит нога.|daily|more lvl=B1
patient|терпеливый|Please be patient.|Пожалуйста, наберитесь терпения.|travel|more lvl=B1
peaceful|мирный, спокойный|The village is peaceful.|Деревня очень спокойная.|travel|more lvl=B1
perfect|идеальный|It's the perfect place for lunch.|Это идеальное место для обеда.|friends|more lvl=A2
pleasant|приятный|We had a pleasant evening.|Мы приятно провели вечер.|friends|more lvl=B1
pleased|довольный|I'm pleased to meet you.|Рад познакомиться.|friends|more lvl=A2
polite|вежливый|The waiter was very polite.|Официант был очень вежлив.|travel|er lvl=B1
poor|бедный; плохой|The signal is poor here.|Здесь плохой сигнал.|travel|er lvl=A2
popular|популярный|It's a popular restaurant.|Это популярный ресторан.|friends|more lvl=A2
positive|положительный|He has a positive attitude.|У него позитивный настрой.|friends|more lvl=B1
practical|практичный|These shoes are practical.|Эти туфли практичные.|travel|more lvl=B2
precious|драгоценный|Time with friends is precious.|Время с друзьями драгоценно.|friends|more lvl=B2
pretty|симпатичный|What a pretty square!|Какая симпатичная площадь!|travel|cmp=prettier/prettiest lvl=A2
proper|надлежащий|We need a proper map.|Нам нужна нормальная карта.|travel|lvl=B1
pure|чистый|The water is pure.|Вода чистая.|travel|er lvl=B2
quick|быстрый|Let's have a quick coffee.|Давай быстро выпьем кофе.|friends|er lvl=A2
quiet|тихий|We need a quiet room.|Нам нужен тихий номер.|travel|er lvl=A2
rare|редкий|It's a rare chance.|Это редкий шанс.|daily|er lvl=B1
raw|сырой|The fish is raw.|Рыба сырая.|friends|lvl=B2
ready|готовый|Are you ready to go?|Ты готов идти?|travel|cmp=readier/readiest lvl=A1
real|настоящий|Is this real gold?|Это настоящее золото?|friends|lvl=A2
reasonable|разумный|The prices are reasonable.|Цены разумные.|travel|more lvl=B1
relaxed|расслабленный|The atmosphere was relaxed.|Атмосфера была расслабленной.|friends|more lvl=B1
relaxing|расслабляющий|It was a relaxing weekend.|Это были спокойные выходные.|travel|more lvl=B1
reliable|надёжный|The train service is reliable.|Железная дорога работает надёжно.|travel|more lvl=B2
rich|богатый|It's a rich and varied country.|Это богатая и разнообразная страна.|travel|er lvl=A2
ripe|спелый|The peaches are ripe.|Персики спелые.|travel|er lvl=B2
romantic|романтичный|It's a romantic restaurant.|Это романтичный ресторан.|friends|more lvl=B1
round|круглый|We sat at a round table.|Мы сидели за круглым столом.|friends|er lvl=B1
rude|грубый|The waiter was rude.|Официант был груб.|travel|er lvl=B1
safe|безопасный|Is the city safe at night?|Безопасен ли город ночью?|travel|er lvl=A2
salty|солёный|The soup is too salty.|Суп слишком солёный.|friends|cmp=saltier/saltiest lvl=B2
satisfied|довольный|We were satisfied with the service.|Мы остались довольны обслуживанием.|travel|more lvl=B1
scared|напуганный|I was scared of the dark.|Я боялся темноты.|friends|more lvl=B1
scary|страшный|The film was too scary.|Фильм был слишком страшным.|friends|cmp=scarier/scariest lvl=B1
selfish|эгоистичный|Don't be selfish.|Не будь эгоистом.|friends|more lvl=B2
sensible|разумный|It's a sensible idea.|Это разумная идея.|daily|more lvl=B2
sensitive|чувствительный|She is very sensitive.|Она очень чувствительная.|friends|more lvl=B2
serious|серьёзный|Is it a serious problem?|Это серьёзная проблема?|it|more lvl=A2
severe|суровый|There was a severe storm.|Была сильная буря.|travel|er lvl=B2
shallow|мелкий|The sea is shallow here.|Здесь море мелкое.|travel|er lvl=B2
sharp|острый|Be careful, the knife is sharp.|Осторожно, нож острый.|friends|er lvl=B1
shiny|блестящий|The car is new and shiny.|Машина новая и блестящая.|daily|cmp=shinier/shiniest lvl=B2
short|короткий; низкий|It's a short walk to the beach.|До пляжа недалеко идти.|travel|er lvl=A1
shy|застенчивый|He is shy at parties.|Он стесняется на вечеринках.|friends|cmp=shyer/shyest lvl=B1
sick|больной|I felt sick on the boat.|Меня укачало на лодке.|travel|er lvl=A2
silent|тихий, молчаливый|The room was silent.|В комнате было тихо.|friends|more lvl=B1
simple|простой|It's a simple recipe.|Это простой рецепт.|friends|er lvl=A2
single|одиночный; холостой|A single room, please.|Одноместный номер, пожалуйста.|travel|lvl=A2
skilled|опытный, умелый|He is a skilled driver.|Он опытный водитель.|daily|more lvl=B2
sleepy|сонный|I'm sleepy after lunch.|После обеда я сонный.|daily|cmp=sleepier/sleepiest lvl=B1
slim|тонкий, стройный|The phone is slim.|Телефон тонкий.|it|er dbl lvl=B2
small|маленький|We stayed in a small hotel.|Мы остановились в маленьком отеле.|travel|er lvl=A1
smooth|гладкий; плавный|The flight was smooth.|Полёт был спокойным.|travel|er lvl=B2
sorry|виноватый; сожалеющий|I'm sorry, I'm late.|Простите, я опоздал.|friends|cmp=sorrier/sorriest lvl=A1
sour|кислый|The milk is sour.|Молоко прокисло.|friends|er lvl=B2
special|особенный|It's a special day for us.|Для нас это особенный день.|friends|more lvl=A2
spicy|острый (о еде)|The food is too spicy.|Еда слишком острая.|friends|cmp=spicier/spiciest lvl=B1
splendid|великолепный|The view is splendid.|Вид великолепный.|travel|more lvl=B2
steady|устойчивый, ровный|The connection is steady.|Соединение стабильное.|it|cmp=steadier/steadiest lvl=B2
steep|крутой|The path is steep.|Тропа крутая.|travel|er lvl=B1
sticky|липкий|The table is sticky.|Стол липкий.|friends|cmp=stickier/stickiest lvl=B2
stormy|штормовой|The weather was stormy.|Погода была штормовой.|travel|cmp=stormier/stormiest lvl=B1
strange|странный|I heard a strange noise.|Я услышал странный шум.|daily|er lvl=A2
stressful|напряжённый|It was a stressful week.|Это была напряжённая неделя.|it|more lvl=B2
strict|строгий|The rules are strict.|Правила строгие.|travel|er lvl=B1
strong|сильный|The wind is strong today.|Сегодня сильный ветер.|travel|er lvl=A2
stupid|глупый|That was a stupid mistake.|Это была глупая ошибка.|friends|er lvl=A2
successful|успешный|The party was successful.|Вечеринка удалась.|friends|more lvl=B1
sunny|солнечный|Tomorrow will be sunny.|Завтра будет солнечно.|travel|cmp=sunnier/sunniest lvl=A1
super|супер|The pizza was super!|Пицца была супер!|friends|lvl=A2
sweet|сладкий; милый|This coffee is too sweet.|Этот кофе слишком сладкий.|friends|er lvl=A2
tasty|вкусный|The soup is really tasty.|Суп очень вкусный.|friends|cmp=tastier/tastiest lvl=A2
temporary|временный|It's a temporary solution.|Это временное решение.|it|more lvl=B2
tender|нежный; мягкий|The meat is tender.|Мясо мягкое.|friends|er lvl=B2
terrific|потрясающий|We had a terrific time.|Мы потрясающе провели время.|friends|more lvl=B2
thick|толстый; густой|The fog is thick.|Туман густой.|travel|er lvl=B1
thin|тонкий|The walls are thin.|Стены тонкие.|travel|er dbl lvl=A2
thirsty|жаждущий|I'm thirsty, let's get a drink.|Хочется пить, давай возьмём что-нибудь.|travel|cmp=thirstier/thirstiest lvl=A2
tidy|аккуратный, прибранный|The room was clean and tidy.|Номер был чистым и аккуратным.|travel|cmp=tidier/tidiest lvl=B2
tired|усталый|I'm tired after the trip.|Я устал после поездки.|travel|more lvl=A1
tough|трудный; жёсткий|It was a tough week.|Это была тяжёлая неделя.|it|er lvl=B2
tourist|туристический|It's a tourist area.|Это туристический район.|travel|lvl=B1
traditional|традиционный|We had a traditional dinner.|У нас был традиционный ужин.|friends|more lvl=B1
tropical|тропический|The island has a tropical climate.|На острове тропический климат.|travel|lvl=B2
typical|типичный|It's a typical Spanish village.|Это типичная испанская деревня.|travel|more lvl=B1
unable|неспособный|I'm unable to come tonight.|Я не смогу прийти сегодня вечером.|friends|lvl=B2
unbelievable|невероятный|The price is unbelievable.|Цена невероятная.|travel|more lvl=B2
uncomfortable|неудобный|The bed was uncomfortable.|Кровать была неудобной.|travel|more lvl=B1
unfair|несправедливый|That's unfair.|Это несправедливо.|friends|more lvl=B1
unfortunate|неудачный|It was an unfortunate mistake.|Это была досадная ошибка.|travel|more lvl=B2
unhappy|несчастный|They were unhappy with the room.|Они были недовольны номером.|travel|cmp=unhappier/unhappiest lvl=B1
unique|уникальный|The hotel is unique.|Этот отель уникален.|travel|more lvl=B1
unknown|неизвестный|The sender is unknown.|Отправитель неизвестен.|it|lvl=B1
unlucky|невезучий|We were unlucky with the weather.|С погодой нам не повезло.|travel|cmp=unluckier/unluckiest lvl=B1
unusual|необычный|It's an unusual name.|Это необычное имя.|friends|more lvl=B1
upset|расстроенный|She was upset about the delay.|Она расстроилась из-за задержки.|travel|more lvl=B1
urgent|срочный|It's urgent, please call me.|Это срочно, позвони мне.|it|more lvl=B1
useful|полезный|This app is really useful.|Это приложение очень полезное.|it|more lvl=A2
useless|бесполезный|This map is useless.|Эта карта бесполезна.|travel|more lvl=B1
valuable|ценный|Don't leave valuable things in the room.|Не оставляйте ценные вещи в номере.|travel|more lvl=B1
various|различный|There are various options.|Есть разные варианты.|travel|lvl=B2
vast|обширный|The desert is vast.|Пустыня обширна.|travel|er lvl=B2
violent|жестокий; сильный|There was a violent storm.|Была сильная гроза.|travel|more lvl=B2
visible|видимый|The mountains are visible from the hotel.|Горы видны из отеля.|travel|more lvl=B2
vivid|яркий|She has vivid memories of the trip.|У неё яркие воспоминания о поездке.|travel|er lvl=B2
vital|жизненно важный|It's vital to have a ticket.|Жизненно важно иметь билет.|travel|more lvl=B2
wet|мокрый|My shoes are wet.|Мои туфли мокрые.|travel|er dbl lvl=A2
whole|целый|We ate the whole pizza.|Мы съели всю пиццу.|friends|lvl=A2
wise|мудрый|That was a wise decision.|Это было мудрое решение.|daily|er lvl=B1
wonderful|чудесный|We had a wonderful time.|Мы чудесно провели время.|friends|more lvl=A2
worried|обеспокоенный|I'm worried about the flight.|Я беспокоюсь о рейсе.|travel|more lvl=A2
worthwhile|стоящий|The trip was worthwhile.|Поездка того стоила.|travel|more lvl=B2
wrong|неправильный|You have the wrong address.|У вас неверный адрес.|travel|lvl=A1
young|молодой|We are a young team.|Мы молодая команда.|it|er lvl=A1
yummy|вкусный (разг.)|The cake was yummy!|Торт был очень вкусным!|friends|cmp=yummier/yummiest lvl=B1
''', 'en', 'adj')
