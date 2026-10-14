# ИИ-черновик (D-25): испанские наречия партии 4 (LNG-S1-032) — остаток каркаса.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
recientemente|недавно|Recientemente nos mudamos a Valencia.|Недавно мы переехали в Валенсию.|daily|
prácticamente|практически|Es prácticamente gratis.|Это практически бесплатно.|travel|
igualmente|так же; взаимно|Encantado de conocerte. — Igualmente.|Рад познакомиться. — Взаимно.|friends|
posiblemente|возможно|Posiblemente llueva mañana.|Возможно, завтра будет дождь.|travel|
enfrente|напротив|El hotel está enfrente de la estación.|Отель находится напротив вокзала.|travel|
naturalmente|естественно, конечно|Naturalmente, vamos a ir contigo.|Конечно, мы пойдём с тобой.|friends|
sinceramente|искренне|Sinceramente, prefiero el primer hotel.|Честно говоря, мне больше нравится первый отель.|friends|
lentamente|медленно|¿Puede hablar más lentamente?|Можете говорить медленнее?|travel|
profundamente|глубоко|Lo siento profundamente.|Мне очень жаль.|friends|
oficialmente|официально|El museo está oficialmente cerrado.|Музей официально закрыт.|travel|
verdaderamente|поистине|La vista es verdaderamente increíble.|Вид по-настоящему невероятный.|travel|
desafortunadamente|к несчастью|Desafortunadamente, el vuelo está lleno.|К несчастью, рейс заполнен.|travel|
francamente|откровенно|Francamente, no me gustó la película.|Откровенно говоря, фильм мне не понравился.|friends|
técnicamente|технически|Técnicamente, la habitación está lista.|Формально номер готов.|it|
extremadamente|чрезвычайно|Hace un calor extremadamente fuerte.|Стоит чрезвычайная жара.|travel|
increíblemente|невероятно|La comida estaba increíblemente buena.|Еда была невероятно вкусной.|travel|
aproximadamente|приблизительно|El viaje dura aproximadamente dos horas.|Поездка длится примерно два часа.|travel|
actualmente|в настоящее время|Actualmente vivo en Madrid.|В настоящее время я живу в Мадриде.|daily|
constantemente|постоянно|La app falla constantemente.|Приложение постоянно сбоит.|it|
generalmente|обычно|Generalmente cenamos a las nueve.|Обычно мы ужинаем в девять.|daily|
correctamente|правильно|¿Está el nombre escrito correctamente?|Имя написано правильно?|travel|
seriamente|серьёзно|¿Hablas seriamente?|Ты серьёзно?|friends|
terriblemente|ужасно|Lo siento terriblemente.|Мне ужасно жаль.|friends|
afortunadamente|к счастью|Afortunadamente, nadie se hizo daño.|К счастью, никто не пострадал.|travel|
necesariamente|обязательно|No es necesariamente caro.|Это необязательно дорого.|travel|
supuestamente|якобы|Supuestamente, es el mejor café de la ciudad.|Говорят, это лучшее кафе в городе.|travel|
justamente|как раз; справедливо|Justamente quería hablar contigo.|Я как раз хотел с тобой поговорить.|friends|
físicamente|физически|Estaba físicamente agotado.|Я был физически измотан.|daily|
principalmente|главным образом|Viajamos principalmente en tren.|Мы путешествуем в основном на поезде.|travel|
evidentemente|очевидно|Evidentemente, nos equivocamos de calle.|Очевидно, мы свернули не на ту улицу.|travel|
legalmente|законно|Aquí no se puede aparcar legalmente.|Здесь по закону парковаться нельзя.|travel|
usualmente|обычно|Usualmente salgo a las ocho.|Обычно я выхожу в восемь.|daily|
lamentablemente|к сожалению|Lamentablemente, el museo está cerrado.|К сожалению, музей закрыт.|travel|
eventualmente|в итоге; иногда|Eventualmente llegamos al hotel.|В итоге мы добрались до отеля.|travel|
particularmente|особенно|Me gustó particularmente el casco antiguo.|Мне особенно понравился старый город.|travel|
cuidadosamente|осторожно|Lee las instrucciones cuidadosamente.|Внимательно прочитай инструкции.|it|
específicamente|конкретно|Pedí específicamente una habitación tranquila.|Я специально просил тихий номер.|travel|
mutuamente|взаимно|Se ayudan mutuamente.|Они помогают друг другу.|friends|
altamente|высоко, весьма|El restaurante es altamente recomendable.|Ресторан настоятельно рекомендуется.|travel|
desgraciadamente|к несчастью|Desgraciadamente, perdimos el tren.|К несчастью, мы опоздали на поезд.|travel|
accidentalmente|случайно|Borré el archivo accidentalmente.|Я случайно удалил файл.|it|
únicamente|только|Aceptamos únicamente efectivo.|Мы принимаем только наличные.|travel|
suavemente|мягко|Cierra la puerta suavemente.|Закрой дверь мягко.|daily|
emocionalmente|эмоционально|Estaba emocionalmente agotado.|Я был эмоционально вымотан.|daily|
ligeramente|слегка|El tren llega ligeramente tarde.|Поезд приходит с небольшим опозданием.|travel|
desesperadamente|отчаянно|Buscábamos desesperadamente un taxi.|Мы отчаянно искали такси.|travel|
eternamente|вечно|Te lo agradeceré eternamente.|Буду вечно тебе благодарен.|friends|
tranquilamente|спокойно|Desayunamos tranquilamente en la terraza.|Мы спокойно позавтракали на террасе.|travel|
efectivamente|действительно|Efectivamente, el vuelo salió tarde.|Действительно, рейс вылетел поздно.|travel|
estrictamente|строго|Está estrictamente prohibido fumar.|Курить строго запрещено.|travel|
previamente|ранее|La habitación fue reservada previamente.|Номер был забронирован заранее.|travel|
libremente|свободно|Puedes moverte libremente por el museo.|В музее можно свободно передвигаться.|travel|
atentamente|внимательно|Escucha atentamente las instrucciones.|Внимательно слушай инструкции.|travel|
continuamente|непрерывно|Llovió continuamente dos días.|Дождь шёл непрерывно два дня.|travel|
sumamente|крайне|Es sumamente importante llevar el pasaporte.|Крайне важно иметь с собой паспорт.|travel|
nomás|только; просто (Лат. Америка)|Nomás un momento, por favor.|Минутку, пожалуйста.|travel|
dondequiera|где бы ни|Dondequiera que vayas, me avisas.|Куда бы ты ни поехал, сообщай мне.|friends|
amablemente|любезно|Nos atendieron amablemente.|Нас любезно обслужили.|travel|
repentinamente|внезапно|Repentinamente empezó a llover.|Внезапно пошёл дождь.|travel|
fijamente|пристально|Me miró fijamente.|Он пристально на меня посмотрел.|friends|
voluntariamente|добровольно|Participo voluntariamente.|Я участвую добровольно.|friends|
deliberadamente|намеренно|No lo hizo deliberadamente.|Он сделал это не нарочно.|friends|
sencillamente|просто|Es sencillamente perfecto.|Это просто идеально.|friends|
difícilmente|едва ли|Difícilmente llegaremos a tiempo.|Едва ли мы успеем вовремя.|travel|
mentalmente|мысленно|Estoy mentalmente agotado.|Я морально вымотан.|daily|
felizmente|счастливо|Viven felizmente en Valencia.|Они счастливо живут в Валенсии.|friends|
temporalmente|временно|El museo está temporalmente cerrado.|Музей временно закрыт.|travel|
fuertemente|сильно|Llovía fuertemente.|Шёл сильный дождь.|travel|
mayormente|в основном|Los turistas son mayormente jóvenes.|Туристы в основном молодые.|travel|
ilegalmente|незаконно|No aparques ilegalmente.|Не паркуйся незаконно.|travel|
gravemente|тяжело|Nadie resultó gravemente herido.|Никто не был тяжело ранен.|travel|
sorprendentemente|удивительно|Sorprendentemente, el vuelo salió a tiempo.|Удивительно, но рейс вылетел вовремя.|travel|
públicamente|публично|Lo anunciaron públicamente.|Это объявили публично.|it|
adecuadamente|надлежащим образом|Vístete adecuadamente para la montaña.|Одевайся по-походному.|travel|
originalmente|первоначально|Originalmente era una biblioteca.|Первоначально это была библиотека.|travel|
abiertamente|открыто|Hablamos abiertamente del problema.|Мы открыто обсудили проблему.|friends|
automáticamente|автоматически|La app se actualiza automáticamente.|Приложение обновляется автоматически.|it|
extrañamente|странно|Extrañamente, nadie contestó.|Странно, но никто не ответил.|friends|
permanentemente|постоянно|La tienda está cerrada permanentemente.|Магазин закрыт навсегда.|travel|
regularmente|регулярно|Practico español regularmente.|Я регулярно практикую испанский.|daily|
apropiadamente|надлежащим образом|Se comportó apropiadamente.|Он вёл себя подобающим образом.|friends|
aprisa|быстро|Camina aprisa, que perdemos el tren.|Иди быстрее, а то опоздаем на поезд.|travel|
firmemente|твёрдо|Dijo que no firmemente.|Он твёрдо сказал нет.|friends|
relativamente|относительно|El hotel es relativamente barato.|Отель относительно недорогой.|travel|
inclusive|включительно; даже|Abierto de lunes a sábado inclusive.|Открыто с понедельника по субботу включительно.|travel|
maravillosamente|чудесно|La noche transcurrió maravillosamente.|Вечер прошёл чудесно.|friends|
potencialmente|потенциально|Es potencialmente peligroso.|Это потенциально опасно.|it|
esencialmente|по сути|Esencialmente necesitamos más tiempo.|По сути, нам нужно больше времени.|it|
locamente|безумно|Están locamente enamorados.|Они безумно влюблены.|friends|
estupendamente|прекрасно|Todo salió estupendamente.|Всё прошло прекрасно.|friends|
enormemente|чрезвычайно|Agradezco enormemente tu ayuda.|Я очень благодарен за твою помощь.|friends|
plenamente|полностью|Estoy plenamente de acuerdo.|Я полностью согласен.|friends|
raramente|редко|Raramente salimos entre semana.|В будни мы редко куда-то ходим.|friends|
tristemente|грустно; к сожалению|Tristemente, el museo cierra hoy.|К сожалению, музей сегодня закрыт.|travel|
ocasionalmente|иногда|Ocasionalmente comemos fuera.|Мы иногда едим вне дома.|friends|
exclusivamente|исключительно|La piscina es exclusivamente para huéspedes.|Бассейн только для гостей.|travel|
casualmente|случайно|Casualmente nos encontramos en el aeropuerto.|Мы случайно встретились в аэропорту.|friends|
brevemente|кратко|Brevemente, necesitamos más tiempo.|Коротко говоря, нам нужно больше времени.|it|
''', 'es', 'adv')
