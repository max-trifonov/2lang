# ИИ-черновик (D-25): английские существительные партии 4 (LNG-S1-032). Запись — dsl.py.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
town|городок, город|We walked around the old town.|Мы гуляли по старому городу.|travel|pair=pueblo
couple|пара; пара человек|We're a couple of minutes late.|Мы опаздываем на пару минут.|friends|pair=pareja|a couple of — «пара, несколько»
trust|доверие|Trust is important in a team.|Доверие важно в команде.|friends|nopl pair=confianza
fact|факт|That's a fact, not an opinion.|Это факт, а не мнение.|daily|pair=hecho
bed|кровать|The bed in our room is very comfortable.|Кровать в нашем номере очень удобная.|travel|pair=cama
country|страна; сельская местность|Which country are you from?|Из какой ты страны?|travel|pl=countries pair=país
front|перед, фасад; in front of — перед|Meet me in front of the station.|Встретимся перед вокзалом.|travel|pair=frente
news|новости|I have good news for you.|У меня для тебя хорошие новости.|friends|nopl pair=noticias|Неисчисляемое: the news is, а не «the news are»
food|еда|The food in this restaurant is great.|Еда в этом ресторане отличная.|travel|nopl pair=comida
foot|ступня, нога (ниже щиколотки); фут|My feet hurt after the hike.|У меня болят ноги после похода.|travel|pl=feet pair=pie|on foot — пешком
king|король|The king lived in this palace.|Король жил в этом дворце.|travel|pair=rey
picture|картина; фото|Can you take a picture of us?|Можешь нас сфотографировать?|travel|pair=imagen
captain|капитан|The captain welcomed the passengers.|Капитан поприветствовал пассажиров.|travel|pair=capitán
need|потребность, нужда|There is no need to hurry.|Нет необходимости спешить.|daily|pair=necesidad
human|человек; человеческий|Every human needs friends.|Каждому человеку нужны друзья.|friends|pair=humano
street|улица|Our hotel is on a quiet street.|Наш отель стоит на тихой улице.|travel|pair=calle
boss|начальник|My boss is in a meeting.|Мой начальник на совещании.|it|pl=bosses pair=jefe
parent|родитель|Both my parents live in Moscow.|Оба моих родителя живут в Москве.|friends|pair=padre
dinner|ужин; обед|Are you free for dinner on Friday?|Ты свободен на ужин в пятницу?|friends|pair=cena
company|компания; общество|I work for a small software company.|Я работаю в небольшой софтверной компании.|it|pl=companies pair=empresa
sort|вид, сорт|What sort of music do you like?|Какую музыку ты любишь?|friends|pair=tipo|What sort of… — «Какого рода…»
promise|обещание|A promise is a promise.|Обещание есть обещание.|friends|pair=promesa
state|состояние; штат|The server is in a bad state.|Сервер в плохом состоянии.|it|pair=estado
piece|кусок, часть|Would you like a piece of cake?|Хочешь кусочек торта?|friends|pair=pedazo|a piece of advice / news — «совет, новость»
sign|знак, табличка|Follow the signs to the exit.|Следуйте указателям к выходу.|travel|pair=señal
touch|прикосновение; связь|Let's keep in touch!|Давай оставаться на связи!|friends|pl=touches|keep in touch — поддерживать связь
ring|кольцо; звонок|Give me a ring tomorrow.|Позвони мне завтра.|daily|pair=anillo
uncle|дядя|My uncle lives in Valencia.|Мой дядя живёт в Валенсии.|friends|pair=tío
control|контроль; управление|Passport control is on the left.|Паспортный контроль слева.|travel|pair=control
voice|голос|She has a beautiful voice.|У неё красивый голос.|friends|pair=voz
song|песня|This song reminds me of summer.|Эта песня напоминает мне лето.|friends|pair=canción
earth|земля; Земля|We saw the Earth from the plane window.|Мы видели Землю из окна самолёта.|travel|nopl pair=tierra
hair|волосы|She has long dark hair.|У неё длинные тёмные волосы.|daily|nopl pair=pelo
laugh|смех|He has a loud laugh.|У него громкий смех.|friends|pair=risa
hospital|больница|The hospital is five minutes from here.|Больница в пяти минутах отсюда.|daily|pair=hospital
master|мастер; хозяин; магистр|He is a master of the guitar.|Он мастер игры на гитаре.|friends|pair=maestro
movie|фильм|Let's watch a movie tonight.|Давай посмотрим сегодня фильм.|friends|pair=película
dance|танец|The dance starts at nine.|Танцы начинаются в девять.|friends|pair=baile
air|воздух|The mountain air is fresh.|В горах свежий воздух.|travel|nopl pair=aire
date|дата; свидание|What's the date of your flight?|Какая дата у вашего рейса?|travel|pair=fecha
paper|бумага; газета; статья|Do you have a piece of paper?|У тебя есть лист бумаги?|daily|pair=papel
officer|офицер; сотрудник|The passport officer smiled at us.|Паспортный офицер нам улыбнулся.|travel|pair=oficial
evening|вечер|What are you doing this evening?|Что ты делаешь сегодня вечером?|friends|pair=tarde
sense|смысл; чувство|It makes sense to book early.|Имеет смысл бронировать заранее.|daily|pl=senses pair=sentido|make sense — «иметь смысл»
dream|мечта; сон|Visiting Japan is my dream.|Побывать в Японии — моя мечта.|daily|pair=sueño
road|дорога|The road to the beach is closed.|Дорога к пляжу закрыта.|travel|pair=camino
letter|письмо; буква|I got a letter from my grandmother.|Я получил письмо от бабушки.|daily|pair=carta
mistake|ошибка|Sorry, that was my mistake.|Простите, это моя ошибка.|daily|pair=error
figure|цифра; фигура|The figures are on page five.|Цифры — на пятой странице.|it|pair=cifra
law|закон|It's against the law to park here.|Здесь парковаться запрещено законом.|travel|pair=ley
ball|мяч; бал|The kids are playing with a ball.|Дети играют с мячом.|friends|pair=pelota
land|земля; суша|We saw land after hours at sea.|После многих часов в море мы увидели землю.|travel|pair=tierra
coffee|кофе|Let's grab a coffee after work.|Давай выпьем кофе после работы.|friends|pair=café
horse|лошадь|We rode horses along the beach.|Мы катались на лошадях вдоль пляжа.|travel|pair=caballo
ship|корабль|The ship leaves at noon.|Корабль отходит в полдень.|travel|pair=barco
bag|сумка, пакет|Is this bag yours?|Это твоя сумка?|travel|pair=bolsa
age|возраст|What age are your children?|Сколько лет вашим детям?|daily|pair=edad
future|будущее|What are your plans for the future?|Какие у тебя планы на будущее?|daily|pair=futuro
wonder|чудо|The Alhambra is a wonder of the world.|Альгамбра — чудо света.|travel|pair=maravilla
class|класс; урок|My English class starts at six.|Мой урок английского начинается в шесть.|daily|pl=classes pair=clase
film|фильм; плёнка|Have you seen the new film?|Ты видел новый фильм?|friends|pair=película
choice|выбор|We have a choice of two hotels.|У нас выбор из двух отелей.|travel|pair=opción
arm|рука (от плеча до кисти)|She carried a bag on her arm.|Она несла сумку на руке.|daily|pair=brazo
card|карта, карточка|Can I pay by card?|Можно оплатить картой?|travel|pair=tarjeta
force|сила|The wind blew with great force.|Ветер дул с огромной силой.|daily|pair=fuerza
lady|леди, дама|The lady at the desk helped us.|Дама за стойкой нам помогла.|travel|pl=ladies
rock|камень, скала; рок|We sat on a big rock by the sea.|Мы сидели на большом камне у моря.|travel|pair=roca
yesterday|вчера (сущ.)|Yesterday was a perfect day.|Вчера был идеальный день.|friends|nopl
president|президент; председатель|The president of the club is my brother.|Президент клуба — мой брат.|friends|pair=presidente
rule|правило|What are the rules of this game?|Каковы правила этой игры?|friends|pair=regla
test|тест, проверка|We run the test before every release.|Мы запускаем тест перед каждым релизом.|it|pair=prueba
message|сообщение|I'll send you a message tonight.|Я пришлю тебе сообщение вечером.|friends|pair=mensaje
pain|боль|I have a pain in my back.|У меня боль в спине.|daily|pair=dolor
attack|атака|The site survived an attack last week.|Сайт пережил атаку на прошлой неделе.|it|pair=ataque
wedding|свадьба|We're going to a wedding in June.|Мы идём на свадьбу в июне.|friends|pair=boda
act|действие; закон|It was a kind act.|Это был добрый поступок.|daily|pair=acto
goodbye|прощание; до свидания|We said goodbye at the station.|Мы попрощались на вокзале.|travel|pair=adiós
court|суд; корт|They play tennis on the court.|Они играют в теннис на корте.|friends|pair=corte
mouth|рот; устье|Open your mouth, please.|Откройте рот, пожалуйста.|daily|pair=boca
brain|мозг|Use your brain!|Включи мозги!|daily|pair=cerebro
wall|стена|There are old photos on the wall.|На стене висят старые фото.|daily|pair=pared
crime|преступление|Crime is low in this area.|В этом районе мало преступности.|daily|pair=crimen
animal|животное|Are animals allowed in the hotel?|Можно ли с животными в отель?|travel|pair=animal
bar|бар; плитка, полоса|Let's meet at the bar around nine.|Встретимся в баре около девяти.|friends|pair=bar
mile|миля|The beach is one mile from here.|Пляж в миле отсюда.|travel|pair=milla
service|услуга, обслуживание|The service was slow.|Обслуживание было медленным.|travel|pair=servicio
group|группа|We travel in a small group.|Мы путешествуем небольшой группой.|friends|pair=grupo
table|стол; столик; таблица|A table for four, please.|Столик на четверых, пожалуйста.|friends|pair=mesa
birthday|день рождения|Happy birthday, Anna!|С днём рождения, Анна!|friends|pair=cumpleaños
finish|финиш, конец|The finish is next to the park.|Финиш находится рядом с парком.|friends|pl=finishes
weapon|оружие|Weapons are not allowed on the plane.|Оружие в самолёте запрещено.|travel|pair=arma
camera|камера, фотоаппарат|I forgot my camera at the hotel.|Я забыл фотоаппарат в отеле.|travel|pair=cámara
evidence|доказательство|There is no evidence of a problem.|Нет доказательств проблемы.|it|nopl pair=prueba
agent|агент|The travel agent called me back.|Турагент мне перезвонил.|travel|pair=agente
tree|дерево|We had lunch under a big tree.|Мы пообедали под большим деревом.|travel|pair=árbol
tv|телевизор|There's no TV in the room.|В номере нет телевизора.|daily|pair=televisión
glass|стакан; стекло; очки (glasses)|Can I have a glass of water?|Можно стакан воды?|friends|pl=glasses pair=vaso
club|клуб|We joined a running club.|Мы вступили в клуб бегунов.|friends|pair=club
security|безопасность; охрана|Security checks take about twenty minutes.|Досмотр занимает около двадцати минут.|travel|nopl pair=seguridad
area|район, область|Is this area safe at night?|Этот район безопасен ночью?|travel|pair=zona
information|информация|Where can I get more information?|Где можно получить больше информации?|travel|nopl pair=información|Неисчисляемое: some information, а не informations
situation|ситуация|The situation is under control.|Ситуация под контролем.|daily|pair=situación
floor|пол; этаж|My room is on the third floor.|Мой номер на третьем этаже.|travel|pair=piso
victim|жертва|The victims received help quickly.|Пострадавшие быстро получили помощь.|daily|pair=víctima
ground|земля; основание|The ground floor is a café.|На первом этаже — кафе.|travel|pair=suelo
clothes|одежда|I packed warm clothes for the trip.|Я взял в поездку тёплую одежду.|travel|nopl pair=ropa|Только множественное число: clothes are
window|окно|Can I have a window seat?|Можно место у окна?|travel|pair=ventana
boat|лодка, катер|We took a boat to the island.|Мы доплыли до острова на лодке.|travel|pair=barca
soul|душа|This music is good for the soul.|Эта музыка хороша для души.|friends|pair=alma
history|история|The museum shows the history of the city.|Музей показывает историю города.|travel|pl=histories pair=historia
cell|клетка; ячейка|Type the number in the first cell.|Введите число в первую ячейку.|it|pair=célula
army|армия|My grandfather served in the army.|Мой дедушка служил в армии.|daily|pl=armies pair=ejército
surprise|сюрприз|It's a surprise party for Lena.|Это вечеринка-сюрприз для Лены.|friends|pair=sorpresa
space|пространство; космос|There is not enough space in the car.|В машине мало места.|daily|pair=espacio
patient|пациент|The doctor sees ten patients a day.|Врач принимает десять пациентов в день.|daily|pair=paciente
marriage|брак|Their marriage lasted fifty years.|Их брак продлился пятьдесят лет.|friends|pair=matrimonio
seat|место (сиденье)|Is this seat free?|Это место свободно?|travel|pair=asiento
bird|птица|We saw many birds at the lake.|На озере мы видели много птиц.|travel|pair=pájaro
accident|несчастный случай; авария|There was an accident on the highway.|На шоссе произошла авария.|travel|pair=accidente
scene|сцена; место события|The final scene made me cry.|Последняя сцена заставила меня плакать.|friends|pair=escena
machine|машина, аппарат|The ticket machine is broken.|Билетный автомат сломан.|travel|pair=máquina
attention|внимание|Attention, please! The gate has changed.|Внимание! Выход изменился.|travel|nopl pair=atención
sea|море|The hotel is right by the sea.|Отель стоит прямо у моря.|travel|pair=mar
dress|платье|She wore a blue dress to the wedding.|На свадьбу она надела синее платье.|friends|pl=dresses pair=vestido
relationship|отношения|They have a great relationship.|У них прекрасные отношения.|friends|pair=relación
decision|решение|It was a difficult decision.|Это было трудное решение.|daily|pair=decisión
peace|мир, покой|I need some peace and quiet.|Мне нужны тишина и покой.|daily|nopl pair=paz
cat|кошка|Our cat sleeps all day.|Наша кошка спит весь день.|daily|pair=gato
lunch|обед|Let's have lunch together.|Давайте пообедаем вместе.|friends|pl=lunches pair=almuerzo
government|правительство|The government announced new rules.|Правительство объявило новые правила.|daily|pair=gobierno
radio|радио|They played our song on the radio.|По радио передали нашу песню.|friends|pl=radios pair=radio
art|искусство|We visited an art museum.|Мы были в музее искусств.|travel|nopl pair=arte
fish|рыба|Is the fish fresh today?|Сегодня рыба свежая?|travel|pl=fish pair=pescado
memory|память; воспоминание|I have great memories of that trip.|У меня прекрасные воспоминания о той поездке.|friends|pl=memories pair=recuerdo
respect|уважение|Respect is the basis of friendship.|Уважение — основа дружбы.|friends|nopl pair=respeto
share|доля; акция|Everyone pays their share.|Каждый платит свою долю.|friends|pair=parte
teacher|учитель|My English teacher is from Dublin.|Мой учитель английского из Дублина.|daily|pair=profesor
field|поле; область|He works in the field of design.|Он работает в сфере дизайна.|it|pair=campo
list|список|Make a list of things to pack.|Составь список вещей в дорогу.|travel|pair=lista
gold|золото|The ring is made of gold.|Кольцо сделано из золота.|friends|nopl pair=oro
student|студент|I'm a student at the university.|Я студент университета.|daily|pair=estudiante
partner|партнёр|My partner works from home.|Мой партнёр работает из дома.|friends|pair=pareja
soldier|солдат|The old soldier told us a story.|Старый солдат рассказал нам историю.|daily|pair=soldado
position|позиция; должность|She applied for the position of designer.|Она подала заявку на должность дизайнера.|it|pair=puesto
shoe|туфля, ботинок|My shoes are wet.|Мои ботинки промокли.|travel|pair=zapato
afternoon|вторая половина дня|See you tomorrow afternoon!|До завтра, днём!|friends|pair=tarde
gift|подарок|This is a small gift for you.|Это небольшой подарок для тебя.|friends|pair=regalo
church|церковь|The old church is on the main square.|Старая церковь стоит на главной площади.|travel|pl=churches pair=iglesia
tea|чай|Would you like tea or coffee?|Вам чай или кофе?|friends|pair=té
public|публика, народ|The museum is open to the public.|Музей открыт для публики.|travel|nopl pair=público
mess|беспорядок|Sorry for the mess in the kitchen!|Извини за беспорядок на кухне!|friends|pl=messes
plane|самолёт|Our plane was late.|Наш самолёт опоздал.|travel|pair=avión
contact|контакт; связь|I lost contact with my friend.|Я потерял связь с другом.|friends|pl=contacts pair=contacto
store|магазин; хранилище|There's a small store on the corner.|На углу есть небольшой магазин.|daily|pair=tienda
ice|лёд|Do you want ice in your drink?|Вам лёд в напиток?|friends|nopl pair=hielo
island|остров|We spent a week on a small island.|Мы провели неделю на маленьком острове.|travel|pair=isla
dollar|доллар|The ticket costs ten dollars.|Билет стоит десять долларов.|travel|pair=dólar
flower|цветок|I bought flowers for Mum.|Я купил маме цветы.|friends|pair=flor
boyfriend|парень (друг)|Her boyfriend plays in a band.|Её парень играет в группе.|friends|pair=novio
pleasure|удовольствие|It's a pleasure to meet you.|Рад с вами познакомиться.|friends|pair=placer
shop|магазин|The shop closes at six.|Магазин закрывается в шесть.|daily|pair=tienda
smell|запах|What's that smell?|Что это за запах?|friends|pair=olor
mum|мама (брит.)|My mum makes the best soup.|Моя мама варит лучший суп.|friends
computer|компьютер|My computer is very slow today.|Мой компьютер сегодня очень тормозит.|it|pair=ordenador
apartment|квартира|We rented an apartment near the beach.|Мы сняли квартиру у пляжа.|travel|pair=apartamento
call|звонок|I'll give you a call tonight.|Я позвоню тебе сегодня вечером.|friends|pair=llamada
suit|костюм|He wore a dark suit to the interview.|На собеседование он надел тёмный костюм.|it|pair=traje
action|действие|We need to take action now.|Нужно действовать сейчас.|it|pair=acción
truck|грузовик|A big truck blocked the street.|Большой грузовик перегородил улицу.|travel|pair=camión
college|колледж|She studied design in college.|Она изучала дизайн в колледже.|daily|pair=universidad
beer|пиво|Two beers, please.|Два пива, пожалуйста.|friends|pair=cerveza
difference|разница|What's the difference between these two trains?|В чём разница между этими двумя поездами?|travel|pair=diferencia
track|путь, дорожка; трек|Which track does the train leave from?|С какого пути отправляется поезд?|travel|pair=pista
village|деревня|We stayed in a quiet village.|Мы остановились в тихой деревне.|travel|pair=pueblo
planet|планета|Our planet is beautiful.|Наша планета прекрасна.|daily|pair=planeta
ticket|билет|Two tickets to Seville, please.|Два билета до Севильи, пожалуйста.|travel|pair=billete
wind|ветер|There was a strong wind on the coast.|На побережье был сильный ветер.|travel|pair=viento
finger|палец (руки)|I cut my finger in the kitchen.|Я порезал палец на кухне.|daily|pair=dedo
hero|герой|Every kid needs a hero.|Каждому ребёнку нужен герой.|friends|pl=heroes pair=héroe
professor|профессор|The professor gave a great lecture.|Профессор прочитал отличную лекцию.|daily|pair=profesor
bell|звонок, колокол|The bell rang and everyone left.|Прозвенел звонок, и все ушли.|daily|pair=campana
experience|опыт|I have five years of experience.|У меня пять лет опыта.|it|pair=experiencia
guest|гость|We have guests for dinner tonight.|Сегодня к ужину у нас гости.|friends|pair=invitado
type|тип, вид|What type of room would you like?|Какой тип номера вы хотите?|travel|pair=tipo
hole|дыра, яма|There is a hole in my sock.|В моём носке дырка.|daily|pair=agujero
river|река|We had a picnic by the river.|Мы устроили пикник у реки.|travel|pair=río
wine|вино|Let's order a bottle of red wine.|Закажем бутылку красного вина.|friends|pair=vino
risk|риск|Skipping tests is a big risk.|Пропуск тестов — большой риск.|it|pair=riesgo
form|форма; бланк|Fill out this form, please.|Заполните этот бланк, пожалуйста.|travel|pair=formulario
study|учёба; исследование|Her study of Spanish takes two hours a day.|Занятия испанским у неё занимают два часа в день.|daily|pl=studies pair=estudio
interest|интерес; процент|I have an interest in photography.|Я интересуюсь фотографией.|friends|pair=interés
cash|наличные|Do you accept cash?|Вы принимаете наличные?|travel|nopl pair=efectivo
mountain|гора|We hiked up the mountain.|Мы поднялись в горы.|travel|pair=montaña
duty|долг; обязанность|It's my duty to help.|Это мой долг — помочь.|it|pl=duties pair=deber|duty free — беспошлинно
race|гонка; раса|Did you watch the race?|Ты смотрел гонку?|friends|pair=carrera
stone|камень|The streets are paved with stone.|Улицы вымощены камнем.|travel|pair=piedra
north|север|The village is in the north.|Деревня находится на севере.|travel|nopl pair=norte
engine|двигатель|The engine started with a loud noise.|Двигатель завёлся с громким шумом.|travel|pair=motor
level|уровень|What is your level of Spanish?|Какой у тебя уровень испанского?|daily|pair=nivel
bomb|бомба|The film has a scene with a bomb.|В фильме есть сцена с бомбой.|friends|pair=bomba
bottle|бутылка|Can we get a bottle of water?|Можно бутылку воды?|travel|pair=botella
chicken|курица|I'll have the chicken with rice.|Мне курицу с рисом.|friends|pair=pollo
ghost|привидение|The hotel is said to have a ghost.|Говорят, в отеле живёт призрак.|travel|pair=fantasma
magic|магия|The show was full of magic.|Шоу было полно волшебства.|friends|nopl pair=magia
summer|лето|We always travel in summer.|Летом мы всегда путешествуем.|travel|pair=verano
address|адрес|What's your email address?|Какой у тебя адрес почты?|travel|pl=addresses pair=dirección
second|секунда|Wait a second, please.|Секундочку, пожалуйста.|daily|pair=segundo
battle|битва|The battle was fought here in 1808.|Здесь в 1808 году произошла битва.|travel|pair=batalla
director|директор; режиссёр|The director of the film is Spanish.|Режиссёр фильма — испанец.|friends|pair=director
mission|миссия, задача|Our mission is to learn two languages.|Наша задача — выучить два языка.|daily|pair=misión
aunt|тётя|My aunt invited us for dinner.|Тётя пригласила нас на ужин.|friends|pair=tía
moon|луна|The moon is bright tonight.|Луна сегодня яркая.|friends|pair=luna
issue|вопрос, проблема|There is an issue with my booking.|Возникла проблема с моей бронью.|it|pair=problema
kitchen|кухня|Everybody ends up in the kitchen at parties.|На вечеринках все оказываются на кухне.|friends|pair=cocina
roll|булочка; рулон|Would you like a roll with your soup?|Хотите булочку к супу?|friends
jump|прыжок|The jump was higher than I expected.|Прыжок оказался выше, чем я ожидал.|friends|pair=salto
sky|небо|The sky was full of stars.|Небо было усыпано звёздами.|travel|pl=skies pair=cielo
press|пресса; нажатие|The story was in the press.|История попала в прессу.|daily|nopl pair=prensa
video|видео|I recorded a short video of the show.|Я снял короткое видео шоу.|friends|pl=videos pair=vídeo
trick|трюк, фокус|He showed us a card trick.|Он показал нам карточный фокус.|friends|pair=truco
stage|сцена; этап|The band came out on the stage.|Группа вышла на сцену.|friends|pair=escenario
angel|ангел|You are an angel, thank you!|Ты ангел, спасибо!|friends|pair=ángel
conversation|разговор|We had a long conversation about music.|У нас был долгий разговор о музыке.|friends|pair=conversación
mate|приятель; напарник|I'm meeting a mate for a drink.|Я встречаюсь с приятелем выпить.|friends|pair=amigo|Британское неформальное: mate — «дружище»
leader|лидер|The tour leader speaks Spanish.|Руководитель тура говорит по-испански.|travel|pair=líder
condition|условие; состояние|The room is in good condition.|Номер в хорошем состоянии.|travel|pair=condición
department|отдел|She works in the IT department.|Она работает в IT-отделе.|it|pair=departamento
band|группа (музыкальная)|My friends have a band.|У моих друзей есть группа.|friends|pair=grupo
book|книга|I read a good book on the plane.|Я прочитал хорошую книгу в самолёте.|travel|pair=libro
egg|яйцо|I'd like two eggs for breakfast.|Мне на завтрак два яйца.|travel|pair=huevo
wood|дерево (материал); лес|The table is made of wood.|Стол сделан из дерева.|daily|pair=madera
vote|голос; голосование|Let's take a vote on the restaurant.|Давайте проголосуем за ресторан.|friends|pair=voto
gas|газ; бензин|The car is almost out of gas.|В машине почти закончился бензин.|travel|pl=gases pair=gas
monster|чудовище|The kids love monster movies.|Дети любят фильмы про монстров.|friends|pair=monstruo
bone|кость|The dog found a big bone.|Собака нашла большую кость.|daily|pair=hueso
throat|горло|I have a sore throat.|У меня болит горло.|daily|pair=garganta
feeling|чувство|I have a good feeling about this trip.|У меня хорошее предчувствие насчёт этой поездки.|friends|pair=sentimiento
driver|водитель|The taxi driver knew the way.|Водитель такси знал дорогу.|travel|pair=conductor
energy|энергия|I have no energy today.|У меня сегодня нет сил.|daily|nopl pair=energía
danger|опасность|The sign warns of danger.|Табличка предупреждает об опасности.|travel|pair=peligro
nose|нос|My nose is cold.|У меня замёрз нос.|daily|pair=nariz
color|цвет|What color is your suitcase?|Какого цвета твой чемодан?|travel|pair=color
leg|нога|My leg hurts after the hike.|У меня болит нога после похода.|travel|pair=pierna
hat|шляпа, шапка|Don't forget your hat, it's sunny.|Не забудь шляпу, там солнечно.|travel|pair=sombrero
camp|лагерь|We set up camp by the lake.|Мы разбили лагерь у озера.|travel|pair=campamento
operation|операция; работа|The operation of the system is simple.|Работа системы проста.|it|pair=operación
opportunity|возможность|It's a great opportunity to practise English.|Это отличная возможность попрактиковать английский.|daily|pl=opportunities pair=oportunidad
knife|нож|Can I have a knife and fork?|Можно нож и вилку?|friends|pl=knives pair=cuchillo
pressure|давление|I feel the pressure before a release.|Я чувствую давление перед релизом.|it|pair=presión
waste|отходы; трата|It's a waste of time.|Это пустая трата времени.|daily|nopl pair=residuo|a waste of time — «пустая трата времени»
detail|деталь|Let me know the details by email.|Сообщи мне подробности по почте.|it|pair=detalle
tape|лента; скотч|We need tape to close the box.|Нам нужен скотч, чтобы закрыть коробку.|daily|pair=cinta
taste|вкус|This soup has a strange taste.|У этого супа странный вкус.|friends|pair=sabor
bathroom|ванная|The bathroom has a big window.|В ванной большое окно.|travel|pair=baño
copy|копия|Please make a copy of your passport.|Сделайте копию паспорта.|travel|pl=copies pair=copia
neck|шея|I have a stiff neck after the flight.|У меня затекла шея после перелёта.|travel|pair=cuello
breakfast|завтрак|Breakfast is served from seven to ten.|Завтрак подают с семи до десяти.|travel|pair=desayuno
fan|вентилятор; болельщик|I'm a big fan of this band.|Я большой поклонник этой группы.|friends|pair=aficionado
code|код|Please check the code before the merge.|Пожалуйста, проверь код перед слиянием.|it|pair=código
restaurant|ресторан|We booked a table at a Spanish restaurant.|Мы забронировали столик в испанском ресторане.|friends|pair=restaurante
unit|единица; блок|Each unit has its own tests.|У каждого модуля свои тесты.|it|pair=unidad
language|язык|How many languages do you speak?|На скольких языках ты говоришь?|daily|pair=idioma
beauty|красота|The beauty of the place surprised us.|Красота этого места нас удивила.|travel|nopl pair=belleza
event|событие, мероприятие|We organized an event for friends.|Мы организовали мероприятие для друзей.|friends|pair=evento
bottom|дно, низ|The key is at the bottom of my bag.|Ключ на дне моей сумки.|daily|pair=fondo
cake|торт, пирог|Who wants some birthday cake?|Кто хочет праздничного торта?|friends|pair=pastel
nature|природа|We love spending time in nature.|Мы любим проводить время на природе.|travel|nopl pair=naturaleza
skin|кожа|Use sunscreen to protect your skin.|Пользуйся кремом от солнца, чтобы защитить кожу.|travel|pair=piel
trial|испытание; суд|There is a free trial for thirty days.|Есть бесплатный пробный период на тридцать дней.|it|pair=prueba
grace|грация, изящество|She moved with grace across the stage.|Она двигалась по сцене с грацией.|friends|nopl pair=gracia
challenge|вызов, испытание|Learning two languages is a challenge.|Учить два языка — это вызов.|daily|pair=desafío
gun|пистолет, ружьё|The film has too many guns.|В фильме слишком много оружия.|friends|pair=pistola
pig|свинья|There were pigs on the farm.|На ферме были свиньи.|travel|pair=cerdo
nurse|медсестра|The nurse was very kind.|Медсестра была очень добра.|daily|pair=enfermera
key|ключ|I lost the key to my room.|Я потерял ключ от номера.|travel|pair=llave
target|цель, мишень|We hit our target for this month.|Мы выполнили цель на этот месяц.|it|pair=objetivo
chair|стул|Can we get one more chair?|Можно ещё один стул?|friends|pair=silla
plenty|изобилие|There is plenty of time.|Времени предостаточно.|daily|nopl pair=abundancia|plenty of — «много, вдоволь»
travel|путешествия|Travel is the best way to learn a language.|Путешествия — лучший способ выучить язык.|travel|nopl pair=viaje|Неисчисляемое: travel; конкретная поездка — trip
speed|скорость|The train reaches a high speed.|Поезд развивает большую скорость.|travel|pair=velocidad
sight|вид; достопримечательность|We saw all the sights of the city.|Мы увидели все достопримечательности города.|travel|pair=vista
tie|галстук; ничья|He never wears a tie.|Он никогда не носит галстук.|it|pair=corbata
block|квартал; блок|The hotel is two blocks from here.|Отель находится в двух кварталах отсюда.|travel|pl=blocks pair=bloque
lesson|урок|Our first lesson was about the alphabet.|Наш первый урок был про алфавит.|daily|pair=lección
career|карьера|She changed her career at thirty.|Она сменила карьеру в тридцать лет.|it|pair=carrera
emergency|чрезвычайная ситуация|Call this number in an emergency.|В экстренной ситуации звоните по этому номеру.|travel|pl=emergencies pair=emergencia
coach|тренер; автобус дальнего следования|The coach to Madrid leaves at nine.|Автобус до Мадрида отправляется в девять.|travel|pl=coaches pair=entrenador
crew|экипаж; команда|The crew was very friendly.|Экипаж был очень дружелюбным.|travel|pl=crews pair=tripulación
player|игрок; проигрыватель|He is a great guitar player.|Он отличный гитарист.|friends|pair=jugador
shirt|рубашка|I need a clean shirt for tonight.|Мне нужна чистая рубашка на вечер.|travel|pair=camisa
market|рынок|We bought fruit at the market.|Мы купили фрукты на рынке.|travel|pair=mercado
artist|художник; артист|The artist painted the whole street.|Художник расписал всю улицу.|friends|pair=artista
star|звезда|We watched the stars from the roof.|Мы смотрели на звёзды с крыши.|friends|pair=estrella
investigation|расследование|The investigation took two weeks.|Расследование заняло две недели.|it|pair=investigación
grandma|бабушка|Grandma makes the best pie.|Бабушка печёт лучший пирог.|friends|pair=abuela
plant|растение; завод|We water the plants every day.|Мы поливаем растения каждый день.|daily|pair=planta
advice|совет|Can I ask for your advice?|Можно попросить у тебя совета?|friends|nopl pair=consejo|Неисчисляемое: some advice, a piece of advice
lie|ложь|Don't tell lies.|Не лги.|friends|pair=mentira
health|здоровье|Health is more important than money.|Здоровье важнее денег.|daily|nopl pair=salud
page|страница|Open the book at page ten.|Откройте книгу на десятой странице.|daily|pair=página
term|термин; срок|What does this term mean?|Что значит этот термин?|it|pair=término
example|пример|Can you give me an example?|Можешь привести пример?|daily|pair=ejemplo
strength|сила|He has the strength to carry both bags.|У него хватит сил нести обе сумки.|daily|pair=fuerza
opinion|мнение|In my opinion, the first hotel is better.|По-моему, первый отель лучше.|friends|pair=opinión
milk|молоко|Coffee with milk, please.|Кофе с молоком, пожалуйста.|travel|nopl pair=leche
affair|дело|It's a private affair.|Это личное дело.|daily
freedom|свобода|Travelling gives me a feeling of freedom.|Путешествия дают мне ощущение свободы.|travel|nopl pair=libertad
meat|мясо|I don't eat meat.|Я не ем мясо.|friends|nopl pair=carne
century|век|The church is from the 12th century.|Церковь построена в XII веке.|travel|pl=centuries pair=siglo
program|программа|The program crashes when I click Save.|Программа падает, когда я нажимаю «Сохранить».|it|pair=programa
credit|кредит|You can pay with a credit card.|Можно заплатить кредитной картой.|travel|pair=crédito
science|наука|Science was my favourite subject.|Наука была моим любимым предметом.|daily|pair=ciencia
responsibility|ответственность|It's your responsibility to check the dates.|Проверять даты — твоя обязанность.|it|pl=responsibilities pair=responsabilidad
size|размер|What size do you wear?|Какой у вас размер?|daily|pair=talla
pocket|карман|I keep my passport in my pocket.|Я держу паспорт в кармане.|travel|pair=bolsillo
lab|лаборатория|The lab is on the second floor.|Лаборатория на втором этаже.|it|pair=laboratorio
interview|интервью; собеседование|I have a job interview tomorrow.|Завтра у меня собеседование.|it|pair=entrevista
command|команда|Type the command and press Enter.|Введите команду и нажмите Enter.|it|pair=comando
purpose|цель, назначение|What is the purpose of your visit?|Какова цель вашего визита?|travel|pair=propósito
signal|сигнал|There's no signal in the mountains.|В горах нет сигнала.|travel|pair=señal
effect|эффект, влияние|The medicine has no side effects.|У лекарства нет побочных эффектов.|daily|pair=efecto
oil|масло; нефть|Fry the fish in olive oil.|Пожарь рыбу на оливковом масле.|friends|nopl pair=aceite
season|сезон, время года|Summer is the busy season here.|Лето здесь — высокий сезон.|travel|pair=temporada
audience|публика, зрители|The audience loved the show.|Зрителям шоу понравилось.|friends|pair=público
pound|фунт|The ticket costs ten pounds.|Билет стоит десять фунтов.|travel|pair=libra
property|собственность; свойство|Please look after your property.|Присматривайте за своими вещами.|travel|pl=properties pair=propiedad
tooth|зуб|I have a toothache, I need a dentist.|У меня болит зуб, мне нужен стоматолог.|daily|pl=teeth pair=diente
image|изображение|The image doesn't load.|Изображение не загружается.|it|pair=imagen
society|общество|Society is changing fast.|Общество быстро меняется.|daily|pl=societies pair=sociedad
record|запись; рекорд|Here is a record of our meeting.|Вот запись нашей встречи.|it|pair=registro
plate|тарелка|Can I have a clean plate?|Можно чистую тарелку?|friends|pair=plato
path|тропа, путь|The path leads to the lake.|Тропа ведёт к озеру.|travel|pair=sendero
owner|владелец|The owner of the café is very friendly.|Владелец кафе очень приветлив.|travel|pair=dueño
connection|соединение; пересадка|The connection in Frankfurt is tight.|Пересадка во Франкфурте очень короткая.|travel|pair=conexión
research|исследование|I did some research before the trip.|Я немного изучил вопрос перед поездкой.|it|nopl pair=investigación
customer|клиент, покупатель|The customer is waiting at the desk.|Клиент ждёт у стойки.|it|pair=cliente
universe|вселенная|The universe is big.|Вселенная огромна.|friends|pair=universo
theory|теория|It's only a theory so far.|Пока это только теория.|it|pl=theories pair=teoría
spring|весна; пружина|Spring is the best time to visit.|Весна — лучшее время для поездки.|travel|pair=primavera
contract|контракт|I signed the contract yesterday.|Я подписал контракт вчера.|it|pair=contrato
proof|доказательство|Do you have proof of payment?|У вас есть подтверждение оплаты?|travel|nopl pair=prueba
cream|сливки; крем|Coffee with cream, please.|Кофе со сливками, пожалуйста.|friends|nopl pair=crema
joy|радость|The kids shouted with joy.|Дети кричали от радости.|friends|nopl pair=alegría
birth|рождение|Please write your date of birth.|Напишите вашу дату рождения.|travel|nopl pair=nacimiento
speech|речь|He gave a short speech at the wedding.|На свадьбе он произнёс короткую речь.|friends|pl=speeches pair=discurso
wing|крыло|I always ask for a seat by the wing.|Я всегда прошу место у крыла.|travel|pair=ala
pool|бассейн|The hotel has a pool on the roof.|В отеле есть бассейн на крыше.|travel|pair=piscina
distance|расстояние|It's a short distance from here.|Это недалеко отсюда.|travel|pair=distancia
alarm|тревога; будильник|My alarm rings at six.|Мой будильник звонит в шесть.|travel|pair=alarma
heat|жара|The heat in July is terrible.|Жара в июле ужасная.|travel|nopl pair=calor
wave|волна|The waves were big today.|Сегодня были большие волны.|travel|pair=ola
base|основа, база|The app has a solid base.|У приложения прочная основа.|it|pair=base
medicine|лекарство; медицина|I need some medicine for my head.|Мне нужно лекарство от головной боли.|travel|pair=medicina
weight|вес|The weight limit is twenty kilos.|Ограничение по весу — двадцать килограммов.|travel|pair=peso
pill|таблетка|Take one pill after dinner.|Принимайте по одной таблетке после ужина.|daily|pair=pastilla
direction|направление|Which direction is the station?|В какой стороне вокзал?|travel|pair=dirección
sale|распродажа; продажа|There's a big sale this weekend.|В эти выходные большая распродажа.|travel|pair=venta
community|сообщество|The app has a friendly community.|У приложения дружелюбное сообщество.|it|pl=communities pair=comunidad
desk|стол; стойка|The key is at the front desk.|Ключ на ресепшене.|travel|pair=escritorio
style|стиль|I like her style.|Мне нравится её стиль.|friends|pair=estilo
damage|ущерб|The storm caused a lot of damage.|Шторм нанёс большой ущерб.|travel|nopl pair=daño
sport|спорт|What sports do you play?|Каким спортом ты занимаешься?|friends|pair=deporte
loss|потеря|We reported the loss of the bag.|Мы заявили о потере сумки.|travel|pl=losses pair=pérdida
meal|приём пищи, еда|The price includes all meals.|В цену включено питание.|travel|pair=comida
forest|лес|We walked through the forest.|Мы шли через лес.|travel|pair=bosque
coat|пальто, куртка|Take your coat, it's cold.|Возьми куртку, холодно.|travel|pair=abrigo
statement|заявление; выписка|The bank sent me a statement.|Банк прислал мне выписку.|it|pair=declaración
wheel|колесо|The car has a flat wheel.|У машины спустило колесо.|travel|pair=rueda
worker|работник|The workers fixed the road.|Рабочие починили дорогу.|daily|pair=trabajador
lip|губа|She bit her lip.|Она закусила губу.|daily|pair=labio
storm|шторм|A storm is coming tonight.|Сегодня ночью ожидается шторм.|travel|pair=tormenta
threat|угроза|The warning is a real threat.|Предупреждение — реальная угроза.|it|pair=amenaza
thousand|тысяча|The festival attracts thousands of visitors.|Фестиваль привлекает тысячи гостей.|travel|pair=mil
process|процесс|The process takes about ten minutes.|Процесс занимает около десяти минут.|it|pl=processes pair=proceso
happiness|счастье|Happiness is spending time with friends.|Счастье — это время с друзьями.|friends|nopl pair=felicidad
mayor|мэр|The mayor opened the festival.|Мэр открыл фестиваль.|travel|pair=alcalde
paint|краска|The paint is still wet.|Краска ещё не высохла.|daily|nopl pair=pintura
site|сайт; место|The site is down again.|Сайт опять не работает.|it|pair=sitio
knee|колено|I hurt my knee on the hike.|Я повредил колено в походе.|travel|pair=rodilla
official|чиновник; должностное лицо|An official checked our documents.|Должностное лицо проверило наши документы.|travel|pair=funcionario
staff|персонал|The hotel staff were very helpful.|Персонал отеля был очень отзывчив.|travel|nopl pair=personal
bike|велосипед|We rented bikes for the day.|Мы взяли велосипеды напрокат на день.|travel|pair=bici
nation|нация, страна|The whole nation watched the game.|Вся страна смотрела матч.|daily|pair=nación
holiday|праздник; отпуск|Where are you going on holiday?|Куда ты едешь в отпуск?|travel|pl=holidays pair=vacaciones
authority|власть; орган|Contact the local authorities.|Обратитесь в местные органы власти.|travel|pl=authorities pair=autoridad
roof|крыша|We had drinks on the roof.|Мы пили на крыше.|friends|pl=roofs pair=techo
source|источник|What's the source of this data?|Каков источник этих данных?|it|pair=fuente
garden|сад|Their house has a lovely garden.|У их дома чудесный сад.|friends|pair=jardín
snow|снег|There was a lot of snow in the mountains.|В горах было много снега.|travel|nopl pair=nieve
sugar|сахар|Do you want sugar in your tea?|Тебе сахар в чай?|friends|nopl pair=azúcar
degree|степень; градус|It's thirty degrees outside.|На улице тридцать градусов.|travel|pair=grado
access|доступ|Do you have access to the server?|У тебя есть доступ к серверу?|it|nopl pair=acceso
farm|ферма|We stayed on a farm for a week.|Мы неделю прожили на ферме.|travel|pair=granja
shoulder|плечо|My shoulder hurts from the backpack.|У меня болит плечо от рюкзака.|travel|pair=hombro
tire|шина|The car has a flat tire.|У машины прокол шины.|travel|pair=neumático
value|значение; ценность|The value of this field must be a number.|Значение этого поля должно быть числом.|it|pair=valor
trade|торговля; ремесло|Trade is important for this port.|Торговля важна для этого порта.|travel|nopl pair=comercio
success|успех|The party was a big success.|Вечеринка имела большой успех.|friends|pl=successes pair=éxito
actor|актёр|My friend is an actor.|Мой друг — актёр.|friends|pair=actor
toilet|туалет|Where is the toilet, please?|Где туалет, пожалуйста?|travel|pair=baño
journey|путешествие, дорога|The journey takes about six hours.|Дорога занимает около шести часов.|travel|pair=viaje
stomach|желудок, живот|I have a pain in my stomach.|У меня болит живот.|travel|pair=estómago
reality|реальность|Reality is different from the photos.|Реальность отличается от фотографий.|travel|nopl pair=realidad
silence|тишина|There was silence in the room.|В комнате была тишина.|daily|pair=silencio
chest|грудь; сундук|The chest of drawers is empty.|Комод пуст.|daily|pl=chests
winter|зима|Winters are cold in Moscow.|Зимы в Москве холодные.|travel|pair=invierno
assistant|помощник|The assistant booked the meeting room.|Ассистент забронировал переговорную.|it|pair=asistente
shape|форма|The cake was in the shape of a heart.|Торт был в форме сердца.|friends|pair=forma
tongue|язык (орган)|Don't bite your tongue.|Не прикуси язык.|daily|pair=lengua
map|карта (местности)|I downloaded an offline map.|Я скачал офлайн-карту.|travel|pair=mapa
tour|экскурсия, тур|Is there a tour of the old town?|Есть ли экскурсия по старому городу?|travel|pair=excursión
print|печать; отпечаток|Please print your ticket.|Пожалуйста, распечатайте билет.|travel
clock|часы (настенные)|The clock on the wall is wrong.|Часы на стене идут неправильно.|daily|pair=reloj
safety|безопасность|Safety comes first.|Безопасность прежде всего.|travel|nopl pair=seguridad
mood|настроение|He is in a good mood today.|Сегодня он в хорошем настроении.|friends|pair=humor
amount|количество; сумма|What's the total amount?|Какова общая сумма?|travel|pair=cantidad
cow|корова|We saw cows near the farm.|Рядом с фермой мы видели коров.|travel|pair=vaca
bedroom|спальня|The apartment has two bedrooms.|В квартире две спальни.|travel|pair=dormitorio
location|местоположение|Send me your location.|Пришли мне свою геопозицию.|friends|pair=ubicación
drink|напиток|What would you like to drink?|Что бы вы хотели выпить?|friends|pair=bebida
load|груз; нагрузка|The server is under heavy load.|Сервер под большой нагрузкой.|it
newspaper|газета|He reads the newspaper every morning.|Он читает газету каждое утро.|daily|pair=periódico
rent|аренда, квартплата|The rent is too high.|Арендная плата слишком высока.|travel|pair=alquiler
football|футбол|We watched football at a bar.|Мы смотрели футбол в баре.|friends|nopl pair=fútbol
miracle|чудо|It's a miracle that we made it.|Чудо, что мы успели.|friends|pair=milagro
change|изменение; сдача|Keep the change!|Сдачи не надо!|travel|pair=cambio
thought|мысль|I had a thought about the trip.|У меня появилась мысль насчёт поездки.|friends|pair=pensamiento
fortune|удача; состояние|He made a fortune in IT.|Он сколотил состояние в IT.|it|pair=fortuna
shadow|тень|We rested in the shadow of a tree.|Мы отдыхали в тени дерева.|travel|pl=shadows pair=sombra
university|университет|She studied at a Spanish university.|Она училась в испанском университете.|daily|pl=universities pair=universidad
bath|ванна|I'd like to take a hot bath.|Хочу принять горячую ванну.|travel|pl=baths pair=baño
effort|усилие|Thanks for all your effort.|Спасибо за все твои усилия.|it|pair=esfuerzo
ear|ухо|My ears hurt on the plane.|У меня болят уши в самолёте.|travel|pair=oreja
winner|победитель|The winner gets a free ticket.|Победитель получает бесплатный билет.|friends|pair=ganador
permission|разрешение|Do I need permission to take photos?|Нужно ли разрешение на фото?|travel|nopl pair=permiso
option|вариант|There are two options for dinner.|Есть два варианта ужина.|friends|pair=opción
bread|хлеб|Fresh bread is baked here every morning.|Свежий хлеб здесь пекут каждое утро.|travel|nopl pair=pan
yard|двор|The kids play in the yard.|Дети играют во дворе.|friends|pair=patio
role|роль|She plays the main role.|Она играет главную роль.|friends|pair=papel
competition|соревнование; конкуренция|Our team won the competition.|Наша команда выиграла соревнование.|friends|pair=competición
mystery|тайна|The film is a real mystery.|Фильм — настоящая загадка.|friends|pl=mysteries pair=misterio
supply|поставка, запас|We have a supply of water for two days.|У нас запас воды на два дня.|travel|pl=supplies pair=suministro
skill|навык|Speaking is a useful skill.|Разговорная речь — полезный навык.|daily|pair=habilidad
talent|талент|She has a talent for music.|У неё талант к музыке.|friends|pair=talento
rush|спешка, час пик|Let's avoid the morning rush.|Давай избежим утренней давки.|travel|pl=rushes
material|материал|The bag is made of strong material.|Сумка сделана из прочного материала.|daily|pair=material
telephone|телефон (аппарат)|The telephone rang in the hall.|В холле зазвонил телефон.|daily|pair=teléfono
expert|эксперт|He is an expert in cloud tools.|Он эксперт по облачным инструментам.|it|pair=experto
text|текст; сообщение|Send me a text when you arrive.|Напиши мне, когда приедешь.|friends|pair=texto
uniform|форма (одежда)|The staff wear a blue uniform.|Персонал носит синюю форму.|travel|pair=uniforme
mirror|зеркало|The room has a big mirror.|В номере большое зеркало.|travel|pair=espejo
right|право; правая сторона|Turn to the right at the lights.|На светофоре поверните направо.|travel|pair=derecha
quarter|четверть; квартал|It's a quarter past nine.|Сейчас четверть десятого.|travel|pair=cuarto
jacket|куртка|Take a jacket, it's windy.|Возьми куртку, там ветрено.|travel|pair=chaqueta
silver|серебро|The ring is made of silver.|Кольцо сделано из серебра.|friends|nopl pair=plata
switch|выключатель; переключатель|Where is the light switch?|Где выключатель света?|travel|pl=switches pair=interruptor
crash|авария; сбой|The crash of the app lost my data.|Сбой приложения стёр мои данные.|it|pl=crashes pair=accidente
appointment|встреча (назначенная); запись|I have an appointment at four.|У меня встреча в четыре.|daily|pair=cita
result|результат|The result surprised everyone.|Результат удивил всех.|it|pair=resultado
magazine|журнал|I bought a magazine for the flight.|Я купил журнал для полёта.|travel|pair=revista
factory|фабрика|He works in a car factory.|Он работает на автомобильном заводе.|daily|pl=factories pair=fábrica
insurance|страховка|Do you have travel insurance?|У вас есть туристическая страховка?|travel|nopl pair=seguro
secret|секрет|Can you keep a secret?|Умеешь хранить секреты?|friends|pair=secreto
citizen|гражданин|She is a citizen of Spain.|Она гражданка Испании.|travel|pair=ciudadano
photo|фото|Send me the photos from Saturday.|Пришли мне фото с субботы.|friends|pl=photos pair=foto
shock|шок|The price was a shock.|Цена была шоком.|travel|pair=choque
grade|оценка; класс|She got a good grade on the exam.|Она получила хорошую оценку на экзамене.|daily|pair=nota
chain|цепь|He wears a gold chain.|Он носит золотую цепочку.|friends|pair=cadena
advantage|преимущество|One advantage is the low price.|Одно преимущество — низкая цена.|it|pair=ventaja
studio|студия|They rent a small studio in town.|Они снимают маленькую студию в городе.|friends|pl=studios pair=estudio
debt|долг|He paid off his debt.|Он погасил свой долг.|daily|pair=deuda
knowledge|знание|Knowledge of two languages is useful.|Знание двух языков полезно.|daily|nopl pair=conocimiento
goal|цель; гол|Our goal is to finish by June.|Наша цель — закончить к июню.|it|pair=objetivo
victory|победа|The victory made everyone happy.|Победа всех обрадовала.|friends|pl=victories pair=victoria
treatment|лечение; обращение|The treatment lasted two weeks.|Лечение длилось две недели.|daily|pair=tratamiento
edge|край|Don't stand at the edge.|Не стой на краю.|travel|pair=borde
answer|ответ|I'm waiting for your answer.|Жду твоего ответа.|daily|pair=respuesta
performance|выступление; производительность|The performance of the app is much better now.|Производительность приложения теперь намного лучше.|it|pair=rendimiento
apple|яблоко|I eat an apple every morning.|Я ем яблоко каждое утро.|daily|pair=manzana
toy|игрушка|The kids packed their toys.|Дети собрали свои игрушки.|travel|pair=juguete
cloud|облако|There is not a cloud in the sky.|На небе ни облачка.|travel|pair=nube
television|телевидение|There is no television in the cabin.|В домике нет телевизора.|daily|pair=televisión
movement|движение|The movement of the train made me sleepy.|Покачивание поезда клонило меня в сон.|travel|pair=movimiento
neighborhood|район, окрестности|We love this neighborhood.|Нам нравится этот район.|travel|pair=barrio
vacation|отпуск|We're on vacation next week.|На следующей неделе мы в отпуске.|travel|pair=vacaciones
firm|фирма|She works for a law firm.|Она работает в юридической фирме.|it|pair=empresa
palace|дворец|We visited the royal palace.|Мы посетили королевский дворец.|travel|pair=palacio
writer|писатель|My favourite writer is Cervantes.|Мой любимый писатель — Сервантес.|friends|pair=escritor
vision|зрение; видение|My vision is much better with glasses.|В очках я вижу гораздо лучше.|daily|pair=visión
taxi|такси|We took a taxi to the hotel.|Мы взяли такси до отеля.|travel|pair=taxi
metal|металл|The detector found something metal.|Детектор нашёл что-то металлическое.|travel|pair=metal
fruit|фрукт, фрукты|Fresh fruit is cheap here.|Свежие фрукты здесь дёшевы.|travel|nopl pair=fruta
license|лицензия, права|Do you have a driver's license?|У тебя есть водительские права?|travel|pair=licencia
traffic|движение, пробки|There was heavy traffic on the way.|По дороге были большие пробки.|travel|nopl pair=tráfico
mail|почта|I'll check my mail later.|Я проверю почту позже.|it|nopl pair=correo
courage|смелость|It takes courage to speak a new language.|Чтобы говорить на новом языке, нужна смелость.|daily|nopl pair=valor
dawn|рассвет|We left at dawn.|Мы выехали на рассвете.|travel|pair=amanecer
grandmother|бабушка|My grandmother lives in a small village.|Моя бабушка живёт в маленькой деревне.|friends|pair=abuela
doll|кукла|She packed her favourite doll.|Она взяла с собой любимую куклу.|travel|pair=muñeca
hunter|охотник|The hunter lived in the mountains.|Охотник жил в горах.|daily|pair=cazador
piano|пианино|She plays the piano very well.|Она очень хорошо играет на пианино.|friends|pl=pianos pair=piano
device|устройство|Connect your device to the wifi.|Подключите устройство к вайфаю.|it|pair=dispositivo
pie|пирог|Grandma baked an apple pie.|Бабушка испекла яблочный пирог.|friends|pair=pastel
rope|верёвка|We tied the boat with a rope.|Мы привязали лодку верёвкой.|travel|pair=cuerda
duck|утка|There were ducks on the lake.|На озере были утки.|travel|pair=pato
violence|насилие|The film has a lot of violence.|В фильме много насилия.|friends|nopl pair=violencia
friendship|дружба|Our friendship goes back ten years.|Наша дружба длится уже десять лет.|friends|pair=amistad
design|дизайн|I like the design of this app.|Мне нравится дизайн этого приложения.|it|pair=diseño
sentence|предложение; приговор|Translate this sentence into Spanish.|Переведи это предложение на испанский.|daily|pair=frase
pot|кастрюля, горшок|Put the pot on the stove.|Поставь кастрюлю на плиту.|friends|pair=olla
move|ход; движение|It was a smart move.|Это был умный ход.|friends|pair=movimiento
ability|способность|She has the ability to learn fast.|У неё способность быстро учиться.|daily|pl=abilities pair=habilidad
nail|ноготь; гвоздь|I hit the nail with a hammer.|Я ударил по гвоздю молотком.|daily|pair=clavo
rescue|спасение|The rescue took two hours.|Спасение заняло два часа.|travel|pair=rescate
section|раздел|See the next section for details.|Подробности — в следующем разделе.|it|pair=sección
sandwich|сэндвич|I'll have a ham sandwich.|Мне сэндвич с ветчиной.|travel|pl=sandwiches pair=bocadillo
protection|защита|Use sun protection on the beach.|Используйте защиту от солнца на пляже.|travel|nopl pair=protección
technology|технология|New technology changes how we learn.|Новые технологии меняют то, как мы учимся.|it|pl=technologies pair=tecnología
incident|инцидент|There was an incident at the airport.|В аэропорту произошёл инцидент.|travel|pair=incidente
lion|лев|We saw a lion at the zoo.|В зоопарке мы видели льва.|travel|pair=león
theme|тема|The theme of the party is the 80s.|Тема вечеринки — восьмидесятые.|friends|pair=tema
generation|поколение|Three generations live in this house.|В этом доме живут три поколения.|friends|pair=generación
surface|поверхность|The surface of the lake was calm.|Гладь озера была спокойной.|travel|pair=superficie
route|маршрут|What's the best route to the airport?|Какой лучший маршрут до аэропорта?|travel|pair=ruta
document|документ|Please bring your documents.|Пожалуйста, возьмите с собой документы.|travel|pair=documento
border|граница|We crossed the border at night.|Мы пересекли границу ночью.|travel|pair=frontera
approach|подход|I like your approach to the problem.|Мне нравится твой подход к проблеме.|it|pl=approaches pair=enfoque
apology|извинение|Please accept our apologies.|Примите наши извинения.|travel|pl=apologies pair=disculpa
hundred|сто|There were about a hundred people.|Там было около ста человек.|travel|pair=cien
cab|такси (амер.)|Let's take a cab to the airport.|Поедем в аэропорт на такси.|travel
possibility|возможность|There is a possibility of rain.|Возможен дождь.|travel|pl=possibilities pair=posibilidad
experiment|эксперимент|We ran a small experiment.|Мы провели небольшой эксперимент.|it|pair=experimento
sample|образец|Take a free sample.|Возьмите бесплатный образец.|travel|pair=muestra
product|продукт|The product ships next week.|Продукт выходит на следующей неделе.|it|pair=producto
exchange|обмен|Where can I find a currency exchange?|Где найти обмен валют?|travel|pl=exchanges pair=cambio
toast|тост; гренок|Let's make a toast to the bride and groom.|Давайте произнесём тост за молодожёнов.|friends|pl=toasts pair=brindis
zone|зона|The old town is a pedestrian zone.|Старый город — пешеходная зона.|travel|pair=zona
warrior|воин|The statue shows an ancient warrior.|Статуя изображает древнего воина.|travel|pair=guerrero
article|статья; артикль|I read an interesting article about Spain.|Я прочитал интересную статью об Испании.|daily|pair=artículo
dust|пыль|There's dust on the shelf.|На полке пыль.|daily|nopl pair=polvo
photograph|фотография|This photograph was taken in 1990.|Эта фотография сделана в 1990 году.|travel|pair=fotografía
agency|агентство|We booked through a travel agency.|Мы бронировали через турагентство.|travel|pl=agencies pair=agencia
presence|присутствие|Your presence is required.|Требуется ваше присутствие.|it|pair=presencia
tiger|тигр|Tigers live in India.|Тигры живут в Индии.|travel|pair=tigre
episode|эпизод, серия|Did you watch the last episode?|Ты смотрел последнюю серию?|friends|pair=episodio
internet|интернет|Is there internet in the room?|Есть ли в номере интернет?|travel|nopl pair=internet
elevator|лифт|The elevator is out of order.|Лифт не работает.|travel|pair=ascensor
activity|занятие, активность|There are many activities for kids.|Есть много занятий для детей.|travel|pl=activities pair=actividad
kingdom|королевство|The Kingdom of Spain is in Europe.|Королевство Испания находится в Европе.|travel|pair=reino
pen|ручка|Do you have a pen I can borrow?|У тебя найдётся ручка?|travel|pair=bolígrafo
campaign|кампания|The campaign starts next month.|Кампания стартует в следующем месяце.|it|pair=campaña
quality|качество|The quality of the food was excellent.|Качество еды было отличным.|travel|pl=qualities pair=calidad
culture|культура|I love learning about other cultures.|Люблю узнавать о других культурах.|travel|pair=cultura
youth|юность; молодёжь|He spent his youth in Seville.|Свою юность он провёл в Севилье.|friends|pair=juventud
sand|песок|The sand was hot.|Песок был горячим.|travel|nopl pair=arena
channel|канал|Change the channel, please.|Переключи канал, пожалуйста.|daily|pl=channels pair=canal
tool|инструмент|This tool saves me a lot of time.|Этот инструмент экономит мне много времени.|it|pair=herramienta
rice|рис|Paella is made with rice.|Паэлью готовят из риса.|travel|nopl pair=arroz
prize|приз|The first prize is a weekend in Rome.|Первый приз — выходные в Риме.|friends|pair=premio
step|шаг|The first step is the hardest.|Первый шаг самый трудный.|daily|pair=paso
passion|страсть|Music is my passion.|Музыка — моя страсть.|friends|pair=pasión
ambulance|скорая помощь|Call an ambulance!|Вызовите скорую!|travel|pair=ambulancia
house|дом|They bought a house near the sea.|Они купили дом у моря.|daily|pair=casa
employee|сотрудник|Each employee gets a laptop.|Каждый сотрудник получает ноутбук.|it|pair=empleado
tunnel|туннель|The train goes through a long tunnel.|Поезд проезжает через длинный туннель.|travel|pl=tunnels pair=túnel
attitude|отношение|I like his positive attitude.|Мне нравится его позитивный настрой.|friends|pair=actitud
stair|ступенька (stairs — лестница)|The hotel has no lift, only stairs.|В отеле нет лифта, только лестница.|travel|pair=escalera
mark|отметка, оценка|Put a mark next to your name.|Поставьте отметку рядом с вашим именем.|daily|pair=marca
failure|неудача; сбой|The failure was caused by a bad update.|Сбой был вызван плохим обновлением.|it|pair=fracaso
garage|гараж|We keep the bikes in the garage.|Велосипеды мы держим в гараже.|daily|pair=garaje
darkness|темнота|We walked home in the darkness.|Мы шли домой в темноте.|daily|nopl pair=oscuridad
benefit|выгода, польза|The main benefit is the low price.|Главная выгода — низкая цена.|it|pair=beneficio
policy|политика; правила|Check the hotel's cancellation policy.|Проверьте правила отмены брони в отеле.|travel|pl=policies pair=política
emotion|эмоция|Music is full of emotion.|Музыка полна эмоций.|friends|pair=emoción
talk|разговор; доклад|We had a nice talk over coffee.|Мы приятно поговорили за кофе.|friends|pair=charla
range|диапазон|The hotel is in a good price range.|Отель в хорошем ценовом диапазоне.|travel|pair=rango
loan|заём|He took a small loan to buy a car.|Он взял небольшой кредит на машину.|daily|pair=préstamo
robot|робот|The robot serves coffee in the cafe.|Робот подаёт кофе в кафе.|it|pair=robot
potato|картофель|I'd like fried potatoes with the fish.|Мне к рыбе жареный картофель.|friends|pair=patata
equipment|оборудование|The gym has modern equipment.|В зале современное оборудование.|travel|nopl pair=equipo
reward|награда|There is a reward for finding the keys.|За найденные ключи есть вознаграждение.|friends|pair=recompensa
parking|парковка|Is there parking at the hotel?|Есть ли парковка у отеля?|travel|nopl pair=aparcamiento
empire|империя|The Roman Empire built this bridge.|Римская империя построила этот мост.|travel|pair=imperio
swing|качели|The kids play on the swings.|Дети играют на качелях.|friends|pair=columpio
anger|гнев|He tried to hide his anger.|Он пытался скрыть гнев.|friends|nopl pair=ira
conference|конференция|I'm going to a conference in Berlin.|Я еду на конференцию в Берлин.|it|pair=conferencia
pattern|узор; шаблон|The carpet has a nice pattern.|У ковра красивый узор.|daily|pair=patrón
visitor|посетитель|The museum has thousands of visitors.|У музея тысячи посетителей.|travel|pair=visitante
kind|вид, род; добрый|What kind of music do you like?|Какую музыку ты любишь?|friends|pair=tipo
fishing|рыбалка|We went fishing on the lake.|Мы ходили на рыбалку на озеро.|travel|nopl pair=pesca
identity|личность|Please show a proof of identity.|Предъявите документ, удостоверяющий личность.|travel|pl=identities pair=identidad
salt|соль|Could you pass the salt?|Передай соль, пожалуйста.|friends|nopl pair=sal
fashion|мода|She works in fashion.|Она работает в индустрии моды.|friends|nopl pair=moda
flag|флаг|The flag is red and yellow.|Флаг красно-жёлтый.|travel|pair=bandera
delivery|доставка|Delivery takes two days.|Доставка занимает два дня.|daily|pl=deliveries pair=entrega
theater|театр|We went to the theater last night.|Вчера вечером мы ходили в театр.|friends|pair=teatro
thunder|гром|We heard thunder in the night.|Ночью мы слышали гром.|travel|nopl pair=trueno
library|библиотека|The library closes at eight.|Библиотека закрывается в восемь.|daily|pl=libraries pair=biblioteca
costume|костюм (карнавальный)|I need a costume for the party.|Мне нужен костюм для вечеринки.|friends|pair=disfraz
injury|травма|He has a knee injury.|У него травма колена.|daily|pl=injuries pair=lesión
rabbit|кролик|They have a pet rabbit.|У них живёт кролик.|daily|pair=conejo
politics|политика|We don't talk about politics at dinner.|За ужином мы не говорим о политике.|friends|nopl pair=política
legend|легенда|There is a legend about this castle.|Об этом замке ходит легенда.|travel|pair=leyenda
disaster|катастрофа|The trip was a total disaster.|Поездка была настоящей катастрофой.|travel|pair=desastre
explanation|объяснение|Thank you for the explanation.|Спасибо за объяснение.|daily|pair=explicación
agreement|соглашение|We reached an agreement.|Мы пришли к соглашению.|it|pair=acuerdo
glory|слава|The city was in its glory in the 15th century.|В XV веке город был в зените славы.|travel|nopl pair=gloria
exam|экзамен|I have an exam on Monday.|В понедельник у меня экзамен.|daily|pair=examen
background|фон; происхождение|The background of the photo is blurry.|Фон на фото размыт.|it|pair=fondo
reputation|репутация|The restaurant has a good reputation.|У ресторана хорошая репутация.|travel|pair=reputación
alcohol|алкоголь|They don't sell alcohol here.|Здесь не продают алкоголь.|friends|nopl pair=alcohol
trash|мусор|Take out the trash, please.|Вынеси мусор, пожалуйста.|daily|nopl
argument|спор; довод|We had an argument about the plan.|У нас был спор о плане.|friends|pair=argumento
singer|певец|She is my favourite singer.|Она моя любимая певица.|friends|pair=cantante
title|название; титул|What's the title of this song?|Как называется эта песня?|friends|pair=título
struggle|борьба|Learning English was a struggle at first.|Сначала учить английский было трудно.|daily|pair=lucha
intention|намерение|I had no intention to disturb you.|У меня не было намерения вас беспокоить.|daily|pair=intención
ton|тонна|The truck carries ten tons.|Грузовик везёт десять тонн.|daily|pair=tonelada
ash|пепел|The volcano covered the town in ash.|Вулкан покрыл город пеплом.|travel|nopl pair=ceniza
package|посылка; пакет|A package arrived for you.|Для тебя пришла посылка.|it|pair=paquete
wish|желание|Make a wish!|Загадай желание!|friends|pl=wishes pair=deseo
industry|промышленность; отрасль|He works in the tourism industry.|Он работает в туристической отрасли.|travel|pl=industries pair=industria
chat|чат; беседа|I'll write it in the group chat.|Я напишу об этом в групповой чат.|friends|pair=charla
education|образование|Education is free in many countries.|Во многих странах образование бесплатное.|daily|nopl pair=educación
coincidence|совпадение|What a coincidence to see you here!|Какое совпадение — увидеть тебя здесь!|friends|pair=coincidencia
percent|процент|There's a ten percent discount.|Скидка десять процентов.|travel|pair=por_ciento
confidence|уверенность|I speak English with more confidence now.|Теперь я говорю по-английски увереннее.|daily|nopl pair=confianza
individual|человек; индивидуальный|Each individual gets a ticket.|Каждый человек получает билет.|travel|pair=individuo
habit|привычка|Reading before sleep is a good habit.|Чтение перед сном — хорошая привычка.|daily|pair=hábito
sheet|простыня; лист|The sheet of paper was empty.|Лист бумаги был пуст.|daily|pair=hoja
production|производство|Production starts next month.|Производство начнётся в следующем месяце.|it|nopl pair=producción
pipe|труба|The pipe in the bathroom is leaking.|Труба в ванной течёт.|travel|pair=tubería
comment|комментарий|Leave a comment under the photo.|Оставь комментарий под фото.|friends|pair=comentario
revolution|революция|The museum is about the French Revolution.|Музей посвящён Французской революции.|travel|pair=revolución
item|предмет, пункт|Please check each item on the list.|Проверьте каждый пункт списка.|travel|pair=artículo
lack|нехватка|There is a lack of space in the room.|В комнате не хватает места.|daily|nopl pair=falta
muscle|мышца|My muscles hurt after the hike.|У меня болят мышцы после похода.|travel|pair=músculo
panic|паника|Don't panic, we have time.|Без паники, время есть.|travel|nopl pair=pánico
flesh|плоть|The fruit has soft flesh.|У фрукта мягкая мякоть.|daily|nopl pair=carne
impression|впечатление|The city made a good impression on me.|Город произвёл на меня хорошее впечатление.|travel|pair=impresión
champion|чемпион|They are the champions of the league.|Они чемпионы лиги.|friends|pair=campeón
reaction|реакция|His reaction made us laugh.|Его реакция нас рассмешила.|friends|pair=reacción
election|выборы|The election is on Sunday.|Выборы в воскресенье.|daily|pair=elección
exercise|упражнение|Do these exercises every day.|Делайте эти упражнения каждый день.|daily|pair=ejercicio
tribe|племя|They met a tribe in the forest.|В лесу они встретили племя.|travel|pair=tribu
committee|комитет|The committee chose the winner.|Комитет выбрал победителя.|it|pair=comité
transfer|перевод; пересадка|The hotel offers an airport transfer.|Отель предлагает трансфер из аэропорта.|travel|pl=transfers pair=traslado
network|сеть|The network is down again.|Сеть опять упала.|it|pair=red
tale|рассказ, сказка|The old man told us a tale.|Старик рассказал нам историю.|friends|pair=cuento
garbage|мусор|The garbage is collected on Monday.|Мусор вывозят в понедельник.|daily|nopl
mind|разум; ум|I changed my mind.|Я передумал.|daily|pair=mente|change my mind — «передумать»
childhood|детство|I spent my childhood by the sea.|Своё детство я провёл у моря.|friends|pair=infancia
pet|домашнее животное|Are pets allowed in the apartment?|Можно ли в квартиру с домашними животными?|travel|pair=mascota
glove|перчатка|I lost one glove on the train.|Я потерял одну перчатку в поезде.|travel|pair=guante
farmer|фермер|The farmer sells cheese at the market.|Фермер продаёт сыр на рынке.|travel|pair=granjero
attempt|попытка|It was a good attempt.|Это была хорошая попытка.|daily|pair=intento
capital|столица|Madrid is the capital of Spain.|Мадрид — столица Испании.|travel|pair=capital
temperature|температура|What's the temperature outside?|Сколько градусов на улице?|travel|pair=temperatura
trail|тропа|We followed the trail to the lake.|Мы шли по тропе к озеру.|travel|pair=sendero
aid|помощь|The first aid kit is in the car.|Аптечка первой помощи в машине.|travel|nopl pair=ayuda
behavior|поведение|His behavior surprised us.|Его поведение нас удивило.|friends|nopl pair=comportamiento
cap|кепка; колпачок|He wears a baseball cap.|Он носит бейсболку.|friends|pair=gorra
inch|дюйм|The screen is thirteen inches.|Экран тринадцать дюймов.|it|pl=inches pair=pulgada
policeman|полицейский|Ask the policeman for directions.|Спроси дорогу у полицейского.|travel|pl=policemen pair=policía
fund|фонд|They raise funds for the festival.|Они собирают средства на фестиваль.|friends|pair=fondo
rumor|слух|It's only a rumor.|Это только слух.|friends|pair=rumor
potential|потенциал|The app has great potential.|У приложения большой потенциал.|it|nopl pair=potencial
coin|монета|I found an old coin on the beach.|Я нашёл на пляже старую монету.|travel|pair=moneda
adventure|приключение|The trip was a great adventure.|Поездка была большим приключением.|travel|pair=aventura
guitar|гитара|He plays the guitar at our parties.|Он играет на гитаре на наших вечеринках.|friends|pair=guitarra
ceremony|церемония|The ceremony starts at noon.|Церемония начинается в полдень.|friends|pl=ceremonies pair=ceremonia
collection|коллекция|The museum has a big collection.|В музее большая коллекция.|travel|pair=colección
league|лига|Our team plays in the local league.|Наша команда играет в местной лиге.|friends|pair=liga
drama|драма|The film is a drama about two friends.|Фильм — драма о двух друзьях.|friends|pair=drama
lane|переулок; полоса|Our hotel is in a narrow lane.|Наш отель находится в узком переулке.|travel|pair=carril
dirt|грязь|There was dirt on my shoes.|На моих ботинках была грязь.|travel|nopl pair=suciedad
punishment|наказание|The punishment was fair.|Наказание было справедливым.|daily|pair=castigo
basement|подвал|The gym is in the basement.|Спортзал в подвале.|travel|pair=sótano
charity|благотворительность|The concert was for charity.|Концерт был в пользу благотворительности.|friends|nopl pair=caridad
couch|диван|You can sleep on the couch.|Ты можешь спать на диване.|friends|pl=couches pair=sofá
subtitle|субтитр|Turn on the subtitles, please.|Включи субтитры, пожалуйста.|friends|pair=subtítulo
wallet|кошелёк|Someone stole my wallet.|У меня украли кошелёк.|travel|pair=cartera
tradition|традиция|It's a Christmas tradition.|Это рождественская традиция.|friends|pair=tradición
classic|классика|This film is a classic.|Этот фильм — классика.|friends|pair=clásico
''', 'en', 'noun')
