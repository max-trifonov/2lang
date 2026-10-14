# ИИ-черновик (D-25): испанские глаголы партии 4 (LNG-S1-032) — остаток каркаса. Запись — dsl.py:
# теги ie / ue / i / ie-i / ue-u (чередование), zco, jo, uy, ey, uml, yo=, pres=, pret=, ger=, part=.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
casar|женить, поженить; casarse — пожениться|Mis amigos se casan en junio.|Мои друзья женятся в июне.|friends|
encantar|очаровывать; нравиться очень (me encanta)|Me encanta este café.|Мне очень нравится это кафе.|friends|
detener|останавливать; задерживать|El autobús se detiene en la plaza.|Автобус останавливается на площади.|travel|pres=detengo,detienes,detiene,detenemos,detenéis,detienen pret=detuve,detuviste,detuvo,detuvimos,detuvisteis,detuvieron
subir|подниматься, подниматься (в транспорт)|Subimos al tren a las nueve.|Мы сели в поезд в девять.|travel|
quitar|убирать, снимать|¿Puedes quitar las maletas de la silla?|Можешь убрать чемоданы со стула?|travel|
sonar|звучать; звонить|Mi móvil suena a las seis.|Мой телефон звонит в шесть.|daily|ue
salvar|спасать; сохранять|Salva el archivo antes de salir.|Сохрани файл перед выходом.|it|
coger|брать; ловить (транспорт, Испания)|Vamos a coger el tren de las diez.|Мы поедем на поезде в десять.|travel|jo|В Латинской Америке coger может быть грубым — там говорят tomar
faltar|не хватать; отсутствовать|Falta una silla en la mesa.|За столом не хватает стула.|friends|
aceptar|принимать, соглашаться|¿Aceptan tarjetas de crédito?|Вы принимаете кредитные карты?|travel|
prometer|обещать|Te prometo que llego a tiempo.|Обещаю, что приеду вовремя.|friends|
beber|пить|¿Qué quieres beber?|Что хочешь выпить?|friends|
confiar|доверять|Confío en mis amigos.|Я доверяю своим друзьям.|friends|pres=confío,confías,confía,confiamos,confiáis,confían
cuidar|заботиться, присматривать|¿Puedes cuidar mi maleta un momento?|Можешь присмотреть за моим чемоданом минутку?|travel|
convertir|превращать; обращать|El sofá se convierte en cama.|Диван превращается в кровать.|travel|ie-i
aprender|учить, выучить|Aprendo español y inglés.|Я учу испанский и английский.|daily|
imaginar|воображать|Imagina vivir junto al mar.|Представь, что живёшь у моря.|daily|
molestar|беспокоить, мешать|¿Le molesta si abro la ventana?|Вам не помешает, если я открою окно?|travel|
servir|подавать; служить; пригождаться|El desayuno se sirve hasta las diez.|Завтрак подают до десяти.|travel|i
levantar|поднимать; levantarse — вставать|Me levanto a las siete.|Я встаю в семь.|daily|
vender|продавать|Aquí venden entradas.|Здесь продают билеты.|travel|
andar|ходить, идти; работать (о механизме)|Anduvimos por el centro toda la tarde.|Мы гуляли по центру весь вечер.|travel|pret=anduve,anduviste,anduvo,anduvimos,anduvisteis,anduvieron
romper|ломать, разбивать|Rompí el vaso sin querer.|Я случайно разбил стакан.|friends|part=roto
asegurar|уверять; обеспечивать|Te aseguro que es seguro.|Уверяю тебя, это безопасно.|travel|
cerrar|закрывать|La tienda cierra a las nueve.|Магазин закрывается в девять.|daily|ie
decidir|решать|Decidimos ir en tren.|Мы решили поехать на поезде.|travel|
preparar|готовить, подготавливать|Preparo la cena para todos.|Я готовлю ужин для всех.|friends|
enseñar|учить (кого-то); показывать|Mi hermana enseña español.|Моя сестра преподаёт испанский.|daily|
alegrar|радовать; alegrarse — радоваться|Me alegro de verte.|Рад тебя видеть.|friends|
tirar|бросать; тянуть|Tira de la puerta, no empujes.|Тяни дверь, не толкай.|daily|
bajar|спускаться; скачивать|Bajo la app antes del viaje.|Я скачиваю приложение перед поездкой.|it|
despertar|будить; despertarse — просыпаться|Me despierto a las seis.|Я просыпаюсь в шесть.|daily|ie
explicar|объяснять|¿Puedes explicar el mapa?|Можешь объяснить карту?|travel|
bastar|быть достаточным|Basta con un billete.|Достаточно одного билета.|travel|
referir|рассказывать; referirse — иметь в виду|Me refiero al hotel de ayer.|Я имею в виду вчерашний отель.|daily|ie-i
presentar|представлять; знакомить|Te presento a mi amiga Laura.|Знакомься, моя подруга Лаура.|friends|
arreglar|чинить; приводить в порядок|Arreglan la calle esta semana.|На этой неделе чинят улицу.|travel|
descubrir|открывать, обнаруживать|Descubrimos un café precioso.|Мы открыли для себя прекрасное кафе.|travel|part=descubierto
llorar|плакать|El niño lloró en el avión.|Малыш плакал в самолёте.|travel|
existir|существовать|Esa función no existe todavía.|Такой функции пока нет.|it|
proteger|защищать|Usa una contraseña para proteger tu cuenta.|Используй пароль, чтобы защитить аккаунт.|it|jo
temer|бояться|Temo que llegamos tarde.|Боюсь, мы опоздаем.|travel|
parar|останавливать(ся)|El tren no para aquí.|Поезд здесь не останавливается.|travel|
escapar|убегать, спасаться|El gato escapó por la ventana.|Кот убежал через окно.|daily|
mentir|лгать|No quiero mentirte.|Не хочу тебе лгать.|friends|ie-i
responder|отвечать|¿Puedes responder al mensaje?|Можешь ответить на сообщение?|friends|
aparecer|появляться|Un mensaje aparece en la pantalla.|На экране появляется сообщение.|it|zco
lograr|добиваться; удаваться|Logramos llegar a tiempo.|Нам удалось приехать вовремя.|travel|
volar|лететь, летать|Volamos a Madrid el viernes.|В пятницу мы летим в Мадрид.|travel|ue
caminar|ходить пешком|Caminamos hasta la playa.|Мы дошли до пляжа пешком.|travel|
golpear|ударять, стучать|Alguien golpea la puerta.|Кто-то стучит в дверь.|daily|
continuar|продолжать|Continuamos después de comer.|Продолжим после обеда.|it|pres=continúo,continúas,continúa,continuamos,continuáis,continúan
bailar|танцевать|Bailamos toda la noche.|Мы танцевали всю ночь.|friends|
cantar|петь|Mi amigo canta muy bien.|Мой друг очень хорошо поёт.|friends|
conducir|водить (машину)|Conduce con cuidado, por favor.|Води осторожно, пожалуйста.|travel|zco pret=conduje,condujiste,condujo,condujimos,condujisteis,condujeron
preferir|предпочитать|Prefiero el té al café.|Я предпочитаю чай кофе.|friends|ie-i
acercar|приближать; acercarse — подходить|El tren se acerca a la estación.|Поезд приближается к станции.|travel|
soler|обычно делать (soler + инф.)|Suelo desayunar a las ocho.|Обычно я завтракаю в восемь.|daily|ue|Только в настоящем и прошедшем: suelo + инфинитив
atrapar|ловить, поймать|Atrapé el último autobús.|Я успел на последний автобус.|travel|
desaparecer|исчезать|Mis archivos desaparecieron.|Мои файлы исчезли.|it|zco
averiguar|выяснять|Voy a averiguar el horario.|Пойду выясню расписание.|travel|uml
actuar|действовать; играть (в театре)|Hay que actuar rápido.|Нужно действовать быстро.|it|pres=actúo,actúas,actúa,actuamos,actuáis,actúan
devolver|возвращать (вещь)|Quiero devolver este pantalón.|Хочу вернуть эти брюки.|travel|ue part=devuelto
obtener|получать, добиваться|¿Dónde puedo obtener el billete?|Где можно получить билет?|travel|pres=obtengo,obtienes,obtiene,obtenemos,obtenéis,obtienen pret=obtuve,obtuviste,obtuvo,obtuvimos,obtuvisteis,obtuvieron
ofrecer|предлагать|Nos ofrecieron un café gratis.|Нам предложили бесплатный кофе.|travel|zco
comprender|понимать|No comprendo la pregunta.|Я не понимаю вопрос.|daily|
luchar|бороться|Luchamos por un buen precio.|Мы боролись за хорошую цену.|travel|
merecer|заслуживать|Te mereces unas vacaciones.|Ты заслуживаешь отпуска.|friends|zco
evitar|избегать|Vamos a evitar la hora punta.|Давай избежим часа пик.|travel|
odiar|ненавидеть|Odio esperar en el aeropuerto.|Терпеть не могу ждать в аэропорту.|travel|
pelear|драться, ссориться|Los niños pelean por el juguete.|Дети ссорятся из-за игрушки.|friends|
esconder|прятать|Escondí el regalo en el armario.|Я спрятал подарок в шкафу.|friends|
recoger|забирать; собирать|Recojo las llaves en la recepción.|Я забираю ключи на ресепшене.|travel|jo
marchar|идти; marcharse — уходить|Nos marchamos mañana.|Мы уезжаем завтра.|travel|
elegir|выбирать|¿Qué eliges: pasta o pescado?|Что выбираешь: пасту или рыбу?|friends|i yo=elijo
recuperar|восстанавливать; возвращать|Recuperé mi maleta ayer.|Я вернул свой чемодан вчера.|travel|
destruir|разрушать|La tormenta destruyó el muelle.|Шторм разрушил пирс.|travel|uy
soltar|отпускать, выпускать|Suelta la cuerda despacio.|Отпусти верёвку медленно.|travel|ue
cortar|резать|¿Puedes cortar la tarta?|Можешь разрезать торт?|friends|
respetar|уважать, соблюдать|Hay que respetar las normas.|Нужно соблюдать правила.|travel|
reír|смеяться|Nos reímos mucho en la cena.|Мы много смеялись за ужином.|friends|pres=río,ríes,ríe,reímos,reís,ríen pret=reí,reíste,rio,reímos,reísteis,rieron ger=riendo part=reído
agradecer|благодарить|Te agradezco la invitación.|Благодарю за приглашение.|friends|zco
considerar|считать; рассматривать|Considero que es una buena idea.|Я считаю, что это хорошая идея.|daily|
bromear|шутить|Estoy bromeando, tranquilo.|Я шучу, не волнуйся.|friends|
dirigir|руководить; направлять|Ana dirige un equipo de diseño.|Ана руководит командой дизайнеров.|it|jo
calmar|успокаивать|La música me calma.|Музыка меня успокаивает.|daily|
ocupar|занимать|Esta mesa está ocupada.|Этот столик занят.|friends|
asustar|пугать|El trueno asustó a los niños.|Гром напугал детей.|travel|
disfrutar|наслаждаться|Disfrutamos mucho del viaje.|Мы очень насладились поездкой.|travel|
revisar|проверять, просматривать|Voy a revisar el código esta tarde.|Я проверю код сегодня днём.|it|
resultar|оказываться|El hotel resultó muy cómodo.|Отель оказался очень удобным.|travel|
mandar|посылать; приказывать|Te mando la foto por correo.|Пришлю тебе фото по почте.|friends|
crecer|расти|La empresa crece cada año.|Компания растёт каждый год.|it|zco
gritar|кричать|No me gusta gritar en la calle.|Не люблю кричать на улице.|friends|
atacar|нападать; атаковать|Atacaron el servidor anoche.|Сервер атаковали прошлой ночью.|it|
invitar|приглашать|Os invito a cenar.|Приглашаю вас на ужин.|friends|
despedir|провожать; увольнять; despedirse — прощаться|Nos despedimos en la estación.|Мы попрощались на вокзале.|travel|i
divertir|развлекать; divertirse — веселиться|Nos divertimos mucho ayer.|Вчера мы очень весело провели время.|friends|ie-i
engañar|обманывать|Me engañaron con el precio.|Меня обманули с ценой.|travel|
costar|стоить|¿Cuánto cuesta el billete?|Сколько стоит билет?|travel|ue
oler|пахнуть; чувствовать запах|La cocina huele muy bien.|На кухне чудесно пахнет.|friends|pres=huelo,hueles,huele,olemos,oléis,huelen ger=oliendo
acordar|договариваться; acordarse — помнить|Acordamos vernos a las ocho.|Мы договорились увидеться в восемь.|friends|ue
controlar|контролировать|El guarda controla los billetes.|Контролёр проверяет билеты.|travel|
manejar|управлять; водить (Лат. Америка)|¿Sabes manejar este programa?|Ты умеешь работать с этой программой?|it|
alejar|удалять, отдалять|Nos alejamos del grupo sin querer.|Мы случайно отдалились от группы.|travel|
utilizar|использовать|¿Puedo utilizar su teléfono?|Можно воспользоваться вашим телефоном?|travel|
besar|целовать|Se besaron en la estación.|Они поцеловались на вокзале.|friends|
reconocer|узнавать; признавать|No te reconocí con ese sombrero.|Я не узнал тебя в этой шляпе.|friends|zco
limpiar|чистить, убирать|Limpiamos la casa antes de la fiesta.|Мы убрали дом перед вечеринкой.|friends|
cenar|ужинать|¿Dónde cenamos esta noche?|Где поужинаем сегодня вечером?|friends|
abandonar|покидать, бросать|Abandonaron el plan original.|Они отказались от первоначального плана.|it|
respirar|дышать|Respira hondo y relájate.|Вдохни поглубже и расслабься.|daily|
reunir|собирать; reunirse — встречаться|Nos reunimos a las ocho.|Мы встречаемся в восемь.|friends|pres=reúno,reúnes,reúne,reunimos,reunís,reúnen
unir|соединять|La música nos une.|Музыка нас объединяет.|friends|
doler|болеть|Me duele la cabeza.|У меня болит голова.|daily|ue
entregar|вручать, сдавать|Entregué el pasaporte en la recepción.|Я отдал паспорт на ресепшене.|travel|
encargar|заказывать; поручать|Encargo una pizza para todos.|Заказываю пиццу на всех.|friends|
partir|отправляться; делить|El tren parte a las ocho.|Поезд отправляется в восемь.|travel|
interesar|интересовать|Me interesa la música española.|Меня интересует испанская музыка.|friends|
sufrir|страдать|Sufro de dolor de espalda.|Я страдаю от боли в спине.|daily|
agarrar|хватать, брать|Agarra mi mano.|Держись за мою руку.|travel|
nacer|рождаться|Nací en Moscú.|Я родился в Москве.|daily|zco
huir|убегать, спасаться|Huimos de la lluvia.|Мы бежали от дождя.|travel|uy
discutir|спорить; обсуждать|Discutimos el plan en la reunión.|Мы обсудили план на встрече.|it|
sobrevivir|выживать|Mi viejo portátil sobrevivió al viaje.|Мой старый ноутбук пережил поездку.|travel|
descansar|отдыхать|Descansamos una hora en el parque.|Мы час отдыхали в парке.|travel|
acostar|укладывать; acostarse — ложиться спать|Me acuesto a las once.|Я ложусь спать в одиннадцать.|daily|ue
compartir|делить, делиться|¿Compartimos un taxi?|Возьмём одно такси на двоих?|travel|
asesinar|убивать|En la novela asesinan a un rey.|В романе убивают короля.|friends|
estudiar|учиться, изучать|Estudio español todas las noches.|Я учу испанский каждый вечер.|daily|
demostrar|доказывать; показывать|Esto demuestra que el plan funciona.|Это доказывает, что план работает.|it|ue
construir|строить|Construyen un puente nuevo.|Строят новый мост.|travel|uy
acompañar|сопровождать|¿Te acompaño al hotel?|Проводить тебя до отеля?|friends|
cumplir|исполнять; cumplir años — праздновать день рождения|Mi hermana cumple treinta años.|Моей сестре исполняется тридцать.|friends|
callar|молчать|Calla un momento, escucha.|Помолчи минутку, послушай.|friends|
equivocar|ошибаться (equivocarse)|Me equivoqué de tren.|Я сел не на тот поезд.|travel|
arruinar|портить, разорять|La lluvia arruinó el picnic.|Дождь испортил пикник.|friends|
viajar|путешествовать|Viajamos mucho en verano.|Летом мы много путешествуем.|travel|
mencionar|упоминать|¿Mencionó la hora?|Он упоминал время?|friends|
enterar|сообщать; enterarse — узнавать|Me enteré de la fiesta ayer.|Я узнал о вечеринке вчера.|friends|
resolver|решать (задачу)|Resolvimos el problema del billete.|Мы решили проблему с билетом.|travel|ue part=resuelto
pertenecer|принадлежать|Esta maleta pertenece a mi amigo.|Этот чемодан принадлежит моему другу.|friends|zco
enfrentar|сталкиваться, противостоять|Enfrentamos un problema con la reserva.|Мы столкнулись с проблемой с бронью.|travel|
aguantar|терпеть, выдерживать|No aguanto este calor.|Не выношу эту жару.|travel|
admitir|признавать; допускать|Admito que me equivoqué.|Признаю, я ошибся.|friends|
avisar|предупреждать, сообщать|Te aviso cuando llego al hotel.|Сообщу тебе, когда приеду в отель.|friends|
pegar|бить; клеить|Pega la etiqueta en la maleta.|Приклей бирку на чемодан.|travel|
cubrir|покрывать|El seguro cubre el equipaje.|Страховка покрывает багаж.|travel|part=cubierto
negar|отрицать|Él lo niega todo.|Он всё отрицает.|friends|ie
sorprender|удивлять|Me sorprende el precio.|Цена меня удивляет.|travel|
vigilar|наблюдать, присматривать|Vigila las maletas, por favor.|Присмотри за чемоданами, пожалуйста.|travel|
soportar|выносить, терпеть|No soporto el ruido.|Не выношу шум.|travel|
depender|зависеть|Depende del tiempo.|Это зависит от погоды.|friends|
visitar|посещать|Visitamos a mis abuelos los domingos.|По воскресеньям мы навещаем бабушку и дедушку.|friends|
investigar|исследовать, расследовать|Investigo el problema desde ayer.|Я разбираюсь с проблемой со вчерашнего дня.|it|
saltar|прыгать|Los niños saltan en la piscina.|Дети прыгают в бассейн.|travel|
ordenar|приводить в порядок; приказывать|Voy a ordenar mis archivos.|Наведу порядок в своих файлах.|it|
apagar|выключать; гасить|Apaga las luces, por favor.|Выключи свет, пожалуйста.|daily|
relajar|расслаблять|Nos relajamos en la playa.|Мы расслабились на пляже.|travel|
causar|вызывать, причинять|El cambio causó un error.|Изменение вызвало ошибку.|it|
retirar|убирать; снимать (деньги)|Voy a retirar dinero del cajero.|Я сниму деньги в банкомате.|travel|
pasear|гулять|Paseamos por el centro después de cenar.|После ужина мы гуляли по центру.|friends|
vengar|мстить|El héroe quiere vengar a su padre.|Герой хочет отомстить за отца.|friends|
mudar|менять; mudarse — переезжать|Nos mudamos a Valencia en 2019.|Мы переехали в Валенсию в 2019 году.|daily|
hallar|находить|Hallamos un hotel barato.|Мы нашли недорогой отель.|travel|
sugerir|предлагать, советовать|Sugiero tomar un taxi.|Предлагаю взять такси.|travel|ie-i
cometer|совершать (ошибку)|Cometí un error en la reserva.|Я допустил ошибку в брони.|travel|
repetir|повторять|¿Puede repetir, por favor?|Можете повторить, пожалуйста?|daily|i
cruzar|пересекать|Cruza el puente y gira a la izquierda.|Перейди мост и поверни налево.|travel|
fallar|подводить; давать сбой|El servidor falló otra vez.|Сервер опять дал сбой.|it|
apostar|ставить, держать пари|Apuesto a que llueve mañana.|Спорим, завтра будет дождь.|friends|ue
contestar|отвечать|Contesta el teléfono, por favor.|Ответь на звонок, пожалуйста.|daily|
permanecer|оставаться|Los pasajeros permanecen sentados.|Пассажиры остаются на местах.|travel|zco
largar|отпускать; убираться|Largo el equipaje en la habitación.|Оставляю багаж в номере.|travel|
atrever|осмеливаться (atreverse)|No me atrevo a preguntarle.|Не решаюсь его спросить.|friends|
convencer|убеждать|Me convenciste de quedarnos.|Ты убедил меня остаться.|friends|yo=convenzo
quemar|жечь|Quemé las tostadas otra vez.|Я опять сжёг тосты.|daily|
separar|разделять|Separamos las maletas por tamaño.|Мы разделили чемоданы по размеру.|travel|
contratar|нанимать; заключать (услугу)|Contratamos un guía local.|Мы наняли местного гида.|travel|
observar|наблюдать|Observamos las estrellas desde el tejado.|Мы смотрели на звёзды с крыши.|friends|
tardar|задерживаться; занимать (время)|El tren tarda dos horas.|Поезд идёт два часа.|travel|
lastimar|ранить, причинять боль|Me lastimé el pie en la montaña.|Я поранил ногу в горах.|travel|
adivinar|угадывать|¿Puedes adivinar mi edad?|Угадаешь мой возраст?|friends|
comprobar|проверять|Comprueba que tienes el pasaporte.|Проверь, что у тебя есть паспорт.|travel|ue
firmar|подписывать|Firmo el contrato mañana.|Завтра я подпишу контракт.|travel|
planear|планировать|Planeamos viajar en agosto.|Мы планируем поехать в августе.|travel|
deshacer|разбирать; отменять|Deshago la maleta en el hotel.|Я разбираю чемодан в отеле.|travel|pres=deshago,deshaces,deshace,deshacemos,deshacéis,deshacen pret=deshice,deshiciste,deshizo,deshicimos,deshicisteis,deshicieron part=deshecho
defender|защищать|Defiendo mi opinión.|Я отстаиваю своё мнение.|friends|ie
dudar|сомневаться|Dudo que lleguen a tiempo.|Сомневаюсь, что они приедут вовремя.|friends|
superar|превосходить; преодолевать|Superamos el reto juntos.|Мы вместе преодолели испытание.|friends|
enfermar|заболевать|Enfermé el primer día del viaje.|Я заболел в первый день поездки.|travel|
lavar|мыть|Lavo la ropa los domingos.|Я стираю по воскресеньям.|daily|
liberar|освобождать|Liberan la habitación a las doce.|Номер освобождают в двенадцать.|travel|
celebrar|праздновать|Celebramos su cumpleaños el sábado.|Мы празднуем его день рождения в субботу.|friends|
colgar|вешать; класть трубку|Cuelga el abrigo en la percha.|Повесь пальто на вешалку.|daily|ue
notar|замечать|¿Notaste el cambio de horario?|Ты заметил изменение расписания?|travel|
alcanzar|достигать; успевать|No alcanzamos el último tren.|Мы не успели на последний поезд.|travel|
lanzar|бросать; запускать|Lanzamos la nueva versión el lunes.|Мы запускаем новую версию в понедельник.|it|
arrestar|арестовывать|La policía arrestó a dos hombres.|Полиция арестовала двух человек.|daily|
informar|сообщать, информировать|Nos informaron del retraso.|Нас предупредили о задержке.|travel|
perseguir|преследовать|El perro persigue la pelota.|Собака гоняется за мячом.|friends|i yo=persigo
soñar|мечтать; видеть сны|Sueño con vivir junto al mar.|Мечтаю жить у моря.|daily|ue
apoyar|поддерживать|Mis amigos me apoyan siempre.|Друзья всегда меня поддерживают.|friends|
mejorar|улучшать(ся)|El servicio mejoró mucho.|Сервис сильно улучшился.|travel|
cazar|охотиться|Mi abuelo cazaba en el monte.|Мой дедушка охотился в горах.|daily|
fingir|притворяться|Finjo que no lo sé.|Делаю вид, что не знаю.|friends|jo
ocultar|скрывать|No oculto mis planes.|Не скрываю свои планы.|friends|
encender|включать; зажигать|Enciende la luz, por favor.|Включи свет, пожалуйста.|daily|ie
juzgar|судить|No me gusta juzgar a la gente.|Не люблю судить о людях.|friends|
incluir|включать|El precio incluye el desayuno.|В цену входит завтрак.|travel|uy
culpar|винить|No te culpo por llegar tarde.|Я не виню тебя за опоздание.|friends|
formar|образовывать, формировать|Formamos un grupo pequeño.|Мы образовали небольшую группу.|friends|
adorar|обожать|Adoro este café.|Обожаю это кафе.|friends|
rendir|приносить результат; rendirse — сдаваться|El equipo rinde mejor por la mañana.|Команда лучше работает по утрам.|it|i
sonreír|улыбаться|Todos sonríen para la foto.|Все улыбаются для фото.|friends|pres=sonrío,sonríes,sonríe,sonreímos,sonreís,sonríen pret=sonreí,sonreíste,sonrió,sonreímos,sonreísteis,sonrieron ger=sonriendo part=sonreído
apuntar|записывать; указывать|Apunta mi número de teléfono.|Запиши мой номер телефона.|friends|
obligar|заставлять|La lluvia nos obligó a quedarnos.|Дождь заставил нас остаться.|friends|
fumar|курить|No se puede fumar en la habitación.|В номере курить нельзя.|travel|
prestar|одалживать|¿Me prestas tu cargador?|Одолжишь мне зарядку?|friends|
arriesgar|рисковать|No quiero arriesgar el viaje.|Не хочу рисковать поездкой.|travel|
fijar|закреплять; назначать|Fijamos la fecha de la fiesta.|Мы назначили дату вечеринки.|friends|
vestir|одевать; vestirse — одеваться|Me visto rápido por la mañana.|Утром я одеваюсь быстро.|daily|i
empujar|толкать|Empuja la puerta con cuidado.|Осторожно толкни дверь.|daily|
asumir|принимать на себя; предполагать|Asumo la responsabilidad del error.|Беру на себя ответственность за ошибку.|it|
confirmar|подтверждать|Voy a confirmar la reserva por correo.|Подтвержу бронь по почте.|travel|
escoger|выбирать|Escoge un postre, invito yo.|Выбери десерт, я угощаю.|friends|jo
montar|садиться (на лошадь, велосипед); собирать|Montamos en bici por el río.|Мы катались на велосипедах вдоль реки.|friends|
renunciar|отказываться; увольняться|Renunció a su trabajo el año pasado.|Он уволился в прошлом году.|it|
explotar|взрываться; эксплуатировать|El globo explotó en la fiesta.|Шарик лопнул на вечеринке.|friends|
cargar|нести; заряжать; загружать|La página tarda en cargar.|Страница долго загружается.|it|
durar|длиться|El concierto dura dos horas.|Концерт длится два часа.|friends|
atender|обслуживать, принимать|Nos atendieron muy bien.|Нас обслужили очень хорошо.|travel|ie
representar|представлять|Ana representa a la empresa.|Ана представляет компанию.|it|
gastar|тратить|Gastamos mucho en comida.|Мы много потратили на еду.|travel|
advertir|предупреждать|Nos advirtieron del tráfico.|Нас предупредили о пробках.|travel|ie-i
declarar|заявлять; декларировать|¿Tiene algo que declarar?|Вам есть что декларировать?|travel|
pretender|собираться; претендовать|Pretendo salir temprano.|Я намерен выехать рано.|travel|
colocar|размещать, класть|Coloca las maletas junto a la puerta.|Поставь чемоданы у двери.|travel|
sospechar|подозревать|Sospecho que la red falla.|Подозреваю, что сеть барахлит.|it|
rechazar|отвергать|La tienda rechazó mi tarjeta.|Магазин отклонил мою карту.|travel|
cocinar|готовить еду|¿Quién cocina esta noche?|Кто готовит сегодня?|friends|
votar|голосовать|Votamos por el restaurante.|Мы проголосовали за ресторан.|friends|
confesar|признаваться|Confieso que me comí el último trozo.|Признаюсь, я съел последний кусок.|friends|ie
grabar|записывать (на видео, аудио)|Grabé un vídeo del concierto.|Я снял видео концерта.|friends|
arrancar|запускать; срывать|El coche no arranca.|Машина не заводится.|travel|
llenar|наполнять|Llenamos el formulario en la recepción.|Мы заполнили форму на ресепшене.|travel|
insistir|настаивать|Insistió en pagar la cuenta.|Он настоял на том, чтобы заплатить.|friends|
saludar|здороваться|Saluda a tu familia de mi parte.|Передай привет своей семье.|friends|
apartar|отодвигать|Aparta la silla, por favor.|Отодвинь стул, пожалуйста.|friends|
extrañar|скучать (Лат. Америка); удивлять|Extraño a mis amigos.|Я скучаю по друзьям.|friends|
enamorar|влюблять; enamorarse — влюбляться|Me enamoré de esta ciudad.|Я влюбился в этот город.|travel|
realizar|осуществлять|Realizamos la reserva en línea.|Мы сделали бронь онлайн.|travel|
registrar|регистрировать|Voy a registrar la maleta.|Я зарегистрирую чемодан.|travel|
acusar|обвинять|Lo acusaron de mentir.|Его обвинили во лжи.|friends|
rezar|молиться|Mi abuela reza antes de comer.|Моя бабушка молится перед едой.|daily|
lucir|выглядеть; сиять|La plaza luce preciosa de noche.|Площадь ночью выглядит прекрасно.|travel|zco
parir|рожать|La gata parió cuatro gatitos.|Кошка родила четырёх котят.|daily|
traicionar|предавать|Nunca traiciono a mis amigos.|Я никогда не предаю друзей.|friends|
alimentar|кормить|¿Quién alimenta al gato?|Кто кормит кота?|daily|
inventar|изобретать; придумывать|Inventamos un juego nuevo.|Мы придумали новую игру.|friends|
practicar|практиковать; заниматься (спортом)|Practico español con mis colegas.|Я практикую испанский с коллегами.|daily|
sostener|держать, поддерживать|Sostengo la puerta para que pases.|Придерживаю дверь, чтобы ты прошёл.|travel|pres=sostengo,sostienes,sostiene,sostenemos,sostenéis,sostienen pret=sostuve,sostuviste,sostuvo,sostuvimos,sostuvisteis,sostuvieron
resistir|сопротивляться; выдерживать|No puedo resistir el chocolate.|Не могу устоять перед шоколадом.|friends|
rodar|катиться; снимать (фильм)|La pelota rueda por el parque.|Мяч катится по парку.|friends|ue
interrumpir|прерывать|Perdona, no quiero interrumpir.|Прости, не хочу перебивать.|friends|
encerrar|запирать|Me encerré fuera de la habitación.|Я захлопнул дверь снаружи.|travel|ie
concentrar|концентрировать (concentrarse)|No puedo concentrarme con este ruido.|Не могу сосредоточиться при таком шуме.|it|
enterrar|хоронить, закапывать|Enterraron un tesoro en la playa.|На пляже закопали клад.|travel|ie
ignorar|игнорировать|Ignora ese mensaje.|Игнорируй это сообщение.|it|
aprovechar|использовать, пользоваться|Hay que aprovechar el buen tiempo.|Надо пользоваться хорошей погодой.|travel|
contactar|связываться|Contacté con el hotel por correo.|Я связался с отелем по почте.|travel|
identificar|определять, опознавать|La app puede identificar canciones.|Приложение умеет определять песни.|it|
dedicar|посвящать|Dedico una hora al día al español.|Я трачу час в день на испанский.|daily|
eliminar|удалять, устранять|Elimina los archivos viejos.|Удали старые файлы.|it|
proponer|предлагать|Propongo ir al cine.|Предлагаю пойти в кино.|friends|pres=propongo,propones,propone,proponemos,proponéis,proponen pret=propuse,propusiste,propuso,propusimos,propusisteis,propusieron part=propuesto
apurar|торопить; apurarse — спешить|Me apuro, el tren sale ya.|Я спешу, поезд уже отправляется.|travel|
apestar|вонять|La cocina apesta a pescado.|На кухне воняет рыбой.|daily|
cobrar|брать плату; получать деньги|Cobran extra por la maleta.|За чемодан берут доплату.|travel|
opinar|иметь мнение, считать|¿Qué opinas del hotel?|Что думаешь об отеле?|friends|
afectar|влиять, затрагивать|La huelga afecta a todos los vuelos.|Забастовка затрагивает все рейсы.|travel|
herir|ранить|Se hirió la mano con el cuchillo.|Он порезал руку ножом.|daily|ie-i
atraer|привлекать|El festival atrae a miles de turistas.|Фестиваль привлекает тысячи туристов.|travel|pres=atraigo,atraes,atrae,atraemos,atraéis,atraen pret=atraje,atrajiste,atrajo,atrajimos,atrajisteis,atrajeron ger=atrayendo part=atraído
avanzar|продвигаться|El proyecto avanza bien.|Проект продвигается хорошо.|it|
pillar|схватить; застать|Nos pilló la lluvia.|Нас застал дождь.|travel|
publicar|публиковать|Publico las fotos esta noche.|Выложу фото сегодня вечером.|friends|
presionar|нажимать; давить|Presiona el botón verde.|Нажми зелёную кнопку.|it|
rastrear|отслеживать|Puedes rastrear el paquete en línea.|Посылку можно отслеживать онлайн.|it|
producir|производить|La fábrica produce bicicletas.|Фабрика производит велосипеды.|it|zco pret=produje,produjiste,produjo,produjimos,produjisteis,produjeron
comunicar|сообщать; связываться|Nos comunicaron el cambio de puerta.|Нам сообщили о смене выхода.|travel|
curar|лечить|La medicina cura la tos.|Лекарство лечит кашель.|daily|
provocar|вызывать, провоцировать|La lluvia provocó un retraso.|Дождь вызвал задержку.|travel|
comportar|вести себя (comportarse)|Los niños se comportan muy bien.|Дети ведут себя очень хорошо.|friends|
girar|поворачивать|Gira a la derecha en el semáforo.|На светофоре поверни направо.|travel|
organizar|организовывать|Organizo una cena para el sábado.|Организую ужин на субботу.|friends|
nadar|плавать|¿Se puede nadar en el lago?|В озере можно купаться?|travel|
ahorrar|экономить, копить|Ahorramos dinero para el viaje.|Мы копим деньги на поездку.|travel|
amenazar|угрожать|La tormenta amenaza la costa.|Шторм угрожает побережью.|travel|
describir|описывать|¿Puede describir su maleta?|Можете описать ваш чемодан?|travel|part=descrito
librar|освобождать|Libra tu agenda para el sábado.|Освободи субботу в расписании.|friends|
indicar|указывать|El letrero indica la salida.|Табличка указывает выход.|travel|
atravesar|пересекать|Atravesamos el túnel en diez minutos.|Мы проехали туннель за десять минут.|travel|ie
conectar|соединять; подключать|No puedo conectar al wifi.|Не могу подключиться к вайфаю.|it|
impedir|мешать; предотвращать|Un buen test impide muchos errores.|Хороший тест предотвращает много ошибок.|it|i
agradar|нравиться; быть приятным|Me agrada este barrio.|Мне нравится этот район.|travel|
morder|кусать|El perro muerde si lo molestas.|Собака кусается, если её дразнить.|daily|ue
arrastrar|тащить|Arrastra el archivo a la carpeta.|Перетащи файл в папку.|it|
pintar|красить, рисовать|Mi hermana pinta paisajes.|Моя сестра рисует пейзажи.|friends|
vencer|побеждать|Nuestro equipo venció por tres a uno.|Наша команда победила 3:1.|friends|yo=venzo
participar|участвовать|¿Participas en el concurso?|Ты участвуешь в конкурсе?|friends|
aumentar|увеличивать(ся)|Los precios aumentan en verano.|Летом цены растут.|travel|
contener|содержать|¿Este plato contiene nueces?|В этом блюде есть орехи?|travel|pres=contengo,contienes,contiene,contenemos,contenéis,contienen pret=contuve,contuviste,contuvo,contuvimos,contuvisteis,contuvieron
enojar|злить (enojarse — злиться)|Me enojo con el tráfico.|Я злюсь из-за пробок.|daily|
secuestrar|похищать|En la película secuestran a un niño.|В фильме похищают ребёнка.|friends|
capturar|захватывать; фиксировать|La foto captura todo el ambiente.|Фото передаёт всю атмосферу.|friends|
requerir|требовать|El viaje requiere un visado.|Для поездки нужна виза.|travel|ie-i
abrazar|обнимать|Nos abrazamos en la estación.|Мы обнялись на вокзале.|friends|
rodear|окружать|Las montañas rodean el hotel.|Отель окружён горами.|travel|
acostumbrar|приучать; acostumbrarse — привыкать|Me acostumbro al horario.|Я привыкаю к распорядку.|daily|
enfadar|сердить (enfadarse — сердиться)|Mi hermano se enfada por todo.|Мой брат сердится по любому поводу.|friends|
entrenar|тренировать(ся)|Entreno tres veces por semana.|Я тренируюсь три раза в неделю.|daily|
recompensar|награждать|Te voy a recompensar con un café.|Угощу тебя за это кофе.|friends|
retroceder|отступать, пятиться|El coche retrocede despacio.|Машина медленно сдаёт назад.|travel|
despachar|отправлять; обслуживать|Despachamos las maletas en el mostrador.|Мы сдали чемоданы на стойке.|travel|
patear|пинать|Los niños patean la pelota.|Дети пинают мяч.|friends|
iniciar|начинать; запускать|Inicia sesión con tu correo.|Войдите, используя свою почту.|it|
cancelar|отменять|Cancelamos el vuelo.|Мы отменили рейс.|travel|
operar|работать; оперировать|El ferry opera cada hora.|Паром ходит каждый час.|travel|
solicitar|запрашивать|Solicito una habitación tranquila.|Прошу тихий номер.|travel|
avergonzar|стыдить; avergonzarse — стыдиться|Me avergüenzo de mi error.|Мне стыдно за свою ошибку.|friends|pres=avergüenzo,avergüenzas,avergüenza,avergonzamos,avergonzáis,avergüenzan
contentar|радовать, удовлетворять|Es difícil contentar a todos.|Трудно угодить всем.|friends|
desarrollar|развивать; разрабатывать|Desarrollamos aplicaciones móviles.|Мы разрабатываем мобильные приложения.|it|
hundir|топить, погружать|El barco se hundió en el puerto.|Корабль затонул в порту.|travel|
interrogar|допрашивать|La policía interroga al testigo.|Полиция допрашивает свидетеля.|friends|
vomitar|тошнить|Vomité en el barco.|Меня стошнило на корабле.|travel|
arrojar|бросать|Arrojó la moneda a la fuente.|Он бросил монету в фонтан.|travel|
bendecir|благословлять|El cura bendice a los novios.|Священник благословляет молодожёнов.|friends|pres=bendigo,bendices,bendice,bendecimos,bendecís,bendicen pret=bendije,bendijiste,bendijo,bendijimos,bendijisteis,bendijeron part=bendecido
solucionar|решать (проблему)|Solucionamos el problema de la reserva.|Мы решили проблему с бронью.|travel|
apreciar|ценить|Aprecio mucho tu ayuda.|Я очень ценю твою помощь.|friends|
llover|идти (о дожде)|Hoy llueve en toda la costa.|Сегодня дождь по всему побережью.|travel|ue
juntar|соединять; juntarse — собираться|Nos juntamos el sábado en mi casa.|Мы собираемся в субботу у меня.|friends|
aprobar|одобрять; сдавать (экзамен)|Aprobé el examen de español.|Я сдал экзамен по испанскому.|daily|ue
ahogar|топить; ahogarse — тонуть|Nadie se ahogó, por suerte.|К счастью, никто не утонул.|travel|
aterrizar|приземляться|Aterrizamos en Lisboa a las doce.|Мы приземлились в Лиссабоне в двенадцать.|travel|
aclarar|прояснять|Quiero aclarar una duda.|Хочу прояснить один вопрос.|it|
revelar|раскрывать|Reveló el secreto en la cena.|Он раскрыл секрет за ужином.|friends|
filmar|снимать (фильм)|Filmamos el concierto con el móvil.|Мы сняли концерт на телефон.|friends|
establecer|устанавливать|Establecemos las reglas del juego.|Мы устанавливаем правила игры.|friends|zco
tranquilizar|успокаивать|Me tranquiliza saber que estás bien.|Меня успокаивает, что у тебя всё хорошо.|friends|
portar|носить с собой; нести|Debe portar su pasaporte.|Вы должны иметь при себе паспорт.|travel|
encajar|подходить, вставать на место|La pieza no encaja.|Деталь не подходит.|it|
examinar|осматривать, проверять|El médico examina al paciente.|Врач осматривает пациента.|daily|
anunciar|объявлять|Anunciaron un retraso de una hora.|Объявили задержку на час.|travel|
reducir|сокращать|Redujeron el precio de los billetes.|Цены на билеты снизили.|travel|zco pret=reduje,redujiste,redujo,redujimos,redujisteis,redujeron
jurar|клясться|Te lo juro, es verdad.|Клянусь тебе, это правда.|friends|
arder|гореть|La leña arde en la chimenea.|Дрова горят в камине.|friends|
burlar|обманывать; burlarse — насмехаться|Nadie se burla de mi acento.|Никто не смеётся над моим акцентом.|friends|
brillar|блестеть, сиять|El sol brilla todo el día.|Солнце светит весь день.|travel|
regalar|дарить|Te regalo este libro.|Дарю тебе эту книгу.|friends|
amanecer|рассветать|Amanece a las siete.|Светает в семь.|travel|zco
involucrar|вовлекать|El proyecto involucra a todo el equipo.|Проект вовлекает всю команду.|it|
recomendar|рекомендовать|¿Me recomienda un restaurante?|Посоветуете мне ресторан?|travel|ie
helar|замораживать|Hiela en las montañas por la noche.|Ночью в горах морозит.|travel|ie
apretar|сжимать; нажимать|Aprieta el botón dos veces.|Нажми кнопку дважды.|it|ie
poseer|владеть|Poseen un pequeño hotel.|Им принадлежит небольшой отель.|travel|ey
animar|подбадривать|Los amigos nos animan.|Друзья нас подбадривают.|friends|
lamentar|сожалеть|Lamento el retraso.|Сожалею о задержке.|travel|
conservar|сохранять|Conserva el billete hasta el final.|Сохраняй билет до конца поездки.|travel|
castigar|наказывать|Nadie fue castigado.|Никто не был наказан.|daily|
cansar|утомлять; cansarse — уставать|El viaje me cansó mucho.|Поездка меня очень утомила.|travel|
bloquear|блокировать|Bloquearon la calle por las obras.|Улицу перекрыли из-за ремонта.|travel|
coincidir|совпадать; случайно встретиться|Coincidimos en el aeropuerto.|Мы случайно встретились в аэропорту.|friends|
sangrar|кровоточить|Me sangra el dedo.|У меня кровоточит палец.|daily|
confundir|путать|Confundí las llaves.|Я перепутал ключи.|travel|
expulsar|выгонять|Lo expulsaron del club.|Его исключили из клуба.|friends|
surgir|возникать|Surgió un problema en el hotel.|В отеле возникла проблема.|travel|jo
pescar|ловить рыбу|Fuimos a pescar al lago.|Мы ходили на озеро ловить рыбу.|travel|
expresar|выражать|Es difícil expresarlo en inglés.|Трудно выразить это по-английски.|daily|
localizar|находить; определять местоположение|No puedo localizar el hotel en el mapa.|Не могу найти отель на карте.|travel|
atar|привязывать, завязывать|Ata los cordones, por favor.|Завяжи шнурки, пожалуйста.|daily|
ofender|обижать|No quiero ofenderte.|Не хочу тебя обидеть.|friends|
admirar|восхищаться|Admiro tu valentía.|Восхищаюсь твоей смелостью.|friends|
rescatar|спасать|Rescataron a los excursionistas.|Спасли туристов.|travel|
lidiar|справляться, иметь дело|Hay que lidiar con el tráfico.|Приходится мириться с пробками.|travel|
retener|удерживать|Retuvieron mi maleta en la aduana.|Мой чемодан задержали на таможне.|travel|pres=retengo,retienes,retiene,retenemos,retenéis,retienen pret=retuve,retuviste,retuvo,retuvimos,retuvisteis,retuvieron
marcar|отмечать; набирать (номер); забивать|Marca el número que te di.|Набери номер, который я тебе дал.|daily|
custodiar|охранять|Un guarda custodia el museo.|Охранник охраняет музей.|travel|
emplear|использовать; нанимать|Empleamos poco tiempo en el trayecto.|На дорогу мы потратили мало времени.|travel|
velar|бдеть, заботиться|Un amigo vela por mis cosas.|Друг присматривает за моими вещами.|travel|
orinar|мочиться|El perro orina en el parque.|Собака мочится в парке.|daily|
dividir|делить|Vamos a dividir la cuenta.|Давайте разделим счёт.|friends|
apetecer|хотеться|¿Te apetece un café?|Хочешь кофе?|friends|zco
''', 'es', 'verb')
