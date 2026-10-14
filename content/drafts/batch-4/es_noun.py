# ИИ-черновик (D-25): испанские существительные партии 4 (LNG-S1-032). Род — из каркаса,
# мн. число — сборка; np — без мн. числа, pl= — особая форма.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
comida|еда; обед|La comida de este restaurante es excelente.|Еда в этом ресторане отличная.|travel|
capitán|капитан|El capitán saluda a los pasajeros.|Капитан приветствует пассажиров.|travel|
modo|способ; режим|Activa el modo avión.|Включи режим полёта.|travel|
foto|фото|¿Nos haces una foto, por favor?|Сфотографируешь нас, пожалуйста?|travel|
chica|девушка|Mi amiga es una chica muy simpática.|Моя подруга — очень симпатичная девушка.|friends|
negocio|бизнес, дело|Mi hermano tiene un negocio pequeño.|У моего брата небольшой бизнес.|daily|
pie|нога (ступня); основание|Voy a pie al trabajo.|Я хожу на работу пешком.|travel|
par|пара (две штуки)|Necesito un par de zapatos nuevos.|Мне нужна пара новых туфель.|travel|
niña|девочка|La niña juega en la playa.|Девочка играет на пляже.|travel|
perro|собака|¿Se admiten perros en el hotel?|Можно ли с собаками в отель?|travel|
película|фильм|¿Vemos una película esta noche?|Посмотрим сегодня фильм?|friends|
millón|миллион|Madrid tiene más de tres millones de habitantes.|В Мадриде больше трёх миллионов жителей.|travel|
dólar|доллар|El billete cuesta diez dólares.|Билет стоит десять долларов.|travel|
sueño|сон; мечта; сонливость|Tengo mucho sueño hoy.|Сегодня мне очень хочется спать.|daily|
paso|шаг; проход|Hay un paso a nivel cerca del hotel.|Около отеля железнодорожный переезд.|travel|
noticia|новость|Tengo buenas noticias para ti.|У меня для тебя хорошие новости.|friends|
sitio|место; сайт|¿Hay sitio para uno más?|Есть место ещё для одного?|friends|
asunto|дело; тема (письма)|Escribe el asunto del correo.|Напиши тему письма.|it|
oficina|офис|La oficina está en el centro.|Офис в центре.|it|
sentido|смысл; чувство|Tiene sentido reservar con tiempo.|Имеет смысл бронировать заранее.|daily|
cama|кровать|La cama de la habitación es muy cómoda.|Кровать в номере очень удобная.|travel|
agente|агент; сотрудник|El agente de viajes me llamó.|Турагент мне позвонил.|travel|
seguridad|безопасность; охрана|La seguridad del aeropuerto es estricta.|В аэропорту строгий досмотр.|travel|np
país|страна|¿De qué país eres?|Из какой ты страны?|travel|
pueblo|деревня, городок; народ|Pasamos una semana en un pueblo de la costa.|Мы провели неделю в деревне на побережье.|travel|
rey|король|El rey vivió en este palacio.|Король жил в этом дворце.|travel|
marido|муж|Su marido trabaja en Barcelona.|Её муж работает в Барселоне.|friends|
paz|мир, покой|Aquí hay paz y silencio.|Здесь мир и тишина.|daily|np
amiga|подруга|Mi amiga vive en Sevilla.|Моя подруга живёт в Севилье.|friends|
fuerza|сила|Hace falta fuerza para subir la montaña.|Чтобы подняться на гору, нужны силы.|travel|
cambio|изменение; сдача; обмен|Quédese con el cambio.|Сдачи не нужно.|travel|
carta|письмо; меню|Recibí una carta de mi abuela.|Я получил письмо от бабушки.|daily|
secreto|секрет|¿Sabes guardar un secreto?|Умеешь хранить секреты?|friends|
resto|остаток; остальное|Pago yo el resto.|Остальное оплачу я.|friends|
viaje|поездка, путешествие|El viaje dura seis horas.|Поездка занимает шесть часов.|travel|
mensaje|сообщение|Te mando un mensaje esta noche.|Напишу тебе сообщение сегодня вечером.|friends|
hospital|больница|El hospital está a cinco minutos.|Больница в пяти минутах.|daily|
fuego|огонь|Encendimos un fuego en la playa.|Мы разожгли костёр на пляже.|friends|
música|музыка|Me gusta la música española.|Мне нравится испанская музыка.|friends|np
perdón|прощение; простите|Perdón, ¿esta silla está libre?|Простите, этот стул свободен?|friends|
presidente|президент; председатель|El presidente del club es mi hermano.|Председатель клуба — мой брат.|friends|
relación|отношение; связь|Tienen una relación muy bonita.|У них очень хорошие отношения.|friends|
ropa|одежда|Llevo ropa de abrigo.|Я взял тёплую одежду.|travel|np
grupo|группа|Viajamos en un grupo pequeño.|Мы путешествуем небольшой группой.|friends|
orden|порядок; приказ|Todo está en orden.|Всё в порядке.|daily|pl=órdenes
daño|вред, ущерб|La tormenta causó mucho daño.|Шторм нанёс большой ущерб.|travel|
cielo|небо|El cielo está despejado.|Небо ясное.|travel|
pregunta|вопрос|Tengo una pregunta sobre la reserva.|У меня вопрос по брони.|travel|
abogado|адвокат|Mi tío es abogado.|Мой дядя — адвокат.|daily|
voz|голос|Tiene una voz preciosa.|У неё прекрасный голос.|friends|
información|информация|¿Dónde puedo pedir más información?|Где можно получить больше информации?|travel|
control|контроль|El control de pasaportes está a la izquierda.|Паспортный контроль слева.|travel|
cita|встреча (назначенная); цитата|Tengo una cita con el médico.|У меня запись к врачу.|daily|
respuesta|ответ|Espero tu respuesta.|Жду твоего ответа.|friends|
sistema|система|El sistema no responde.|Система не отвечает.|it|
campo|поле; деревня|Vivimos en el campo.|Мы живём в деревне.|travel|
frente|лоб; фасад; en frente — напротив|El hotel está en frente de la estación.|Отель напротив вокзала.|travel|
baño|ванная; туалет|¿Dónde está el baño, por favor?|Где туалет, пожалуйста?|travel|
caja|коробка; касса|Pague en la caja, por favor.|Оплатите на кассе, пожалуйста.|travel|
línea|линия|La línea tres va al centro.|Третья линия идёт в центр.|travel|
boca|рот|Abre la boca, por favor.|Откройте рот, пожалуйста.|daily|
pena|печаль; жаль|¡Qué pena que no puedas venir!|Как жаль, что ты не можешь прийти!|friends|
dolor|боль|Tengo dolor de cabeza.|У меня болит голова.|daily|
atención|внимание|Atención, el vuelo sale por la puerta ocho.|Внимание, рейс вылетает через выход восемь.|travel|
profesor|преподаватель|Mi profesor de español es de Madrid.|Мой преподаватель испанского из Мадрида.|daily|
canción|песня|Esta canción me recuerda al verano.|Эта песня напоминает мне лето.|friends|
novia|девушка (подруга); невеста|Su novia toca la guitarra.|Его девушка играет на гитаре.|friends|
llave|ключ|Perdí la llave de la habitación.|Я потерял ключ от номера.|travel|
servicio|услуга, обслуживание|El servicio fue excelente.|Обслуживание было отличным.|travel|
papel|бумага; роль|Necesito un papel y un bolígrafo.|Мне нужны бумага и ручка.|daily|
ley|закон|Es contra la ley aparcar aquí.|Парковаться здесь запрещено законом.|travel|
mente|ум, разум|Tengo la mente en blanco.|У меня в голове пусто.|daily|
caballo|лошадь|Montamos a caballo por la playa.|Мы ездили верхом по пляжу.|travel|
cámara|камера; фотоаппарат|Olvidé la cámara en el hotel.|Я забыл фотоаппарат в отеле.|travel|
aire|воздух|El aire de la montaña es muy puro.|Горный воздух очень чистый.|travel|
decisión|решение|Fue una decisión difícil.|Это было трудное решение.|daily|
disculpa|извинение|Le debo una disculpa.|Я должен перед вами извиниться.|friends|
víctima|жертва|Las víctimas recibieron ayuda.|Пострадавшие получили помощь.|daily|
situación|ситуация|La situación está bajo control.|Ситуация под контролем.|daily|
estrella|звезда|Vimos las estrellas desde el tejado.|Мы смотрели на звёзды с крыши.|friends|
futuro|будущее|¿Qué planes tienes para el futuro?|Какие у тебя планы на будущее?|daily|
regalo|подарок|Te traigo un regalo.|Я принёс тебе подарок.|friends|
tienda|магазин; палатка|Hay una tienda en la esquina.|На углу есть магазин.|daily|
pelo|волосы|Tiene el pelo largo y oscuro.|У неё длинные тёмные волосы.|daily|
gusto|вкус; удовольствие|Mucho gusto en conocerte.|Очень приятно познакомиться.|friends|
compañía|компания; общество|Trabajo en una compañía pequeña.|Я работаю в небольшой компании.|it|
edad|возраст|¿Qué edad tienen tus hijos?|Сколько лет твоим детям?|daily|
compañero|товарищ, коллега|Mi compañero de piso cocina muy bien.|Мой сосед по квартире очень хорошо готовит.|friends|
barco|корабль, лодка|Tomamos un barco a la isla.|Мы поплыли на остров на лодке.|travel|
montón|куча|Tengo un montón de trabajo.|У меня куча работы.|it|
accidente|несчастный случай|Hubo un accidente en la autopista.|На автостраде произошла авария.|travel|
carrera|карьера; бег; гонка|Mi hermana empezó su carrera en Londres.|Моя сестра начала карьеру в Лондоне.|it|
traje|костюм|Llevo traje a las reuniones.|На встречи я хожу в костюме.|it|
novio|парень (друг); жених|Su novio toca en un grupo.|Её парень играет в группе.|friends|
cargo|должность; плата|Tiene un cargo importante en la empresa.|У него важная должность в компании.|it|
droga|наркотик; лекарство|En el aeropuerto buscan drogas.|В аэропорту ищут наркотики.|travel|
boda|свадьба|Vamos a una boda en junio.|В июне мы идём на свадьбу.|friends|
cena|ужин|La cena es a las nueve.|Ужин в девять.|friends|
brazo|рука (от плеча до кисти)|Llevo la bolsa en el brazo.|Я несу сумку на руке.|daily|
dirección|адрес; направление|¿Cuál es tu dirección de correo?|Какой у тебя адрес почты?|travel|
mitad|половина|Pago la mitad de la cuenta.|Я оплачу половину счёта.|friends|
avión|самолёт|El avión sale con retraso.|Самолёт вылетает с опозданием.|travel|
broma|шутка|Es solo una broma.|Это просто шутка.|friends|
centro|центр|El hotel está en el centro.|Отель находится в центре.|travel|
señal|сигнал; знак|No hay señal en la montaña.|В горах нет сигнала.|travel|
programa|программа|El programa se cierra solo.|Программа закрывается сама.|it|
ataque|нападение; приступ|El servidor sufrió un ataque.|Сервер подвергся атаке.|it|
soldado|солдат|El soldado saluda a la bandera.|Солдат салютует флагу.|travel|
principio|начало; принцип|Al principio no entendía nada.|Сначала я ничего не понимал.|daily|
duda|сомнение|Tengo una duda sobre el horario.|У меня вопрос по расписанию.|travel|
crimen|преступление|Aquí hay poco crimen.|Здесь мало преступности.|daily|pl=crímenes
sol|солнце|Hoy hace mucho sol.|Сегодня очень солнечно.|travel|
alma|душа|Esta música alimenta el alma.|Эта музыка питает душу.|friends|
nave|корабль (космический); зал|La nave espacial aterrizó.|Космический корабль приземлился.|friends|
placer|удовольствие|Es un placer conocerte.|Рад с тобой познакомиться.|friends|
director|директор; режиссёр|El director de la película es español.|Режиссёр фильма — испанец.|friends|
pierna|нога|Me duele la pierna después de la caminata.|У меня болит нога после похода.|travel|
hambre|голод|Tengo mucha hambre.|Я очень голоден.|friends|np
abuela|бабушка|Mi abuela hace el mejor pastel.|Моя бабушка печёт лучший пирог.|friends|
sala|зал; гостиная|La sala de espera está llena.|Зал ожидания полон.|travel|
universidad|университет|Estudié en una universidad española.|Я учился в испанском университете.|daily|
investigación|исследование|La investigación duró dos semanas.|Расследование заняло две недели.|it|
club|клуб|Nos apuntamos a un club de corredores.|Мы записались в клуб бегунов.|friends|
contacto|контакт|Mantenemos el contacto por correo.|Мы поддерживаем связь по почте.|friends|
consejo|совет|¿Me das un consejo?|Дашь мне совет?|friends|
acción|действие; акция|Hay que pasar a la acción.|Нужно переходить к действиям.|it|
prisa|спешка|Tengo prisa, el tren sale ya.|Я спешу, поезд уже отправляется.|travel|
cumpleaños|день рождения|Mañana es mi cumpleaños.|Завтра у меня день рождения.|friends|
ventana|окно|¿Puedo tener un asiento junto a la ventana?|Можно место у окна?|travel|
suelo|пол; земля|Hay agua en el suelo.|На полу вода.|travel|
cárcel|тюрьма|La antigua cárcel es hoy un museo.|Старая тюрьма теперь музей.|travel|
enemigo|враг|En el cuento hay un enemigo.|В сказке есть враг.|friends|
gobierno|правительство|El gobierno anunció nuevas reglas.|Правительство объявило новые правила.|daily|
nota|заметка; оценка|Apunto la dirección en una nota.|Записываю адрес в заметку.|daily|
navidad|Рождество|Pasamos la Navidad con la familia.|Рождество мы проводим с семьёй.|friends|
maestro|учитель; мастер|Mi maestro de guitarra es argentino.|Мой учитель гитары — аргентинец.|friends|
tema|тема|¿Cuál es el tema de la fiesta?|Какая тема вечеринки?|friends|
escena|сцена|La última escena me hizo llorar.|Последняя сцена заставила меня плакать.|friends|
sorpresa|сюрприз|Es una fiesta sorpresa para Lena.|Это вечеринка-сюрприз для Лены.|friends|
ejército|армия|Mi abuelo sirvió en el ejército.|Мой дедушка служил в армии.|daily|
mentira|ложь|No digas mentiras.|Не лги.|friends|
regla|правило; линейка|Estas son las reglas del juego.|Таковы правила игры.|friends|
silencio|тишина|Hubo un silencio incómodo.|Повисла неловкая тишина.|friends|
edificio|здание|El edificio tiene diez plantas.|В здании десять этажей.|travel|
piso|квартира; этаж|Alquilamos un piso cerca de la playa.|Мы сняли квартиру у пляжа.|travel|
fondo|дно; фон|La llave está en el fondo de la bolsa.|Ключ на дне сумки.|daily|
testigo|свидетель|El testigo vio todo.|Свидетель всё видел.|daily|
espalda|спина|Me duele la espalda.|У меня болит спина.|daily|
locura|безумие|¡Qué locura de tráfico!|Какое безумие, а не движение!|travel|
matrimonio|брак; супружеская пара|Mis tíos son un matrimonio feliz.|Мои дядя и тётя — счастливая пара.|friends|
peligro|опасность|Hay peligro de lluvia.|Возможен дождь.|travel|
cerveza|пиво|Dos cervezas, por favor.|Два пива, пожалуйста.|friends|
cerebro|мозг|Usa el cerebro.|Включай мозги.|daily|
banco|банк; скамейка|El banco abre a las nueve.|Банк открывается в девять.|daily|
espacio|пространство; место|No hay mucho espacio en el coche.|В машине мало места.|daily|
permiso|разрешение|¿Necesito permiso para hacer fotos?|Нужно ли разрешение на фото?|travel|
basura|мусор|Saca la basura, por favor.|Вынеси мусор, пожалуйста.|daily|np
color|цвет|¿De qué color es tu maleta?|Какого цвета твой чемодан?|travel|
bar|бар|Quedamos en el bar a las nueve.|Встречаемся в баре в девять.|friends|
libertad|свобода|Viajar me da libertad.|Путешествия дают мне свободу.|travel|np
mar|море|El hotel está junto al mar.|Отель стоит прямо у моря.|travel|
intento|попытка|Fue un buen intento.|Это была хорошая попытка.|daily|
pista|подсказка; трасса|Dame una pista, por favor.|Дай мне подсказку, пожалуйста.|friends|
abuelo|дедушка|Mi abuelo vive en un pueblo pequeño.|Мой дедушка живёт в маленькой деревне.|friends|
opción|вариант|Hay dos opciones para cenar.|Есть два варианта ужина.|friends|
golpe|удар|Me di un golpe en la rodilla.|Я ударился коленом.|daily|
misión|миссия, задача|Nuestra misión es aprender dos idiomas.|Наша задача — выучить два языка.|daily|
dedo|палец|Me corté el dedo en la cocina.|Я порезал палец на кухне.|daily|
oro|золото|El anillo es de oro.|Кольцо золотое.|friends|np
opinión|мнение|En mi opinión, el primer hotel es mejor.|По-моему, первый отель лучше.|friends|
ángel|ангел|Eres un ángel, gracias.|Ты ангел, спасибо.|friends|
cocina|кухня|Todos terminan en la cocina en las fiestas.|На вечеринках все оказываются на кухне.|friends|
salud|здоровье|La salud es lo más importante.|Здоровье — самое важное.|daily|np
informe|отчёт|Te envío el informe por correo.|Отправляю тебе отчёт по почте.|it|
gato|кот|Nuestro gato duerme todo el día.|Наш кот спит весь день.|daily|
partido|матч; партия|Vemos el partido en un bar.|Мы смотрим матч в баре.|friends|
departamento|отдел; квартира (Лат. Америка)|Trabajo en el departamento de IT.|Я работаю в IT-отделе.|it|
frío|холод|Hace mucho frío por la noche.|Ночью очень холодно.|travel|np
bolsa|сумка; пакет|¿Esta bolsa es tuya?|Это твоя сумка?|travel|
zona|зона, район|El casco antiguo es zona peatonal.|Старый город — пешеходная зона.|travel|
luna|луна|La luna brilla esta noche.|Сегодня ночью ярко светит луна.|friends|
base|основа, база|La app tiene una base sólida.|У приложения прочная основа.|it|
árbol|дерево|Comimos bajo un árbol grande.|Мы пообедали под большим деревом.|travel|
causa|причина|¿Cuál es la causa del retraso?|Какова причина задержки?|travel|
flor|цветок|Compré flores para mi madre.|Я купил маме цветы.|friends|
mayoría|большинство|La mayoría de los turistas llega en verano.|Большинство туристов приезжает летом.|travel|
energía|энергия|Hoy no tengo energía.|Сегодня у меня нет сил.|daily|
carne|мясо|No como carne.|Я не ем мясо.|friends|np
posición|позиция; должность|Solicité la posición de diseñador.|Я подал заявку на должность дизайнера.|it|
llama|пламя; лама|La llama del fuego es muy fuerte.|Пламя костра очень сильное.|friends|
entrada|вход; билет|Las entradas se compran en la taquilla.|Билеты покупают в кассе.|friends|
obra|произведение; стройка; пьеса|Vimos una obra de teatro.|Мы смотрели театральную пьесу.|friends|
nivel|уровень|¿Qué nivel de inglés tienes?|Какой у тебя уровень английского?|daily|
juez|судья|El juez dio la razón al cliente.|Судья встал на сторону клиента.|daily|
esperanza|надежда|Mantengo la esperanza de ir.|Я не теряю надежды поехать.|friends|
zapato|туфля, ботинок|Mis zapatos están mojados.|Мои ботинки промокли.|travel|
resultado|результат|El resultado me sorprendió.|Результат меня удивил.|it|
planeta|планета|Nuestro planeta es precioso.|Наша планета прекрасна.|daily|
especie|вид (биологический)|Hay muchas especies de aves aquí.|Здесь много видов птиц.|travel|
reina|королева|La reina visitó la ciudad.|Королева посетила город.|travel|
tarjeta|карта, карточка|¿Puedo pagar con tarjeta?|Можно оплатить картой?|travel|
máquina|машина, аппарат|La máquina de billetes no funciona.|Билетный автомат не работает.|travel|
estudio|учёба; студия|Mi estudio de español ocupa dos horas al día.|На учёбу испанским у меня уходит два часа в день.|daily|
imagen|изображение|La imagen no carga.|Изображение не загружается.|it|pl=imágenes
encuentro|встреча|Fue un encuentro inesperado.|Это была неожиданная встреча.|friends|
banda|группа (музыкальная); лента|Mis amigos tienen una banda.|У моих друзей есть группа.|friends|
hogar|дом, очаг|Mi hogar está lejos de aquí.|Мой дом далеко отсюда.|daily|
posibilidad|возможность|Existe la posibilidad de lluvia.|Возможен дождь.|travel|
sentimiento|чувство|Tengo un buen sentimiento sobre el viaje.|У меня хорошее предчувствие насчёт поездки.|friends|
segundo|секунда; второй|Espera un segundo, por favor.|Подожди секундочку, пожалуйста.|daily|
arte|искусство|Visitamos un museo de arte.|Мы были в музее искусств.|travel|np
destino|судьба; пункт назначения|Nuestro destino es Lisboa.|Наш пункт назначения — Лиссабон.|travel|
visita|визит; гость|Esperamos una visita esta tarde.|Сегодня днём мы ждём гостей.|friends|
motivo|причина, повод|¿Cuál es el motivo de su viaje?|Какова цель вашей поездки?|travel|
operación|операция|La operación del sistema es sencilla.|Работа системы проста.|it|
miembro|член|Soy miembro de un club de lectura.|Я член клуба чтения.|friends|
metro|метро; метр|Voy al trabajo en metro.|Я езжу на работу на метро.|travel|
movimiento|движение|El movimiento del tren me da sueño.|Покачивание поезда клонит меня в сон.|travel|
pareja|пара; партнёр|Mi pareja trabaja desde casa.|Мой партнёр работает из дома.|friends|
éxito|успех|La fiesta fue un éxito.|Вечеринка имела успех.|friends|
experiencia|опыт|Tengo cinco años de experiencia.|У меня пять лет опыта.|it|
felicidad|счастье|La felicidad es compartir con amigos.|Счастье — это время с друзьями.|friends|np
precio|цена|¿Cuál es el precio de la habitación?|Сколько стоит номер?|travel|
salida|выход; отправление|La salida está a la derecha.|Выход справа.|travel|
radio|радио|Pusieron nuestra canción en la radio.|По радио поставили нашу песню.|friends|
ejemplo|пример|¿Me das un ejemplo?|Приведёшь пример?|daily|
pelea|ссора, драка|Tuvieron una pelea por el mapa.|Они поссорились из-за карты.|friends|
valor|ценность; значение; смелость|Hace falta valor para hablar un idioma nuevo.|Чтобы говорить на новом языке, нужна смелость.|daily|
té|чай|¿Quieres té o café?|Тебе чай или кофе?|friends|
norte|север|El pueblo está en el norte.|Деревня находится на севере.|travel|np
objetivo|цель|Nuestro objetivo es acabar en junio.|Наша цель — закончить в июне.|it|
elección|выбор; выборы|Tienes una elección difícil.|У тебя трудный выбор.|friends|
pared|стена|Hay fotos viejas en la pared.|На стене висят старые фото.|daily|
toque|прикосновение; штрих|Dale un toque personal.|Добавь личный штрих.|friends|
calma|спокойствие|Mantén la calma, tenemos tiempo.|Сохраняй спокойствие, время есть.|travel|np
pistola|пистолет|La película tiene muchas pistolas.|В фильме много пистолетов.|friends|
cuestión|вопрос, проблема|Es una cuestión de tiempo.|Это вопрос времени.|daily|
beso|поцелуй|Me dio un beso de despedida.|Он поцеловал меня на прощание.|friends|
río|река|Hicimos un picnic junto al río.|Мы устроили пикник у реки.|travel|
regreso|возвращение|El regreso es el domingo.|Возвращение в воскресенье.|travel|
héroe|герой|Cada niño necesita un héroe.|Каждому ребёнку нужен герой.|friends|
apartamento|квартира|Alquilamos un apartamento cerca de la playa.|Мы сняли квартиру у пляжа.|travel|
colega|коллега|Mi colega habla cinco idiomas.|Мой коллега говорит на пяти языках.|it|
huevo|яйцо|Quiero dos huevos para el desayuno.|На завтрак я хочу два яйца.|travel|
espíritu|дух|Tiene un espíritu aventurero.|У него авантюрный дух.|friends|
unidad|единица; модуль|Cada unidad tiene sus pruebas.|У каждого модуля есть тесты.|it|
empresa|компания|Trabajo para una empresa de software.|Я работаю в софтверной компании.|it|
inglés|английский (язык); англичанин|Hablo inglés y español.|Я говорю по-английски и по-испански.|daily|
detalle|деталь|Te envío los detalles por correo.|Пришлю тебе подробности по почте.|it|
marcha|ход; марш; отправление|Estamos en marcha.|Мы в пути.|travel|
marca|марка; отметка|¿Qué marca de móvil tienes?|Какой марки у тебя телефон?|daily|
estudiante|студент|Soy estudiante de diseño.|Я студент-дизайнер.|daily|
batalla|битва|La batalla fue aquí en 1808.|Здесь в 1808 году произошла битва.|travel|
sur|юг|Fuimos al sur de España.|Мы ездили на юг Испании.|travel|np
trago|глоток; напиток|Tomamos un trago después del trabajo.|Мы выпиваем после работы.|friends|
piel|кожа|Usa crema para proteger la piel.|Пользуйся кремом, чтобы защитить кожу.|travel|
riesgo|риск|Saltarse las pruebas es un riesgo.|Пропускать тесты — риск.|it|
estilo|стиль|Me gusta tu estilo.|Мне нравится твой стиль.|friends|
asiento|место (сиденье)|¿Este asiento está libre?|Это место свободно?|travel|
conversación|разговор|Tuvimos una conversación larga.|У нас был долгий разговор.|friends|
trampa|ловушка; жульничество|Eso es trampa.|Это жульничество.|friends|
fantasma|привидение|Dicen que hay un fantasma en el hotel.|Говорят, в отеле живёт призрак.|travel|
camión|грузовик|Un camión bloquea la calle.|Грузовик перегородил улицу.|travel|
monstruo|чудовище|A los niños les gustan las películas de monstruos.|Дети любят фильмы про монстров.|friends|
piedra|камень|Las calles son de piedra.|Улицы вымощены камнем.|travel|
estado|состояние; штат|El servidor está en mal estado.|Сервер в плохом состоянии.|it|
montaña|гора|Subimos a la montaña en dos horas.|Мы поднялись на гору за два часа.|travel|
verano|лето|En verano siempre viajamos.|Летом мы всегда путешествуем.|travel|
anillo|кольцо|Perdí el anillo en la playa.|Я потерял кольцо на пляже.|friends|
diente|зуб|Me duele un diente, necesito un dentista.|У меня болит зуб, мне нужен стоматолог.|daily|
cuello|шея; воротник|Me duele el cuello después del vuelo.|У меня затекла шея после перелёта.|travel|
enfermedad|болезнь|La enfermedad duró una semana.|Болезнь длилась неделю.|daily|
efecto|эффект|La medicina no tiene efectos secundarios.|У лекарства нет побочных эффектов.|daily|
pantalón|брюки|Necesito un pantalón limpio.|Мне нужны чистые брюки.|travel|
botella|бутылка|¿Nos trae una botella de agua?|Принесёте нам бутылку воды?|travel|
restaurante|ресторан|Reservé mesa en un restaurante español.|Я забронировал столик в испанском ресторане.|friends|
animal|животное|¿Se admiten animales?|Можно ли с животными?|travel|
sonido|звук|El sonido de la radio es muy bajo.|Звук радио очень тихий.|daily|
presión|давление|Siento la presión antes de un lanzamiento.|Я чувствую давление перед релизом.|it|
red|сеть|La red está caída.|Сеть не работает.|it|
turno|очередь; смена|Es tu turno.|Теперь твоя очередь.|friends|
ruido|шум|Hay mucho ruido en la calle.|На улице много шума.|travel|
dueño|владелец|El dueño del café es muy amable.|Владелец кафе очень приветлив.|travel|
silla|стул|¿Nos trae una silla más?|Принесёте ещё один стул?|friends|
nariz|нос|Tengo la nariz fría.|У меня замёрз нос.|daily|
laboratorio|лаборатория|El laboratorio está en la segunda planta.|Лаборатория на втором этаже.|it|
emergencia|чрезвычайная ситуация|Llame a este número en caso de emergencia.|В экстренной ситуации звоните по этому номеру.|travel|
compra|покупка|Hice varias compras en el mercado.|Я сделал несколько покупок на рынке.|daily|
justicia|справедливость|La justicia es importante para todos.|Справедливость важна для всех.|daily|np
condición|условие; состояние|La habitación está en buenas condiciones.|Номер в хорошем состоянии.|travel|
interés|интерес; процент|Tengo interés en la fotografía.|Я интересуюсь фотографией.|friends|
calor|жара, тепло|Hace mucho calor en julio.|В июле очень жарко.|travel|np
reloj|часы|El reloj de la pared no funciona.|Настенные часы не работают.|daily|
cine|кино|Vamos al cine el sábado.|В субботу идём в кино.|friends|
memoria|память; воспоминание|Tengo buenos recuerdos y buena memoria.|У меня хорошие воспоминания и хорошая память.|friends|
intención|намерение|No tenía intención de molestar.|У меня не было намерения вас беспокоить.|daily|
propósito|цель, намерение|¿Cuál es el propósito de su visita?|Какова цель вашего визита?|travel|
vacaciones|отпуск, каникулы|¿Dónde pasas las vacaciones?|Где ты проводишь отпуск?|travel|np
taxi|такси|Tomamos un taxi al hotel.|Мы взяли такси до отеля.|travel|
confianza|доверие; уверенность|La confianza es importante en un equipo.|Доверие важно в команде.|friends|np
lucha|борьба|Aprender dos idiomas es una lucha diaria.|Учить два языка — ежедневная борьба.|daily|
cuchillo|нож|¿Me trae un cuchillo y un tenedor?|Принесите мне нож и вилку?|friends|
victoria|победа|La victoria alegró a todos.|Победа всех обрадовала.|friends|
líder|лидер|El líder del grupo habla español.|Руководитель группы говорит по-испански.|travel|
cantidad|количество|¿Qué cantidad de equipaje puedo llevar?|Сколько багажа я могу взять?|travel|
necesidad|необходимость, потребность|No hay necesidad de correr.|Нет необходимости спешить.|daily|
amenaza|угроза|La advertencia es una amenaza real.|Предупреждение — реальная угроза.|it|
plato|тарелка; блюдо|El plato del día es paella.|Блюдо дня — паэлья.|travel|
viento|ветер|Hay mucho viento en la costa.|На побережье сильный ветер.|travel|
leche|молоко|Café con leche, por favor.|Кофе с молоком, пожалуйста.|travel|np
pieza|деталь; кусок|Falta una pieza del juego.|Не хватает одной детали игры.|friends|
área|область; район|Esta área es segura de noche.|Этот район безопасен ночью.|travel|
pan|хлеб|El pan fresco se hace cada mañana.|Свежий хлеб выпекают каждое утро.|travel|
colegio|школа|Mis hijos van al colegio en bici.|Мои дети ездят в школу на велосипеде.|daily|
pastel|торт, пирожное|¿Quién quiere pastel de cumpleaños?|Кто хочет праздничного торта?|friends|
medicina|лекарство; медицина|Necesito medicina para el dolor.|Мне нужно лекарство от боли.|travel|
príncipe|принц|El príncipe vivía en este castillo.|Принц жил в этом замке.|travel|
desastre|катастрофа|El viaje fue un desastre.|Поездка была катастрофой.|travel|
contrato|контракт|Firmé el contrato ayer.|Я подписал контракт вчера.|it|
agujero|дыра|Tengo un agujero en el calcetín.|У меня дырка в носке.|daily|
acto|акт; действие|Fue un acto de valentía.|Это был акт смелости.|daily|
cabello|волосы|Tiene el cabello rubio.|У неё светлые волосы.|daily|
escalera|лестница|El hotel no tiene ascensor, solo escalera.|В отеле нет лифта, только лестница.|travel|
playa|пляж|La playa está a diez minutos.|Пляж в десяти минутах.|travel|
examen|экзамен|El lunes tengo un examen.|В понедельник у меня экзамен.|daily|pl=exámenes
cinta|лента; скотч|Necesitamos cinta para cerrar la caja.|Нам нужен скотч, чтобы закрыть коробку.|daily|
pecho|грудь|Me duele el pecho.|У меня болит грудь.|daily|
fuente|фонтан; источник|Hay una fuente en la plaza.|На площади есть фонтан.|travel|
socio|партнёр; член|Mi socio vive en Berlín.|Мой партнёр живёт в Берлине.|it|
autobús|автобус|El autobús pasa cada diez minutos.|Автобус ходит каждые десять минут.|travel|
cuento|рассказ, сказка|Mi abuela me contaba un cuento cada noche.|Бабушка каждый вечер рассказывала мне сказку.|friends|
amante|любитель; любовник|Soy un amante de la música.|Я любитель музыки.|friends|
parque|парк|Paseamos por el parque.|Мы гуляли по парку.|friends|
hueso|кость|El perro encontró un hueso.|Собака нашла кость.|daily|
hielo|лёд|¿Quiere hielo en la bebida?|Вам лёд в напиток?|friends|np
voto|голос (на выборах); обет|Cada voto cuenta.|Каждый голос важен.|friends|
prensa|пресса|La noticia salió en la prensa.|Новость появилась в прессе.|daily|np
dato|данные, факт|Guarda los datos antes de cerrar.|Сохрани данные перед закрытием.|it|
puente|мост|Cruza el puente y gira a la izquierda.|Перейди мост и поверни налево.|travel|
pez|рыба (живая)|Vimos muchos peces en el mar.|Мы видели много рыбы в море.|travel|
vecino|сосед|Mi vecino toca la guitarra.|Мой сосед играет на гитаре.|friends|
televisión|телевидение; телевизор|No hay televisión en la habitación.|В номере нет телевизора.|travel|
serie|сериал; серия|Vemos una serie por las noches.|По вечерам мы смотрим сериал.|friends|
siglo|век|La iglesia es del siglo doce.|Церковь построена в двенадцатом веке.|travel|
carga|груз; нагрузка|El servidor tiene mucha carga.|У сервера большая нагрузка.|it|
video|видео|Grabé un video del concierto.|Я снял видео концерта.|friends|
velocidad|скорость|El tren alcanza mucha velocidad.|Поезд развивает большую скорость.|travel|
oferta|предложение; скидка|Hay una oferta en vuelos a Roma.|Есть акция на рейсы в Рим.|travel|
propiedad|собственность, недвижимость|La propiedad pertenece a mi tío.|Недвижимость принадлежит моему дяде.|travel|
naturaleza|природа|Nos encanta la naturaleza.|Мы любим природу.|travel|np
pelota|мяч|Los niños juegan con una pelota.|Дети играют с мячом.|friends|
disco|диск; дискотека|El disco duro está lleno.|Жёсткий диск заполнен.|it|
distancia|расстояние|La distancia hasta la playa es corta.|До пляжа недалеко.|travel|
espectáculo|шоу|El espectáculo empieza a las nueve.|Шоу начинается в девять.|friends|
época|эпоха; время|En esta época hace mucho calor.|В это время года очень жарко.|travel|
responsabilidad|ответственность|Es tu responsabilidad revisar las fechas.|Проверять даты — твоя обязанность.|it|
espada|меч|El museo tiene una espada antigua.|В музее есть древний меч.|travel|
artista|художник; артист|El artista pintó toda la calle.|Художник расписал всю улицу.|friends|
modelo|модель|¿Qué modelo de móvil tienes?|Какая у тебя модель телефона?|it|
ministro|министр|El ministro inauguró el festival.|Министр открыл фестиваль.|travel|
peso|вес; песо|El límite de peso es veinte kilos.|Ограничение по весу — двадцать килограммов.|travel|
planta|растение; этаж|Mi habitación está en la tercera planta.|Мой номер на третьем этаже.|travel|
sombrero|шляпа|No olvides el sombrero, hace sol.|Не забудь шляпу, там солнечно.|travel|
universo|вселенная|El universo es enorme.|Вселенная огромна.|friends|
pollo|курица|Quiero el pollo con arroz.|Мне курицу с рисом.|friends|
mirada|взгляд|Me dio una mirada amable.|Он бросил на меня добрый взгляд.|friends|
jardín|сад|Su casa tiene un jardín precioso.|У их дома чудесный сад.|friends|
descanso|отдых; перерыв|Hacemos un descanso de diez minutos.|Делаем перерыв на десять минут.|travel|
apoyo|поддержка|Gracias por tu apoyo.|Спасибо за твою поддержку.|friends|
mercado|рынок|Compramos fruta en el mercado.|Мы купили фрукты на рынке.|travel|
teoría|теория|Por ahora es solo una teoría.|Пока это только теория.|it|
premio|приз, премия|El primer premio es un fin de semana en Roma.|Первый приз — выходные в Риме.|friends|
sociedad|общество|La sociedad cambia rápido.|Общество быстро меняется.|daily|
pensamiento|мысль|Tuve un pensamiento sobre el viaje.|У меня появилась мысль насчёт поездки.|friends|
pago|оплата|El pago se hace en la recepción.|Оплата производится на ресепшене.|travel|
domingo|воскресенье|El domingo comemos en casa de mis abuelos.|По воскресеньям мы обедаем у бабушки и дедушки.|friends|
aspecto|вид; аспект|El aspecto del hotel me gusta.|Мне нравится вид отеля.|travel|
magia|магия, волшебство|El espectáculo estuvo lleno de magia.|Шоу было полно волшебства.|friends|np
vergüenza|стыд|Me da vergüenza hablar en público.|Мне стыдно говорить на публике.|friends|
uso|использование|El uso del móvil está prohibido.|Пользоваться телефоном запрещено.|travel|
declaración|заявление; декларация|Llene la declaración de aduana.|Заполните таможенную декларацию.|travel|
pájaro|птица|Vimos muchos pájaros en el lago.|На озере мы видели много птиц.|travel|
carretera|шоссе|La carretera a la playa está cerrada.|Дорога на пляж закрыта.|travel|
página|страница|Abre el libro por la página diez.|Откройте книгу на десятой странице.|daily|
criatura|существо|Es una criatura muy rara.|Это очень редкое существо.|friends|
viernes|пятница|El viernes salimos de viaje.|В пятницу мы уезжаем.|travel|
hecho|факт|Es un hecho, no una opinión.|Это факт, а не мнение.|daily|
ciencia|наука|La ciencia fue mi asignatura favorita.|Наука была моим любимым предметом.|daily|
habilidad|навык|Hablar es una habilidad útil.|Разговорная речь — полезный навык.|daily|
talento|талант|Tiene talento para la música.|У неё талант к музыке.|friends|
meta|цель; финиш|Nuestra meta es llegar en junio.|Наша цель — приехать в июне.|it|
oeste|запад|El sol se pone en el oeste.|Солнце садится на западе.|travel|np
venta|продажа|Hay una gran venta este fin de semana.|В эти выходные большая распродажа.|travel|
artículo|статья; товар|Leí un artículo interesante sobre España.|Я прочитал интересную статью об Испании.|daily|
tarde|вторая половина дня|Nos vemos mañana por la tarde.|До завтра, днём.|friends|
motor|двигатель|El motor arrancó con mucho ruido.|Двигатель завёлся с сильным шумом.|travel|
pérdida|потеря|Informamos de la pérdida del equipaje.|Мы заявили о потере багажа.|travel|
kilómetro|километр|El hotel está a un kilómetro del centro.|Отель в километре от центра.|travel|
jugador|игрок|Es un jugador de guitarra excelente.|Он отличный гитарист.|friends|
humor|юмор; настроение|Hoy estoy de buen humor.|Сегодня я в хорошем настроении.|friends|
pintura|краска; живопись|La pintura todavía está fresca.|Краска ещё свежая.|daily|
copia|копия|Haga una copia del pasaporte.|Сделайте копию паспорта.|travel|
entrenador|тренер|El entrenador está contento con el equipo.|Тренер доволен командой.|friends|
límite|предел, лимит|El límite de velocidad es cincuenta.|Ограничение скорости — пятьдесят.|travel|
computadora|компьютер (Лат. Америка)|Mi computadora está muy lenta.|Мой компьютер очень тормозит.|it|
material|материал|La bolsa es de un material resistente.|Сумка сделана из прочного материала.|daily|
conexión|соединение; пересадка|La conexión en Frankfurt es corta.|Пересадка во Франкфурте очень короткая.|travel|
acceso|доступ|¿Tienes acceso al servidor?|У тебя есть доступ к серверу?|it|
oscuridad|темнота|Caminamos a casa en la oscuridad.|Мы шли домой в темноте.|daily|np
comienzo|начало|El comienzo del concierto es a las ocho.|Начало концерта в восемь.|friends|
teatro|театр|Fuimos al teatro anoche.|Вчера вечером мы ходили в театр.|friends|
entrevista|интервью; собеседование|Mañana tengo una entrevista de trabajo.|Завтра у меня собеседование.|it|
visión|зрение; видение|Tengo mejor visión con gafas.|В очках я вижу лучше.|daily|
camisa|рубашка|Necesito una camisa limpia para esta noche.|Мне нужна чистая рубашка на вечер.|travel|
escenario|сцена; обстановка|El grupo salió al escenario.|Группа вышла на сцену.|friends|
almuerzo|обед|Hacemos el almuerzo a las dos.|Обедаем в два.|friends|
bolsillo|карман|Llevo el pasaporte en el bolsillo.|Паспорт я ношу в кармане.|travel|
genio|гений; характер|Es un genio de la informática.|Он гений информатики.|it|
alcalde|мэр|El alcalde abrió el festival.|Мэр открыл фестиваль.|travel|
esfuerzo|усилие|Gracias por todo tu esfuerzo.|Спасибо за все твои усилия.|it|
campamento|лагерь|Montamos el campamento junto al lago.|Мы разбили лагерь у озера.|travel|
promesa|обещание|Una promesa es una promesa.|Обещание есть обещание.|friends|
lobo|волк|En esta sierra hay lobos.|В этих горах водятся волки.|travel|
proceso|процесс|El proceso tarda unos diez minutos.|Процесс занимает около десяти минут.|it|
lengua|язык (орган; язык)|¿Cuántas lenguas hablas?|На скольких языках ты говоришь?|daily|
aventura|приключение|El viaje fue una gran aventura.|Поездка была большим приключением.|travel|
firma|подпись|Necesito tu firma aquí.|Мне нужна твоя подпись здесь.|travel|
lección|урок|La primera lección fue sobre el alfabeto.|Первый урок был про алфавит.|daily|
oso|медведь|Vimos un oso en las montañas.|В горах мы видели медведя.|travel|
tormenta|гроза, шторм|Esta noche viene una tormenta.|Сегодня ночью ожидается гроза.|travel|
lástima|жаль|¡Qué lástima que no puedas venir!|Как жаль, что ты не можешь прийти!|friends|
piloto|пилот|El piloto saludó a los pasajeros.|Пилот поприветствовал пассажиров.|travel|
carro|машина (Лат. Америка)|Alquilamos un carro para el fin de semana.|Мы взяли машину напрокат на выходные.|travel|
discurso|речь|Hizo un discurso corto en la boda.|На свадьбе он произнёс короткую речь.|friends|
recuerdo|воспоминание; сувенир|Tengo muy buenos recuerdos del viaje.|У меня очень хорошие воспоминания о поездке.|travel|
actor|актёр|Mi amigo es actor.|Мой друг — актёр.|friends|
autoridad|власть; орган|Contacte con las autoridades locales.|Обратитесь в местные органы власти.|travel|
voluntad|воля|Tiene mucha fuerza de voluntad.|У него сильная сила воли.|daily|
documento|документ|Traiga sus documentos, por favor.|Принесите ваши документы, пожалуйста.|travel|
sensación|ощущение|Tengo una sensación extraña.|У меня странное ощущение.|friends|
desayuno|завтрак|El desayuno se sirve de siete a diez.|Завтрак подают с семи до десяти.|travel|
crédito|кредит|Puede pagar con tarjeta de crédito.|Можно заплатить кредитной картой.|travel|
polvo|пыль; порошок|Hay polvo en la estantería.|На полке пыль.|daily|np
ocasión|случай, возможность|Es una buena ocasión para practicar.|Это хороший случай попрактиковаться.|daily|
queso|сыр|Probamos el queso local.|Мы попробовали местный сыр.|travel|
fecha|дата|¿Cuál es la fecha de tu vuelo?|Какая дата у твоего рейса?|travel|
esquina|угол|La parada está en la esquina.|Остановка на углу.|travel|
revista|журнал|Compré una revista para el vuelo.|Я купил журнал для полёта.|travel|
cadena|цепь; канал|Cambia de cadena, por favor.|Переключи канал, пожалуйста.|daily|
chocolate|шоколад|Quiero un chocolate caliente.|Хочу горячий шоколад.|friends|
objeto|предмет|Hay un objeto raro en la maleta.|В чемодане странный предмет.|travel|
paquete|посылка; пакет|Llegó un paquete para ti.|Для тебя пришла посылка.|it|
móvil|мобильный телефон|Mi móvil no tiene batería.|У моего телефона села батарея.|daily|
milagro|чудо|Es un milagro que lo logremos.|Чудо, что мы успеем.|friends|
temporada|сезон|El verano es temporada alta.|Лето — высокий сезон.|travel|
tamaño|размер|¿Qué tamaño de camiseta usas?|Какой у тебя размер футболки?|daily|
primo|двоюродный брат|Mi primo vive en Valencia.|Мой двоюродный брат живёт в Валенсии.|friends|
emoción|волнение; эмоция|La música está llena de emoción.|Музыка полна эмоций.|friends|
personaje|персонаж|Me encanta el personaje principal.|Мне нравится главный герой.|friends|
pesadilla|кошмар|Anoche tuve una pesadilla.|Прошлой ночью мне приснился кошмар.|daily|
vaso|стакан|¿Me da un vaso de agua?|Дайте мне стакан воды?|friends|
techo|потолок; крыша|Tomamos algo en el techo del hotel.|Мы выпили на крыше отеля.|friends|
secretario|секретарь|El secretario organiza las reuniones.|Секретарь организует встречи.|it|
lluvia|дождь|La lluvia no para.|Дождь не прекращается.|travel|
internet|интернет|¿Hay internet en la habitación?|В номере есть интернет?|travel|np
alcohol|алкоголь|Aquí no venden alcohol.|Здесь не продают алкоголь.|friends|np
curso|курс|Hago un curso de inglés por internet.|Я прохожу онлайн-курс английского.|daily|
fotografía|фотография|Esta fotografía es de 1990.|Эта фотография сделана в 1990 году.|travel|
tesoro|сокровище, клад|Buscamos un tesoro en la playa.|Мы искали клад на пляже.|travel|
rodilla|колено|Me duele la rodilla.|У меня болит колено.|travel|
lago|озеро|Nadamos en el lago.|Мы купались в озере.|travel|
derecho|право; правая сторона|Todos tenemos derecho a descansar.|У всех есть право на отдых.|daily|
fútbol|футбол|Vemos el fútbol en un bar.|Мы смотрим футбол в баре.|friends|np
olor|запах|¿Qué es ese olor?|Что это за запах?|friends|
gloria|слава|La ciudad vivió su gloria en el siglo quince.|В XV веке город был в зените славы.|travel|np
salón|зал; гостиная|El salón del hotel es muy grande.|Зал в отеле очень большой.|travel|
instituto|институт; школа|Mi hermana va al instituto.|Моя сестра ходит в школу.|daily|
medida|мера; размер|Tomaron medidas de seguridad.|Были приняты меры безопасности.|travel|
cheque|чек|Pagué con un cheque.|Я заплатил чеком.|daily|
lío|путаница, беспорядок|¡Qué lío con los billetes!|Какая путаница с билетами!|travel|
paciente|пациент|El médico atiende a diez pacientes al día.|Врач принимает десять пациентов в день.|daily|
protección|защита|Usa protección solar en la playa.|Пользуйся защитой от солнца на пляже.|travel|np
corriente|ток; течение|Hay mucha corriente en el río.|В реке сильное течение.|travel|
venganza|месть|La película trata de una venganza.|Фильм о мести.|friends|
asistente|помощник|El asistente reservó la sala.|Ассистент забронировал переговорную.|it|
diversión|развлечение|¡Que tengas mucha diversión!|Желаю хорошо повеселиться!|friends|np
gracia|юмор; изящество|Tu broma me hizo gracia.|Твоя шутка меня рассмешила.|friends|
nieve|снег|Hay mucha nieve en la montaña.|В горах много снега.|travel|np
empleo|работа, занятость|Busco empleo en Madrid.|Я ищу работу в Мадриде.|it|
solución|решение|Encontramos una solución rápida.|Мы нашли быстрое решение.|it|
médico|врач|Voy al médico mañana.|Завтра я иду к врачу.|daily|
deuda|долг|Pagó toda su deuda.|Он погасил весь свой долг.|daily|
barrio|район|Nos encanta este barrio.|Нам нравится этот район.|travel|
incendio|пожар|Hubo un incendio en el bosque.|В лесу был пожар.|travel|
milla|миля|La playa está a una milla.|Пляж в миле отсюда.|travel|
letra|буква; слова песни|Me sé la letra de esta canción.|Я знаю слова этой песни.|friends|
granja|ферма|Pasamos una semana en una granja.|Мы провели неделю на ферме.|travel|
gira|турне|El grupo está de gira por España.|Группа гастролирует по Испании.|friends|
bolso|сумка (дамская)|Perdí el bolso en el tren.|Я потеряла сумку в поезде.|travel|
tecnología|технология|La nueva tecnología cambia cómo aprendemos.|Новые технологии меняют то, как мы учимся.|it|
risa|смех|Tiene una risa contagiosa.|У неё заразительный смех.|friends|
comunidad|сообщество|La app tiene una comunidad amable.|У приложения дружелюбное сообщество.|it|
conocimiento|знание|El conocimiento de dos idiomas es útil.|Знание двух языков полезно.|daily|
taza|чашка|Una taza de café, por favor.|Чашку кофе, пожалуйста.|friends|
altura|высота|La altura de la torre es de cien metros.|Высота башни — сто метров.|travel|
amistad|дружба|Nuestra amistad dura diez años.|Наша дружба длится десять лет.|friends|
compromiso|обязательство; помолвка|Tengo un compromiso el sábado.|У меня в субботу дела.|friends|
producto|продукт|El producto sale la próxima semana.|Продукт выходит на следующей неделе.|it|
hombro|плечо|Me duele el hombro por la mochila.|У меня болит плечо от рюкзака.|travel|
evento|мероприятие|Organizamos un evento para amigos.|Мы организовали мероприятие для друзей.|friends|
ala|крыло|Siempre pido un asiento junto al ala.|Я всегда прошу место у крыла.|travel|
labio|губа|Se mordió el labio.|Он закусил губу.|daily|
canal|канал|Este canal tiene buenas noticias.|На этом канале хорошие новости.|daily|
moneda|монета; валюта|Encontré una moneda antigua.|Я нашёл старинную монету.|travel|
fortuna|удача; состояние|Hizo fortuna con la informática.|Он сколотил состояние на информатике.|it|
lunes|понедельник|El lunes empiezo el curso.|В понедельник я начинаю курс.|daily|
nación|нация|Toda la nación vio el partido.|Вся страна смотрела матч.|daily|
alegría|радость|Los niños gritaron de alegría.|Дети кричали от радости.|friends|np
sonrisa|улыбка|Tiene una sonrisa preciosa.|У неё прекрасная улыбка.|friends|
conductor|водитель|El conductor del taxi conocía el camino.|Водитель такси знал дорогу.|travel|
inteligencia|интеллект|Es una persona de gran inteligencia.|Это очень умный человек.|daily|np
fábrica|фабрика|Trabaja en una fábrica de coches.|Он работает на автомобильном заводе.|daily|
frontera|граница|Cruzamos la frontera de noche.|Мы пересекли границу ночью.|travel|
tumba|могила|Visitamos la tumba del poeta.|Мы посетили могилу поэта.|travel|
explosión|взрыв|Se oyó una explosión.|Раздался взрыв.|friends|
estómago|желудок, живот|Me duele el estómago.|У меня болит живот.|travel|
campaña|кампания|La campaña empieza el mes que viene.|Кампания стартует в следующем месяце.|it|
ventaja|преимущество|Una ventaja es el precio bajo.|Одно из преимуществ — низкая цена.|it|
sobrino|племянник|Mi sobrino toca el piano.|Мой племянник играет на пианино.|friends|
agencia|агентство|Reservamos en una agencia de viajes.|Мы бронировали через турагентство.|travel|
vehículo|транспортное средство|El vehículo está en el garaje.|Автомобиль в гараже.|travel|
espejo|зеркало|La habitación tiene un espejo grande.|В номере большое зеркало.|travel|
violencia|насилие|La película tiene mucha violencia.|В фильме много насилия.|friends|np
ritmo|ритм, темп|Me gusta el ritmo de esta canción.|Мне нравится ритм этой песни.|friends|
pizza|пицца|Pedimos una pizza para todos.|Мы заказали пиццу на всех.|friends|
presencia|присутствие|Se requiere su presencia.|Требуется ваше присутствие.|it|
cable|кабель|Necesito un cable para el móvil.|Мне нужен кабель для телефона.|it|
chaqueta|куртка|Lleva una chaqueta, hace viento.|Возьми куртку, там ветрено.|travel|
tratamiento|лечение|El tratamiento dura dos semanas.|Лечение длится две недели.|daily|
parada|остановка|La parada del autobús está cerca.|Остановка автобуса рядом.|travel|
hoja|лист; страница|Dame una hoja de papel.|Дай мне лист бумаги.|daily|
galleta|печенье|¿Quieres una galleta con el café?|Хочешь печенье к кофе?|friends|
ciudadano|гражданин|Es un ciudadano español.|Он гражданин Испании.|travel|
entrega|доставка; сдача|La entrega tarda dos días.|Доставка занимает два дня.|daily|
pasillo|коридор|Mi habitación está al final del pasillo.|Мой номер в конце коридора.|travel|
fila|очередь; ряд|Hay mucha fila en el control.|На контроле большая очередь.|travel|
coincidencia|совпадение|¡Qué coincidencia verte aquí!|Какое совпадение — увидеть тебя здесь!|friends|
invitado|гость|Tenemos invitados a cenar.|К ужину у нас гости.|friends|
entrenamiento|тренировка|El entrenamiento empieza a las siete.|Тренировка начинается в семь.|daily|
moda|мода|Trabaja en el mundo de la moda.|Она работает в индустрии моды.|friends|np
comunicación|общение; связь|La comunicación en equipo es clave.|Общение в команде — ключ.|it|
espera|ожидание|La espera en el aeropuerto fue larga.|Ожидание в аэропорту было долгим.|travel|
sesión|сеанс; сессия|Inicia una sesión nueva.|Начни новый сеанс.|it|
concierto|концерт|El concierto empieza a las ocho.|Концерт начинается в восемь.|friends|
explicación|объяснение|Gracias por la explicación.|Спасибо за объяснение.|daily|
ruta|маршрут|¿Cuál es la mejor ruta al aeropuerto?|Какой лучший маршрут до аэропорта?|travel|
armario|шкаф|La ropa está en el armario.|Одежда в шкафу.|travel|
anuncio|объявление; реклама|Escuchamos un anuncio por el altavoz.|Мы услышали объявление по громкой связи.|travel|
espía|шпион|La película trata de un espía.|Фильм о шпионе.|friends|
maravilla|чудо|La Alhambra es una maravilla.|Альгамбра — чудо.|travel|
botón|кнопка|Pulsa el botón verde para confirmar.|Нажми зелёную кнопку для подтверждения.|it|
cola|очередь; хвост|Hay una cola larga en la taquilla.|У кассы длинная очередь.|travel|
actividad|занятие, активность|Hay muchas actividades para los niños.|Есть много занятий для детей.|travel|
palacio|дворец|Visitamos el palacio real.|Мы посетили королевский дворец.|travel|
cuadro|картина; квадрат|El museo tiene un cuadro de Goya.|В музее есть картина Гойи.|travel|
ambulancia|скорая помощь|¡Llamen a una ambulancia!|Вызовите скорую!|travel|
diamante|алмаз|El anillo tiene un diamante.|В кольце бриллиант.|friends|
arena|песок|La arena estaba caliente.|Песок был горячим.|travel|np
importancia|важность|Entiendo la importancia de ensayar.|Понимаю важность практики.|daily|
impresión|впечатление|La ciudad me dio muy buena impresión.|Город произвёл на меня очень хорошее впечатление.|travel|
escritor|писатель|Mi escritor favorito es Cervantes.|Мой любимый писатель — Сервантес.|friends|
serpiente|змея|Vimos una serpiente en el camino.|На тропе мы видели змею.|travel|
licencia|лицензия, права|¿Tiene licencia de conducir?|У вас есть водительские права?|travel|
misterio|тайна|La película es un misterio.|Фильм — загадка.|friends|
identidad|личность|Muestre un documento de identidad.|Предъявите документ, удостоверяющий личность.|travel|
saludo|приветствие|Un saludo de mi parte a tu familia.|Привет от меня твоей семье.|friends|
madera|дерево (материал)|La mesa es de madera.|Стол деревянный.|daily|
campeón|чемпион|Son los campeones de la liga.|Они чемпионы лиги.|friends|
juguete|игрушка|Los niños guardaron los juguetes.|Дети собрали игрушки.|travel|
sección|раздел|Mira la sección siguiente para más detalles.|Подробности смотри в следующем разделе.|it|
invierno|зима|El invierno es frío en Moscú.|Зимой в Москве холодно.|travel|
trabajador|работник|Los trabajadores arreglaron la carretera.|Рабочие починили дорогу.|daily|
ducha|душ|Me doy una ducha y estoy listo.|Приму душ и буду готов.|daily|
piscina|бассейн|El hotel tiene una piscina en el techo.|В отеле есть бассейн на крыше.|travel|
periodista|журналист|Mi tía es periodista.|Моя тётя — журналистка.|friends|
palo|палка|Los niños juegan con un palo.|Дети играют с палкой.|friends|
cristal|стекло; хрусталь|El vaso es de cristal.|Стакан стеклянный.|friends|
poder|власть; сила|El poder del equipo está en la unión.|Сила команды — в единстве.|friends|
aviso|предупреждение|Recibí un aviso del banco.|Я получил уведомление из банка.|daily|
traducción|перевод|La traducción de la frase es correcta.|Перевод фразы верный.|daily|
educación|образование; воспитание|La educación es gratuita en muchos países.|Во многих странах образование бесплатное.|daily|np
sótano|подвал|El gimnasio está en el sótano.|Спортзал в подвале.|travel|
vía|путь; дорога|El tren sale de la vía tres.|Поезд отправляется с третьего пути.|travel|
conejo|кролик|Tienen un conejo como mascota.|У них живёт кролик.|daily|
título|название; титул|¿Cómo se llama el título de la canción?|Как называется эта песня?|friends|
sopa|суп|La sopa del día es de pescado.|Суп дня — рыбный.|travel|
camarero|официант|El camarero nos trajo la carta.|Официант принёс нам меню.|travel|
nube|облако|No hay ni una nube en el cielo.|На небе ни облачка.|travel|
comportamiento|поведение|Su comportamiento nos sorprendió.|Его поведение нас удивило.|friends|
desierto|пустыня|Cruzamos el desierto en coche.|Мы пересекли пустыню на машине.|travel|
deporte|спорт|¿Qué deporte practicas?|Каким спортом ты занимаешься?|friends|
generación|поколение|Tres generaciones viven en esta casa.|В этом доме живут три поколения.|friends|
oreja|ухо|Me duelen las orejas en el avión.|В самолёте у меня болят уши.|travel|
tráfico|движение, пробки|Había mucho tráfico en la carretera.|На дороге были большие пробки.|travel|np
león|лев|Vimos un león en el zoo.|В зоопарке мы видели льва.|travel|
término|термин; срок|¿Qué significa este término?|Что значит этот термин?|it|
azúcar|сахар|¿Quieres azúcar en el té?|Тебе сахар в чай?|friends|np
pastilla|таблетка|Toma una pastilla después de cenar.|Принимай по таблетке после ужина.|daily|
beneficio|выгода, польза|El mayor beneficio es el precio bajo.|Главная выгода — низкая цена.|it|
preocupación|беспокойство|Mi mayor preocupación es el tiempo.|Мое главное беспокойство — погода.|travel|
herida|рана|La herida ya está curada.|Рана уже зажила.|daily|
miel|мёд|Té con miel, por favor.|Чай с мёдом, пожалуйста.|friends|np
guerrero|воин|La estatua representa a un guerrero antiguo.|Статуя изображает древнего воина.|travel|
curiosidad|любопытство|Lo pregunto por curiosidad.|Спрашиваю из любопытства.|friends|
círculo|круг|Nos sentamos en círculo.|Мы сели в круг.|friends|
paciencia|терпение|Ten paciencia, el tren llegará.|Имей терпение, поезд придёт.|travel|np
crisis|кризис|Pasamos por una crisis pequeña.|Мы переживаем небольшой кризис.|daily|
ejercicio|упражнение|Haz estos ejercicios cada día.|Делай эти упражнения каждый день.|daily|
consecuencia|последствие|La lluvia tuvo consecuencias graves.|У дождя были серьёзные последствия.|travel|
audiencia|аудитория|La audiencia aplaudió mucho.|Зрители много аплодировали.|friends|
desafío|вызов|Aprender dos idiomas es un desafío.|Учить два языка — это вызов.|daily|
océano|океан|Cruzamos el océano en barco.|Мы пересекли океан на корабле.|travel|
actitud|отношение|Me gusta su actitud positiva.|Мне нравится его позитивный настрой.|friends|
puerto|порт|El barco llega al puerto a las diez.|Корабль прибывает в порт в десять.|travel|
escritorio|рабочий стол|Dejé el portátil en el escritorio.|Я оставил ноутбук на рабочем столе.|it|
frase|фраза, предложение|Traduce esta frase al inglés.|Переведи это предложение на английский.|daily|
terreno|участок, местность|Compraron un terreno cerca del mar.|Они купили участок у моря.|daily|
virus|вирус|El virus infectó el ordenador.|Вирус заразил компьютер.|it|
orgullo|гордость|Siento orgullo por ti.|Я горжусь тобой.|friends|np
distrito|район, округ|El hotel está en el distrito histórico.|Отель находится в историческом районе.|travel|
sofá|диван|Puedes dormir en el sofá.|Ты можешь спать на диване.|friends|
organización|организация|La organización del evento fue excelente.|Организация мероприятия была отличной.|friends|
pasión|страсть|La música es mi pasión.|Музыка — моя страсть.|friends|
incidente|инцидент|Hubo un incidente en el aeropuerto.|В аэропорту произошёл инцидент.|travel|
castigo|наказание|El castigo fue justo.|Наказание было справедливым.|daily|
pavo|индейка|Cenamos pavo en Navidad.|На Рождество мы ужинаем индейкой.|friends|
sacerdote|священник|El sacerdote bendijo a los novios.|Священник благословил молодожёнов.|friends|
barra|барная стойка; батон|Nos sentamos en la barra del bar.|Мы сели у барной стойки.|friends|
casualidad|случайность|¡Qué casualidad verte aquí!|Какая случайность — увидеть тебя здесь!|friends|
lágrima|слеза|Le cayó una lágrima.|У него скатилась слеза.|friends|
dragón|дракон|En la leyenda hay un dragón.|В легенде есть дракон.|friends|
garganta|горло|Me duele la garganta.|У меня болит горло.|daily|
experimento|эксперимент|Hicimos un pequeño experimento.|Мы провели небольшой эксперимент.|it|
veneno|яд|Esa planta tiene veneno.|У этого растения ядовитый сок.|travel|
humo|дым|Había mucho humo en la cocina.|На кухне было много дыма.|daily|np
comentario|комментарий|Deja un comentario debajo de la foto.|Оставь комментарий под фото.|friends|
muro|стена|El muro es muy antiguo.|Стена очень старая.|travel|
recurso|ресурс|Cada recurso se carga una vez.|Каждый ресурс загружается один раз.|it|
excusa|отговорка|No pongas excusas.|Не придумывай отговорки.|friends|
cartero|почтальон|El cartero llega a las diez.|Почтальон приходит в десять.|daily|
costumbre|привычка, обычай|Leer antes de dormir es una buena costumbre.|Читать перед сном — хорошая привычка.|daily|
competencia|конкуренция; компетенция|Hay mucha competencia en el sector.|В отрасли большая конкуренция.|it|
moto|мотоцикл|Alquilamos una moto en la isla.|Мы взяли мотоцикл напрокат на острове.|travel|
reacción|реакция|Su reacción nos hizo reír.|Его реакция нас рассмешила.|friends|
biblioteca|библиотека|La biblioteca cierra a las ocho.|Библиотека закрывается в восемь.|daily|
subtítulo|субтитр|Pon los subtítulos, por favor.|Включи субтитры, пожалуйста.|friends|
transporte|транспорт|El transporte público es barato.|Общественный транспорт недорогой.|travel|np
demanda|спрос; иск|Hay mucha demanda en verano.|Летом большой спрос.|travel|
comité|комитет|El comité eligió al ganador.|Комитет выбрал победителя.|it|
deseo|желание|¡Pide un deseo!|Загадай желание!|friends|
cultura|культура|Me encanta conocer otras culturas.|Люблю узнавать о других культурах.|travel|
primavera|весна|La primavera es la mejor época para viajar.|Весна — лучшее время для поездок.|travel|
instrucción|инструкция|Lee las instrucciones con cuidado.|Внимательно прочитай инструкции.|it|
reputación|репутация|El restaurante tiene buena reputación.|У ресторана хорошая репутация.|travel|
robot|робот|El robot sirve el café.|Робот подаёт кофе.|it|pl=robots
jueves|четверг|El jueves tengo clase de inglés.|В четверг у меня урок английского.|daily|
patio|двор|Los niños juegan en el patio.|Дети играют во дворе.|friends|
pedazo|кусок|¿Quieres un pedazo de pastel?|Хочешь кусочек торта?|friends|
colina|холм|Subimos a la colina al atardecer.|Мы поднялись на холм на закате.|travel|
ambiente|атмосфера; среда|El ambiente del local es muy agradable.|Атмосфера в заведении очень приятная.|friends|
martes|вторник|El martes salimos temprano.|Во вторник мы выезжаем рано.|travel|
cinturón|ремень|Abróchese el cinturón, por favor.|Пристегните ремень, пожалуйста.|travel|
cierre|закрытие; молния|El cierre del museo es a las siete.|Музей закрывается в семь.|travel|
metal|металл|El detector encontró algo de metal.|Детектор нашёл что-то металлическое.|travel|
socorro|помощь|¡Socorro! ¡Necesito ayuda!|На помощь! Мне нужна помощь!|travel|
rescate|спасение|El rescate duró dos horas.|Спасение заняло два часа.|travel|
templo|храм|Visitamos un templo antiguo.|Мы посетили древний храм.|travel|
bandera|флаг|La bandera es roja y amarilla.|Флаг красно-жёлтый.|travel|
pasta|паста; тесто|Hoy cenamos pasta.|Сегодня мы ужинаем пастой.|friends|np
bicicleta|велосипед|Alquilamos bicicletas por un día.|Мы взяли велосипеды напрокат на день.|travel|
plano|план, карта города|¿Tiene un plano de la ciudad?|У вас есть план города?|travel|
túnel|туннель|El tren pasa por un túnel largo.|Поезд проезжает через длинный туннель.|travel|
guía|гид; путеводитель|La guía habla tres idiomas.|Гид говорит на трёх языках.|travel|
territorio|территория|Este territorio es muy bonito.|Эта территория очень красива.|travel|
queja|жалоба|Quiero presentar una queja.|Хочу подать жалобу.|travel|
museo|музей|El museo abre a las diez.|Музей открывается в десять.|travel|
superficie|поверхность|La superficie del lago estaba tranquila.|Гладь озера была спокойной.|travel|
discusión|спор; обсуждение|Tuvimos una discusión sobre el plan.|У нас был спор о плане.|friends|
actuación|выступление|La actuación fue espectacular.|Выступление было потрясающим.|friends|
almacén|склад|El almacén está lleno.|Склад заполнен.|it|
helicóptero|вертолёт|Un helicóptero sobrevuela la playa.|Вертолёт летит над пляжем.|travel|
leyenda|легенда|Hay una leyenda sobre este castillo.|Об этом замке ходит легенда.|travel|
dormitorio|спальня|El apartamento tiene dos dormitorios.|В квартире две спальни.|travel|
punta|кончик|Estoy en la punta de la isla.|Я на оконечности острова.|travel|
payaso|клоун|El payaso hizo reír a los niños.|Клоун рассмешил детей.|friends|
signo|знак|Pon un signo de interrogación.|Поставь вопросительный знак.|daily|
máscara|маска|Compré una máscara en el mercado.|Я купил маску на рынке.|travel|
impuesto|налог|El precio incluye el impuesto.|В цену входит налог.|travel|
refugio|убежище, приют|Dormimos en un refugio de montaña.|Мы ночевали в горном приюте.|travel|
tono|тон|No me gusta su tono.|Мне не нравится его тон.|friends|
raza|порода; раса|¿De qué raza es tu perro?|Какой породы твоя собака?|daily|
periódico|газета|Mi padre lee el periódico cada mañana.|Мой отец читает газету каждое утро.|daily|
vídeo|видео|Grabé un vídeo de la fiesta.|Я снял видео вечеринки.|friends|
cazador|охотник|El cazador vivía en la montaña.|Охотник жил в горах.|daily|
división|деление, разделение|La división de la cuenta es fácil.|Разделить счёт просто.|friends|
encanto|очарование|El pueblo tiene mucho encanto.|У деревни много очарования.|travel|
sabor|вкус|Esta sopa tiene un sabor raro.|У этого супа странный вкус.|friends|
chef|шеф-повар|El chef cocina muy bien.|Шеф-повар очень хорошо готовит.|friends|
bola|шар|La bola rodó bajo la mesa.|Шар закатился под стол.|friends|
depósito|депозит; бак|Pagamos un depósito por la habitación.|Мы внесли депозит за номер.|travel|
grabación|запись|La grabación del concierto es muy buena.|Запись концерта очень хорошая.|friends|
capacidad|способность; вместимость|La sala tiene capacidad para cien personas.|Зал вмещает сто человек.|friends|
collar|ожерелье; ошейник|Le regalé un collar.|Я подарил ей ожерелье.|friends|
norma|норма, правило|Es una norma de la casa.|Это правило дома.|travel|
método|метод|Este método funciona bien.|Этот метод хорошо работает.|it|
fantasía|фантазия|La película es pura fantasía.|Фильм — чистая фантазия.|friends|
fiebre|температура, лихорадка|Tengo fiebre desde ayer.|У меня температура со вчерашнего дня.|daily|
extranjero|иностранец; заграница|Vivimos en el extranjero.|Мы живём за границей.|travel|
guante|перчатка|Perdí un guante en el tren.|Я потерял перчатку в поезде.|travel|
invitación|приглашение|Gracias por la invitación.|Спасибо за приглашение.|friends|
ceremonia|церемония|La ceremonia empieza al mediodía.|Церемония начинается в полдень.|friends|
masa|тесто; масса|Prepara la masa para la pizza.|Приготовь тесто для пиццы.|friends|
expediente|досье, дело|Guardo el expediente en una carpeta.|Я храню дело в папке.|it|
arreglo|ремонт; договорённость|Hicimos un arreglo con el dueño.|Мы договорились с владельцем.|travel|
camiseta|футболка|Compré una camiseta del festival.|Я купил футболку фестиваля.|friends|
rehén|заложник|En la película hay un rehén.|В фильме есть заложник.|friends|
''', 'es', 'noun')
