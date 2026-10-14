# ИИ-черновик (D-25): испанские прилагательные партии 4 (LNG-S1-032) — остаток каркаса.
# Формы f / pl / fpl — сборка; fm= pl= fpl= — исключения, nf — неизменяемое.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
herido|раненый|El conductor está herido, pero bien.|Водитель ранен, но чувствует себя хорошо.|travel|
inteligente|умный|Es una idea muy inteligente.|Это очень умная мысль.|it|
triste|грустный|La película es muy triste.|Фильм очень грустный.|friends|
cansado|уставший|Estoy cansado después del vuelo.|Я устал после перелёта.|travel|
unido|сплочённый, объединённый|Somos un grupo muy unido.|Мы очень сплочённая группа.|friends|
cerrado|закрытый|El museo está cerrado los lunes.|Музей закрыт по понедельникам.|travel|
precioso|прекрасный|Qué paisaje tan precioso.|Какой прекрасный пейзаж.|travel|
simple|простой|Es una receta muy simple.|Это очень простой рецепт.|friends|
nervioso|нервный|Estoy nervioso antes del vuelo.|Я нервничаю перед полётом.|travel|
sentado|сидящий|Hay un hombre sentado en la plaza.|На площади сидит мужчина.|travel|
agradable|приятный|Pasamos una tarde muy agradable.|Мы провели очень приятный вечер.|friends|
orgulloso|гордый|Estoy orgulloso de ti.|Я горжусь тобой.|friends|
falso|ложный, поддельный|Cuidado, el billete es falso.|Осторожно, билет поддельный.|travel|
encantado|очарованный; рад (познакомиться)|Encantado de conocerte.|Очень рад с тобой познакомиться.|friends|
guapo|красивый|Tu amigo es muy guapo.|Твой друг очень красивый.|friends|
enamorado|влюблённый|Está enamorado de Sevilla.|Он влюблён в Севилью.|travel|
político|политический|Es un tema político.|Это политическая тема.|friends|
privado|частный|¿Es una playa privada?|Это частный пляж?|travel|
temprano|ранний|Salimos muy temprano.|Мы выезжаем очень рано.|travel|
americano|американский|Prefiero el café americano.|Я предпочитаю кофе американо.|friends|
limpio|чистый|La habitación está limpia.|Номер чистый.|travel|
excelente|отличный|El servicio fue excelente.|Обслуживание было отличным.|travel|
fantástico|фантастический|El concierto fue fantástico.|Концерт был фантастическим.|friends|
chino|китайский|Cenamos en un restaurante chino.|Мы ужинали в китайском ресторане.|friends|
entero|целый, весь|Pasamos el día entero en la playa.|Мы провели целый день на пляже.|travel|
oscuro|тёмный|La calle estaba oscura.|Улица была тёмной.|travel|
caliente|горячий|El café está muy caliente.|Кофе очень горячий.|friends|
principal|главный|La estación principal está en el centro.|Главный вокзал в центре.|travel|
inocente|невиновный|Los niños parecen tan inocentes.|Дети выглядят такими невинными.|friends|
culpable|виновный|Me siento culpable por llegar tarde.|Мне стыдно, что я опоздал.|friends|
estupendo|замечательный|¡Qué idea tan estupenda!|Какая замечательная идея!|friends|
sospechoso|подозрительный|Hay un paquete sospechoso.|Там подозрительный пакет.|travel|
asustado|испуганный|Los niños estaban asustados.|Дети были напуганы.|travel|
debido|должный; debido a — из-за|Llegamos tarde debido al tráfico.|Мы опоздали из-за пробок.|travel|
común|общий; обычный|Es un error muy común.|Это очень распространённая ошибка.|daily|
sucio|грязный|Las toallas estaban sucias.|Полотенца были грязными.|travel|
brillante|яркий; блестящий|Es una idea brillante.|Это блестящая идея.|it|
enorme|огромный|La habitación es enorme.|Номер огромный.|travel|
paciente|терпеливый|Hay que ser paciente con el tráfico.|С пробками нужно быть терпеливым.|travel|
ridículo|нелепый|El precio es ridículo.|Цена просто нелепая.|travel|
desaparecido|пропавший|Mi maleta está desaparecida.|Мой чемодан пропал.|travel|
absoluto|абсолютный|Tenemos silencio absoluto aquí.|Здесь абсолютная тишина.|travel|
azul|синий, голубой|El mar es de un azul intenso.|Море насыщенного синего цвета.|travel|
menudo|мелкий; (¡menudo...!) — ну и...|¡Menudo susto me llevé!|Ну и испугался же я!|friends|
dispuesto|готовый|Estoy dispuesto a ayudar.|Я готов помочь.|friends|
interior|внутренний|La habitación es interior, sin vistas.|Номер внутренний, без вида.|travel|
famoso|известный|Este café es famoso por sus churros.|Это кафе известно своими чуррос.|travel|
verde|зелёный|La ruta pasa por un parque verde.|Маршрут идёт через зелёный парк.|travel|
profundo|глубокий|El lago es muy profundo.|Озеро очень глубокое.|travel|
embarazada|беременная|Mi hermana está embarazada.|Моя сестра беременна.|friends|nf
doble|двойной|Reservamos una habitación doble.|Мы забронировали двухместный номер.|travel|
dormido|спящий|Los niños están dormidos.|Дети спят.|travel|
directo|прямой|Es un vuelo directo.|Это прямой рейс.|travel|
vacío|пустой|El autobús iba casi vacío.|Автобус шёл почти пустой.|travel|
decidido|решительный; решённый|Está decidido: vamos en tren.|Решено: едем на поезде.|travel|
contrario|противоположный|Vamos en sentido contrario.|Мы идём в обратную сторону.|travel|
grave|серьёзный, тяжёлый|No es nada grave.|Ничего серьёзного.|daily|
local|местный|Probamos la comida local.|Мы попробовали местную еду.|travel|
distinto|другой, различный|Cada hotel es distinto.|Каждый отель особенный.|travel|
santo|святой|Visitamos una iglesia de un santo local.|Мы посетили церковь местного святого.|travel|
roto|сломанный|El ascensor está roto.|Лифт сломан.|travel|
menor|меньший; младший|Mi hermano menor vive en Valencia.|Мой младший брат живёт в Валенсии.|friends|
francés|французский|Hablan francés en la recepción.|На ресепшене говорят по-французски.|travel|fm=francesa pl=franceses fpl=francesas
presente|присутствующий|¿Están todos presentes?|Все присутствуют?|friends|
contento|довольный|Estamos contentos con el hotel.|Мы довольны отелем.|travel|
robado|украденный|Mi móvil fue robado en el tren.|Мой телефон украли в поезде.|travel|
poderoso|мощный|Este portátil es muy poderoso.|Этот ноутбук очень мощный.|it|
interesado|заинтересованный|Estoy interesado en la música española.|Я интересуюсь испанской музыкой.|friends|
enojado|сердитый (Лат. Америка)|Estaba enojado por el retraso.|Он был зол из-за задержки.|travel|
cubierto|покрытый|El cielo está cubierto.|Небо затянуто.|travel|
tercero|третий|Es la tercera vez que visito Sevilla.|Я приезжаю в Севилью в третий раз.|travel|
nacional|национальный|Visitamos un parque nacional.|Мы посетили национальный парк.|travel|
bello|красивый|Es un paisaje muy bello.|Это очень красивый пейзаж.|travel|
débil|слабый|La señal es débil aquí.|Здесь слабый сигнал.|travel|
inmediato|немедленный|Necesito una respuesta inmediata.|Мне нужен немедленный ответ.|it|
natural|природный; естественный|Es un parque natural precioso.|Это прекрасный природный парк.|travel|
feo|некрасивый|El edificio es feo, pero cómodo.|Здание некрасивое, но удобное.|travel|
complicado|сложный|El horario es complicado.|Расписание сложное.|travel|
aburrido|скучный; скучающий|La reunión fue aburrida.|Совещание было скучным.|it|
puro|чистый|El agua es pura.|Вода чистая.|travel|
cómodo|удобный|La cama es muy cómoda.|Кровать очень удобная.|travel|
familiar|семейный; знакомый|Es un hotel familiar.|Это семейный отель.|travel|
enfadado|сердитый|Está enfadado conmigo.|Он на меня сердится.|friends|
total|полный, общий|El precio total es de cien euros.|Общая цена — сто евро.|travel|
social|социальный; общительный|Mi amigo es muy social.|Мой друг очень общительный.|friends|
valiente|храбрый|Fuiste muy valiente.|Ты был очень смелым.|friends|
invitado|приглашённый|Estamos invitados a la boda.|Мы приглашены на свадьбу.|friends|
atrapado|пойманный, застрявший|Estamos atrapados en el tráfico.|Мы застряли в пробке.|travel|
superior|верхний; высший|La habitación está en el piso superior.|Номер на верхнем этаже.|travel|
diario|ежедневный|Hay un vuelo diario a Roma.|Есть ежедневный рейс в Рим.|travel|
físico|физический|Es un esfuerzo físico grande.|Это большая физическая нагрузка.|daily|
helado|ледяной; замороженный|El agua del mar está helada.|Вода в море ледяная.|travel|
inútil|бесполезный|Este mapa es inútil.|Эта карта бесполезна.|travel|
borracho|пьяный|Estaba un poco borracho después de la fiesta.|Он был немного пьян после вечеринки.|friends|
central|центральный|El hotel tiene una ubicación central.|Отель находится в центре.|travel|
cercano|близкий|El pueblo más cercano está a diez kilómetros.|Ближайшая деревня в десяти километрах.|travel|
''', 'es', 'adj')
