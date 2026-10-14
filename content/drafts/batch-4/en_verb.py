# ИИ-черновик (D-25): английские глаголы партии 4 (LNG-S1-032) — остаток каркаса. Запись — dsl.py.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
hurt|причинять боль; болеть|My knee hurts when I climb the stairs.|У меня болит колено, когда я поднимаюсь по лестнице.|daily|irr=hurt/hurt pair=doler
live|жить|We live ten minutes from the station.|Мы живём в десяти минутах от станции.|daily|pair=vivir
wish|желать; хотеть, чтобы (нереальное)|I wish you could come to the party.|Жаль, что ты не можешь прийти на вечеринку.|friends||wish + could / were: желание о нереальном
follow|следовать; следить|Follow me, the café is around the corner.|Идите за мной, кафе за углом.|travel|pair=seguir
cut|резать; сокращать|Can you cut the cake, please?|Можешь разрезать торт?|friends|irr=cut/cut dbl pair=cortar
rest|отдыхать|We rested for an hour after the hike.|После похода мы отдыхали час.|travel|pair=descansar
shall|вопрос-предложение: Shall we…?|Shall we meet at seven?|Встретимся в семь?|friends|modal|Используется почти только в Shall I / Shall we
cause|вызывать, быть причиной|A bug in the update caused the crash.|Ошибка в обновлении вызвала сбой.|it|pair=causar
laugh|смеяться|We laughed all evening.|Мы смеялись весь вечер.|friends|pair=reír
answer|отвечать|Please answer the phone, I'm driving.|Ответь, пожалуйста, на звонок, я за рулём.|daily|pair=responder
build|строить; собирать (программу)|We build the app every night.|Мы собираем приложение каждую ночь.|it|irr=built/built pair=construir
throw|бросать|He threw the keys to me.|Он бросил мне ключи.|daily|irr=threw/thrown pair=lanzar
learn|учить, выучить|I'm learning Spanish and English.|Я учу испанский и английский.|daily|pair=aprender
wear|носить (одежду)|She wore a red dress to the party.|На вечеринку она надела красное платье.|friends|irr=wore/worn pair=llevar
pass|передавать; проходить; сдавать (экзамен)|Could you pass me the salt?|Передай, пожалуйста, соль.|friends|pair=pasar
sell|продавать|They sell tickets at the entrance.|Билеты продают у входа.|travel|irr=sold/sold pair=vender
pull|тянуть|Pull the door, don't push it.|Тяни дверь, не толкай.|daily|pair=tirar
begin|начинать(ся)|The concert begins at eight.|Концерт начинается в восемь.|friends|irr=began/begun dbl pair=empezar
welcome|приветствовать; Welcome! — добро пожаловать|They welcomed us with coffee and cake.|Нас встретили кофе и пирогом.|friends|pair=dar_la_bienvenida
hang|вешать; висеть; hang out — проводить время|We usually hang out at Sam's place.|Мы обычно тусуемся у Сэма.|friends|irr=hung/hung|hang out — неформально: «проводить время вместе»
drop|ронять; бросать; подвозить (drop off)|Can you drop me off at the station?|Подбросишь меня до станции?|travel|dbl pair=dejar
sing|петь|We sang until midnight.|Мы пели до полуночи.|friends|irr=sang/sung pair=cantar
hurry|спешить|Hurry up, the train leaves in five minutes!|Быстрее, поезд отправляется через пять минут!|travel||hurry up — поторапливаться
decide|решать, принимать решение|We decided to go by train.|Мы решили ехать на поезде.|travel|pair=decidir
hate|ненавидеть; терпеть не мочь|I hate waiting at the airport.|Терпеть не могу ждать в аэропорту.|travel|pair=odiar
fall|падать; fall in love — влюбиться|He fell asleep on the bus.|Он уснул в автобусе.|travel|irr=fell/fallen pair=caer
grow|расти; выращивать|The team has grown a lot this year.|Команда сильно выросла в этом году.|it|irr=grew/grown pair=crecer
return|возвращаться; возвращать|When do you return from the trip?|Когда ты возвращаешься из поездки?|travel|pair=volver
cry|плакать; кричать|The little boy cried at the airport.|Маленький мальчик плакал в аэропорту.|travel|pair=llorar
lead|вести; возглавлять|Maria leads the mobile team.|Мария возглавляет мобильную команду.|it|irr=led/led pair=dirigir
beat|бить; побеждать|Our team beat them three to one.|Наша команда обыграла их 3:1.|friends|irr=beat/beaten pair=ganar
blow|дуть; задувать|Make a wish and blow out the candles!|Загадай желание и задуй свечи!|friends|irr=blew/blown
fly|летать, лететь|We fly to Madrid on Friday.|В пятницу мы летим в Мадрид.|travel|irr=flew/flown pair=volar
train|тренировать(ся); учить|I train three times a week.|Я тренируюсь три раза в неделю.|daily|pair=entrenar
report|сообщать; докладывать|Please report the problem to the front desk.|Сообщите о проблеме на ресепшен.|travel|pair=informar
scream|кричать, вопить|The kids screamed on the roller coaster.|Дети визжали на американских горках.|friends
continue|продолжать(ся)|Let's continue after lunch.|Продолжим после обеда.|it|pair=continuar
kiss|целовать|They kissed goodbye at the station.|Они поцеловались на прощание на вокзале.|travel|pair=besar
like|нравиться; любить|I like your new apartment.|Мне нравится твоя новая квартира.|friends|pair=gustar
love|любить|We love this café.|Мы обожаем это кафе.|friends|pair=amar
teach|учить, преподавать|My sister teaches Spanish.|Моя сестра преподаёт испанский.|daily|irr=taught/taught pair=enseñar
cover|покрывать; освещать; покрывать расходы|The insurance covers lost luggage.|Страховка покрывает потерю багажа.|travel|pair=cubrir
agree|соглашаться|I agree, let's meet on Saturday.|Согласен, давайте встретимся в субботу.|friends|pair=estar_de_acuerdo
wake|просыпаться; будить (wake up)|I woke up at six to catch the flight.|Я проснулся в шесть, чтобы успеть на рейс.|travel|irr=woke/woken pair=despertar
step|шагнуть; step in/out|Please step back from the doors.|Отойдите, пожалуйста, от дверей.|travel|dbl
carry|нести; возить|I can carry your bag.|Я могу понести твою сумку.|travel|pair=llevar
allow|разрешать|Pets are not allowed in the hotel.|С животными в отель нельзя.|travel|pair=permitir
protect|защищать|Use a strong password to protect your account.|Используйте надёжный пароль для защиты аккаунта.|it|pair=proteger
burn|жечь, гореть; обжечь|I burned the toast again.|Я опять сжёг тосты.|daily||Прошедшее: burned (США) или burnt (Британия)
join|присоединяться|Why don't you join us for dinner?|Почему бы тебе не присоединиться к нам за ужином?|friends|pair=unir
enjoy|наслаждаться; получать удовольствие|Did you enjoy the concert?|Тебе понравился концерт?|friends||enjoy + существительное или -ing: enjoy dancing
knock|стучать|Please knock before you come in.|Пожалуйста, постучите, прежде чем войти.|daily
choose|выбирать|It's hard to choose from this menu.|Трудно выбрать из этого меню.|friends|irr=chose/chosen pair=elegir
steal|красть|Someone stole my phone on the train.|Кто-то украл мой телефон в поезде.|travel|irr=stole/stolen pair=robar
hide|прятать(ся)|I hid the present in the closet.|Я спрятал подарок в шкафу.|friends|irr=hid/hidden pair=esconder
offer|предлагать|They offered us free breakfast.|Нам предложили бесплатный завтрак.|travel|pair=ofrecer
realize|осознавать, понимать|I just realized I forgot my passport.|Я только что понял, что забыл паспорт.|travel|pair=darse_cuenta
imagine|воображать, представлять|Imagine living by the sea!|Представь, что живёшь у моря!|daily|pair=imaginar
open|открывать(ся)|The museum opens at nine.|Музей открывается в девять.|travel|pair=abrir
lock|запирать|Don't forget to lock the door.|Не забудь запереть дверь.|travel|pair=cerrar
arrest|арестовывать|The police arrested two men.|Полиция арестовала двух человек.|daily
push|толкать, нажимать|Push the button to call the elevator.|Нажми кнопку, чтобы вызвать лифт.|daily|pair=empujar
handle|справляться; обрабатывать|The server can't handle so many requests.|Сервер не справляется с таким числом запросов.|it|pair=manejar
destroy|уничтожать, разрушать|The storm destroyed the old pier.|Шторм разрушил старый пирс.|travel|pair=destruir
forgive|прощать|Please forgive me for being late.|Прости, что опоздал.|friends|irr=forgave/forgiven pair=perdonar
prove|доказывать|The test proves that the fix works.|Тест доказывает, что исправление работает.|it|pair=probar
charge|брать плату; заряжать|They charge extra for the second bag.|За вторую сумку берут доплату.|travel|pair=cargar
ride|ехать (верхом, на велосипеде)|We rode bikes along the river.|Мы катались на велосипедах вдоль реки.|friends|irr=rode/ridden
bear|нести; выносить, терпеть|I can't bear this heat.|Не выношу эту жару.|travel|irr=bore/borne
notice|замечать|Did you notice the new sign?|Ты заметил новую вывеску?|daily|pair=notar
reach|достигать; связаться|You can reach me by phone.|Со мной можно связаться по телефону.|daily|pair=alcanzar
fear|бояться|Many people fear flying.|Многие боятся летать.|travel|pair=temer
arrive|прибывать|We arrive in Lisbon at noon.|Мы прибываем в Лиссабон в полдень.|travel|pair=llegar
sleep|спать|I couldn't sleep on the plane.|Я не смог уснуть в самолёте.|travel|irr=slept/slept pair=dormir
visit|посещать, навещать|We visit my parents every Sunday.|Мы навещаем моих родителей каждое воскресенье.|friends|pair=visitar
kid|шутить; дразнить|I'm just kidding, relax!|Я просто шучу, расслабься!|friends||Чаще в форме I'm kidding / You're kidding!
dream|мечтать; видеть сон|I dream of living by the sea.|Я мечтаю жить у моря.|daily|pair=soñar
accept|принимать, соглашаться|Do you accept credit cards?|Вы принимаете кредитные карты?|travel|pair=aceptar
create|создавать|Create an account to sign in.|Создайте аккаунт, чтобы войти.|it|pair=crear
kick|пинать, бить ногой|The kids kicked the ball around.|Дети гоняли мяч.|friends
rise|подниматься|Prices rise every summer.|Цены растут каждое лето.|travel|irr=rose/risen
prepare|готовить(ся)|I'll prepare dinner for everybody.|Я приготовлю ужин для всех.|friends|pair=preparar
consider|обдумывать; считать|Please consider the other options.|Пожалуйста, рассмотрите другие варианты.|it|pair=considerar
raise|поднимать; повышать|Raise your hand if you have a question.|Поднимите руку, если есть вопрос.|daily|pair=levantar
end|заканчивать(ся)|The tour ends at the cathedral.|Экскурсия заканчивается у собора.|travel|pair=terminar
smoke|курить; дымить|You can't smoke in the room.|В номере курить нельзя.|travel
escape|убегать; избегать|He escaped through the back door.|Он ушёл через чёрный ход.|daily
rid|освобождать; get rid of — избавиться|We need to get rid of old files.|Нужно избавиться от старых файлов.|it|irr=rid/rid dbl
breathe|дышать|Breathe in, breathe out, relax.|Вдох, выдох, расслабься.|daily|pair=respirar
relax|расслабляться|We relaxed on the beach all day.|Мы целый день отдыхали на пляже.|travel|pair=relajarse
treat|относиться; угощать|Let me treat you to dinner.|Позволь угостить тебя ужином.|friends
cook|готовить (еду)|Who cooks tonight?|Кто сегодня готовит?|friends|pair=cocinar
involve|включать, вовлекать|The job involves a lot of travel.|Работа подразумевает много разъездов.|it
mention|упоминать|Did she mention the time?|Она упоминала время?|friends|pair=mencionar
serve|подавать; обслуживать|Breakfast is served until ten.|Завтрак подают до десяти.|travel|pair=servir
dare|осмеливаться|I wouldn't dare to ask him.|Я бы не посмел его спросить.|daily
bother|беспокоить; утруждаться|Sorry to bother you.|Извините за беспокойство.|daily
belong|принадлежать|This bag belongs to my friend.|Эта сумка принадлежит моему другу.|friends
cross|пересекать|Cross the bridge and turn left.|Перейдите мост и поверните налево.|travel|pair=cruzar
remain|оставаться|Please remain seated.|Пожалуйста, оставайтесь на местах.|travel|pair=permanecer
smile|улыбаться|Everyone smiled for the photo.|Все улыбнулись для фото.|friends|pair=sonreír
close|закрывать(ся)|The shop closes at nine.|Магазин закрывается в девять.|daily|pair=cerrar
invite|приглашать|They invited us to their wedding.|Они пригласили нас на свадьбу.|friends|pair=invitar
promise|обещать|I promise I'll call you tomorrow.|Обещаю, что завтра позвоню.|friends|pair=prometer
fill|наполнять; fill in/out — заполнять|Please fill out this form.|Пожалуйста, заполните эту форму.|travel|pair=llenar
shout|кричать|Don't shout, I can hear you.|Не кричи, я тебя слышу.|friends
deserve|заслуживать|You deserve a good holiday.|Ты заслуживаешь хорошего отпуска.|friends|pair=merecer
support|поддерживать|The app supports three languages.|Приложение поддерживает три языка.|it|pair=apoyar
owe|быть должным|I owe you ten euros.|Я должен тебе десять евро.|friends|pair=deber
note|отмечать; замечать|Please note the new opening hours.|Обратите внимание на новые часы работы.|travel|pair=anotar
act|действовать; играть роль|We need to act fast.|Нам нужно действовать быстро.|it|pair=actuar
suffer|страдать|He suffers from a bad back.|Он страдает от болей в спине.|daily|pair=sufrir
quit|бросать; увольняться|I quit my job last year.|Я уволился в прошлом году.|it|irr=quit/quit dbl
stick|приклеивать; застревать|The key sticks in the lock.|Ключ застревает в замке.|daily|irr=stuck/stuck
appreciate|ценить; быть благодарным|I appreciate your help.|Я ценю твою помощь.|friends|pair=agradecer
warn|предупреждать|They warned us about the traffic.|Нас предупредили о пробках.|travel|pair=avisar
blame|винить|Don't blame me, I wasn't there.|Не вини меня, меня там не было.|friends|pair=culpar
plan|планировать|We plan to visit Valencia.|Мы планируем съездить в Валенсию.|travel|dbl pair=planear
fire|увольнять; стрелять|The company fired two managers.|Компания уволила двух менеджеров.|it
fail|терпеть неудачу; не получаться|The build failed again.|Сборка опять упала.|it|pair=fallar
disappear|исчезать|My files disappeared after the update.|Мои файлы исчезли после обновления.|it|pair=desaparecer
doubt|сомневаться|I doubt they'll come on time.|Сомневаюсь, что они придут вовремя.|friends|pair=dudar
admit|признавать|I admit I forgot about the meeting.|Признаю, я забыл про встречу.|friends|dbl pair=admitir
appear|появляться; казаться|A message appeared on the screen.|На экране появилось сообщение.|it|pair=aparecer
receive|получать|Did you receive my email?|Ты получил моё письмо?|it|pair=recibir
upset|расстраивать|The news upset everyone.|Новость всех расстроила.|friends|irr=upset/upset dbl
match|совпадать; подходить|The password doesn't match.|Пароль не совпадает.|it
pack|собирать вещи; упаковывать|I haven't packed my suitcase yet.|Я ещё не собрал чемодан.|travel|pair=empacar
suggest|предлагать, советовать|I suggest we take a taxi.|Предлагаю взять такси.|travel|pair=sugerir
survive|выживать|Our old laptop survived the trip.|Наш старый ноутбук пережил поездку.|travel|pair=sobrevivir
enter|входить; вводить|Enter your password to continue.|Введите пароль, чтобы продолжить.|it|pair=entrar
pretend|притворяться|Let's pretend we're tourists.|Давай притворимся туристами.|friends|pair=fingir
settle|поселяться; урегулировать|They settled in Valencia in 2019.|Они обосновались в Валенсии в 2019 году.|daily
exist|существовать|This feature doesn't exist yet.|Этой функции пока нет.|it|pair=existir
wonder|интересоваться, гадать|I wonder where Anna is.|Интересно, где Анна.|friends||I wonder if / where… — мягкий способ спросить
remind|напоминать|Remind me to buy bread.|Напомни мне купить хлеб.|daily|pair=recordar
strike|ударять; бастовать|Taxi drivers are on strike today.|Таксисты сегодня бастуют.|travel|irr=struck/struck
head|направляться; возглавлять|We're heading to the beach.|Мы направляемся на пляж.|travel
suspect|подозревать|I suspect the network is the problem.|Я подозреваю, что дело в сети.|it|pair=sospechar
dig|копать|The kids dug a hole in the sand.|Дети вырыли яму в песке.|travel|irr=dug/dug dbl pair=cavar
name|называть; давать имя|They named the dog Max.|Они назвали собаку Макс.|daily|pair=nombrar
hire|нанимать; арендовать|We hired a car for the weekend.|Мы взяли машину напрокат на выходные.|travel
figure|выяснять; figure out — разобраться|I can't figure out this map.|Я не могу разобраться в этой карте.|travel
practice|практиковаться, тренировать|I practice English with my colleagues.|Я практикую английский с коллегами.|daily
convince|убеждать|She convinced us to stay another day.|Она убедила нас остаться ещё на день.|friends|pair=convencer
add|добавлять|Add me to the group chat.|Добавь меня в групповой чат.|friends|pair=añadir
pray|молиться|They pray before dinner.|Они молятся перед ужином.|daily|pair=rezar
bury|хоронить, зарывать|The cat buried its toy in the garden.|Кошка закопала игрушку в саду.|daily|pair=enterrar
commit|совершать; фиксировать (commit)|Commit your changes before you leave.|Закоммить изменения перед уходом.|it|dbl pair=cometer
dress|одевать(ся)|Dress warmly, it's cold outside.|Одевайся тепло, на улице холодно.|daily|pair=vestir
refuse|отказываться|The shop refused to give me a refund.|Магазин отказался вернуть мне деньги.|travel|pair=rechazar
claim|утверждать; требовать|You can claim your luggage at belt three.|Багаж можно получить на ленте номер три.|travel|pair=reclamar
apologize|извиняться|I apologize for the delay.|Приношу извинения за задержку.|travel|pair=disculparse
recognize|узнавать|I didn't recognize you in that hat!|Я не узнал тебя в этой шляпе!|friends|pair=reconocer
discover|обнаруживать, открывать|We discovered a lovely little café.|Мы открыли для себя чудесное кафе.|travel|pair=descubrir
bore|наскучить|Long meetings bore me.|Долгие совещания нагоняют на меня скуку.|it
ring|звонить (о звонке); звонить по телефону|The phone is ringing.|Телефон звонит.|daily|irr=rang/rung pair=sonar
hop|прыгать; hop on — запрыгнуть|Hop on, the bus is leaving!|Запрыгивай, автобус отъезжает!|travel|dbl
deliver|доставлять|They deliver pizza until midnight.|Пиццу доставляют до полуночи.|friends|pair=entregar
excite|волновать, будоражить|The idea excites me.|Эта идея меня воодушевляет.|friends|pair=emocionar
focus|сосредоточиваться|I can't focus with all this noise.|Не могу сосредоточиться при таком шуме.|it|pair=enfocar
assume|предполагать|I assumed you were coming.|Я думал, ты придёшь.|friends|pair=suponer
shake|трясти; пожать (руку)|We shook hands and said goodbye.|Мы пожали руки и попрощались.|friends|irr=shook/shaken
yell|орать, кричать|Please don't yell at the waiter.|Пожалуйста, не кричи на официанта.|travel
introduce|представлять (знакомить)|Let me introduce my friend Tom.|Позвольте представить моего друга Тома.|friends|pair=presentar
dance|танцевать|We danced all night.|Мы танцевали всю ночь.|friends|pair=bailar
cheat|обманывать|Don't cheat, it's just a game.|Не жульничай, это всего лишь игра.|friends|pair=engañar
lift|поднимать|Can you help me lift this suitcase?|Поможешь поднять этот чемодан?|travel
cheer|подбадривать; ликовать|The crowd cheered when the band came out.|Толпа ликовала, когда вышла группа.|friends
swim|плавать|Can we swim in the lake?|Можно купаться в озере?|travel|irr=swam/swum dbl pair=nadar
ruin|разрушать, портить|Rain ruined our picnic.|Дождь испортил нам пикник.|friends|pair=arruinar
remove|убирать, удалять|Remove the old files first.|Сначала удали старые файлы.|it|pair=quitar
post|публиковать; отправлять почтой|I'll post the photos tonight.|Я выложу фото сегодня вечером.|friends
depend|зависеть|It depends on the weather.|Это зависит от погоды.|friends|pair=depender
threaten|угрожать|The storm threatens the whole coast.|Шторм угрожает всему побережью.|travel|pair=amenazar
celebrate|праздновать|We're celebrating Lena's birthday on Saturday.|В субботу мы празднуем день рождения Лены.|friends|pair=celebrar
bite|кусать|Mosquitoes bit me all night.|Комары кусали меня всю ночь.|travel|irr=bit/bitten pair=morder
concern|касаться; беспокоить|This change concerns all users.|Это изменение касается всех пользователей.|it
paint|красить; рисовать красками|She paints landscapes at the weekend.|По выходным она пишет пейзажи.|friends|pair=pintar
sign|подписывать|Please sign here.|Распишитесь здесь, пожалуйста.|travel|pair=firmar
drag|тащить|Drag the file into the folder.|Перетащи файл в папку.|it|dbl
spread|распространяться; намазывать|The news spread quickly.|Новость быстро разошлась.|friends|irr=spread/spread
clear|очищать; проясняться|The sky cleared in the afternoon.|К вечеру небо прояснилось.|travel
touch|трогать, касаться|Please don't touch the paintings.|Пожалуйста, не трогайте картины.|travel|pair=tocar
force|заставлять|The rain forced us to stay inside.|Дождь заставил нас остаться дома.|friends|pair=forzar
avoid|избегать|Let's avoid the rush hour.|Давай избегать часа пик.|travel|pair=evitar
unite|объединять|Music unites people.|Музыка объединяет людей.|friends|pair=unir
connect|соединять; подключаться|I can't connect to the wifi.|Не могу подключиться к вайфаю.|it|pair=conectar
provide|предоставлять|The hotel provides free parking.|Отель предоставляет бесплатную парковку.|travel|pair=proporcionar
earn|зарабатывать|She earns a good salary.|Она хорошо зарабатывает.|daily|pair=ganar
date|встречаться (романтически); датировать|They have been dating for a year.|Они встречаются уже год.|friends
prefer|предпочитать|I prefer tea to coffee.|Я предпочитаю чай кофе.|friends|dbl pair=preferir
order|заказывать; приказывать|Let's order some pizza.|Давай закажем пиццу.|friends|pair=pedir
gather|собираться; собирать|Everyone gathered in the kitchen.|Все собрались на кухне.|friends|pair=reunir
clean|убирать, чистить|We cleaned the flat before the party.|Мы убрались в квартире перед вечеринкой.|friends|pair=limpiar
split|делить, разделять|Let's split the bill.|Давайте разделим счёт.|friends|irr=split/split dbl pair=dividir
attack|нападать; атаковать|The server was attacked last night.|Сервер атаковали прошлой ночью.|it|pair=atacar
repeat|повторять|Could you repeat that, please?|Не могли бы вы повторить?|daily|pair=repetir
freeze|замерзать; зависать|My laptop froze again.|Мой ноутбук опять завис.|it|irr=froze/frozen
shower|принимать душ|I'll shower and be ready in ten minutes.|Я приму душ и буду готов через десять минут.|daily
seek|искать|We seek a new designer.|Мы ищем нового дизайнера.|it|irr=sought/sought|Книжное; в быту чаще look for
lay|класть; накрывать (lay the table)|Can you lay the table?|Накроешь на стол?|friends|irr=laid/laid
count|считать|Count me in!|Считайте меня!|friends|pair=contar|count me in — «я с вами»
borrow|брать взаймы|Can I borrow your charger?|Можно одолжить у тебя зарядку?|friends
collect|собирать; забирать|You can collect your keys at the desk.|Ключи можно забрать на стойке.|travel|pair=recoger
perform|выступать; выполнять|The band performs on Friday.|Группа выступает в пятницу.|friends
waste|тратить впустую|Don't waste your time on this.|Не трать на это время.|daily|pair=desperdiciar
confuse|путать|The map confused everyone.|Карта всех запутала.|travel|pair=confundir
smell|пахнуть; чувствовать запах|The kitchen smells great.|На кухне чудесно пахнет.|friends|pair=oler
jump|прыгать|The kids jumped into the pool.|Дети прыгнули в бассейн.|travel|pair=saltar
climb|взбираться|We climbed to the top in two hours.|Мы поднялись на вершину за два часа.|travel|pair=escalar
deny|отрицать|He denied everything.|Он всё отрицал.|friends|pair=negar
deal|иметь дело; deal with — справляться|I'll deal with the tickets.|Я займусь билетами.|travel|irr=dealt/dealt
advance|продвигаться|Technology advances fast.|Технологии быстро развиваются.|it|pair=avanzar
argue|спорить|We argued about the route.|Мы спорили о маршруте.|travel|pair=discutir
base|основывать|The app is based on open data.|Приложение основано на открытых данных.|it|pair=basar
defend|защищать|They defended their title.|Они защитили свой титул.|friends|pair=defender
please|угождать; нравиться|Please sit down.|Пожалуйста, садитесь.|daily|pair=complacer
intend|намереваться|We intend to leave early.|Мы намерены выехать рано.|travel|pair=pretender
study|учиться; изучать|She studies design in Berlin.|Она учится на дизайнера в Берлине.|daily|pair=estudiar
search|искать|I searched everywhere for my keys.|Я везде искал свои ключи.|daily|pair=buscar
travel|путешествовать|We travel a lot in summer.|Летом мы много путешествуем.|travel|dbl pair=viajar
insist|настаивать|He insisted on paying.|Он настоял на том, чтобы заплатить.|friends|pair=insistir
develop|развивать; разрабатывать|They develop mobile apps.|Они разрабатывают мобильные приложения.|it|pair=desarrollar
inform|информировать|Please inform us about any changes.|Пожалуйста, сообщайте нам обо всех изменениях.|travel|pair=informar
feed|кормить|Who feeds the cat while you're away?|Кто кормит кошку, пока вас нет?|daily|irr=fed/fed
produce|производить|The factory produces bicycles.|Фабрика производит велосипеды.|it|pair=producir
spell|писать по буквам|How do you spell your name?|Как пишется ваше имя?|travel|pair=deletrear
ignore|игнорировать|Just ignore the warning.|Просто игнорируй предупреждение.|it|pair=ignorar
engage|вовлекать; заниматься|The game engages the whole family.|Игра увлекает всю семью.|friends
describe|описывать|Can you describe your suitcase?|Можете описать ваш чемодан?|travel|pair=describir
investigate|расследовать|We are investigating the problem.|Мы расследуем проблему.|it|pair=investigar
reveal|раскрывать|She revealed the surprise at dinner.|За ужином она раскрыла сюрприз.|friends|pair=revelar
cast|бросать; отбирать актёров|They cast a famous actor in the film.|В фильме снялся известный актёр.|friends|irr=cast/cast
represent|представлять|She represents our company.|Она представляет нашу компанию.|it|pair=representar
score|набирать очки; забивать|He scored twice in the first half.|Он забил дважды в первом тайме.|friends
behave|вести себя|Behave yourself, please!|Веди себя прилично!|friends
capture|захватывать; запечатлевать|The photo captures the whole evening.|Фото передаёт весь вечер.|friends|pair=capturar
punish|наказывать|Nobody was punished.|Никого не наказали.|daily|pair=castigar
guarantee|гарантировать|We guarantee a refund.|Мы гарантируем возврат денег.|travel|pair=garantizar
desire|желать|I desire only peace and quiet.|Я хочу только покоя и тишины.|daily|pair=desear
impress|производить впечатление|The view impressed everyone.|Вид произвёл на всех впечатление.|travel|pair=impresionar
hunt|охотиться; искать|We hunted for a cheap flight.|Мы искали дешёвый рейс.|travel
identify|определять, опознавать|The app can identify songs.|Приложение умеет определять песни.|it|pair=identificar
tie|завязывать; связывать|Tie your shoes, we are going out.|Завяжи шнурки, мы выходим.|daily
confess|признаваться|I confess, I ate the last piece of cake.|Признаюсь, я съел последний кусок торта.|friends|pair=confesar
disappoint|разочаровывать|The ending disappointed me.|Концовка меня разочаровала.|friends|pair=decepcionar
own|владеть|They own a small hotel.|Им принадлежит небольшой отель.|travel
wipe|вытирать|Wipe the table, please.|Вытри стол, пожалуйста.|friends
record|записывать|We recorded a song together.|Мы вместе записали песню.|friends|pair=grabar
replace|заменять|They replaced the old screen.|Они заменили старый экран.|it|pair=reemplazar
affect|влиять|The strike affects all flights.|Забастовка затрагивает все рейсы.|travel|pair=afectar
apply|применять; подавать заявку|You can apply online.|Подать заявку можно онлайн.|it|pair=aplicar
assure|заверять|I assure you it's safe.|Уверяю вас, это безопасно.|travel|pair=asegurar
attend|посещать|Are you attending the meeting?|Ты будешь на встрече?|it|pair=asistir
chase|гнаться|The dog chased the ball.|Собака гналась за мячом.|friends|pair=perseguir
shop|делать покупки|We shop at the local market.|Мы делаем покупки на местном рынке.|daily|dbl
determine|определять|The weather will determine our plans.|Погода определит наши планы.|travel|pair=determinar
pour|наливать|Let me pour you some tea.|Давай налью тебе чаю.|friends|pair=verter
present|представлять; дарить|She presented the new design to the team.|Она представила новый дизайн команде.|it|pair=presentar
drown|тонуть|Nobody drowned, luckily.|К счастью, никто не утонул.|travel|pair=ahogarse
joke|шутить|He joked about the airline food.|Он пошутил насчёт самолётной еды.|friends|pair=bromear
operate|работать; управлять|The ferry operates every hour.|Паром ходит каждый час.|travel|pair=operar
flow|течь|The river flows through the old town.|Река течёт через старый город.|travel|pair=fluir
limit|ограничивать|Limit the speed to fifty.|Ограничьте скорость до пятидесяти.|travel|pair=limitar
surround|окружать|Mountains surround the hotel.|Отель окружён горами.|travel|pair=rodear
gain|получать, набирать|I gained a lot of experience.|Я приобрёл много опыта.|it|pair=ganar
roll|катить(ся)|The ball rolled under the table.|Мяч закатился под стол.|friends|pair=rodar
recover|восстанавливаться|The system recovered after the restart.|После перезапуска система восстановилась.|it|pair=recuperar
express|выражать|It's hard to express it in English.|Трудно выразить это по-английски.|daily|pair=expresar
approach|приближаться; подходить|The train is approaching the station.|Поезд приближается к станции.|travel|pair=acercarse
trust|доверять|I trust my friends.|Я доверяю своим друзьям.|friends|pair=confiar
link|связывать; ссылаться|I'll link the photos in the chat.|Я скину ссылку на фото в чат.|friends
click|нажимать (мышью)|Click the green button to confirm.|Нажмите зелёную кнопку для подтверждения.|it
respond|отвечать, реагировать|They didn't respond to my message.|Они не ответили на моё сообщение.|friends|pair=responder
satisfy|удовлетворять|The result satisfied everyone.|Результат всех устроил.|daily|pair=satisfacer
propose|предлагать|I propose a toast to our hosts!|Предлагаю тост за хозяев!|friends|pair=proponer
guide|вести, направлять|The app will guide you to the hotel.|Приложение проведёт вас до отеля.|travel|pair=guiar
beg|умолять|I beg you, don't be late.|Умоляю, не опаздывай.|friends|dbl|beg your pardon — извините, что?
occur|происходить, случаться|The error occurs only on Android.|Ошибка возникает только на Android.|it|dbl pair=ocurrir
contain|содержать|Does this dish contain nuts?|В этом блюде есть орехи?|travel|pair=contener
forbid|запрещать|Photos are strictly forbidden.|Фотографировать строго запрещено.|travel|irr=forbade/forbidden dbl pair=prohibir
expose|выставлять; раскрывать|The API exposes user data.|API раскрывает данные пользователей.|it|pair=exponer
retire|уходить на пенсию|My uncle retired last year.|Мой дядя ушёл на пенсию в прошлом году.|daily|pair=jubilarse
relate|относиться; рассказывать|The story relates to my childhood.|Эта история связана с моим детством.|friends
object|возражать|Does anyone object to this plan?|Кто-нибудь возражает против этого плана?|friends
alert|предупреждать|The app will alert you when your train is late.|Приложение предупредит вас, если поезд опаздывает.|travel
aim|целиться; стремиться|We aim to finish by Friday.|Мы стремимся закончить к пятнице.|it
abandon|бросать, покидать|They abandoned the old plan.|Они отказались от старого плана.|it|pair=abandonar
taste|пробовать на вкус; иметь вкус|This soup tastes great.|Этот суп очень вкусный.|friends
explode|взрываться|The crowd exploded with joy.|Толпа взорвалась от радости.|friends
slip|скользить, поскользнуться|Careful, you might slip on the stairs.|Осторожно, на лестнице можно поскользнуться.|travel|dbl
mix|смешивать|Mix the sugar and the eggs.|Смешай сахар и яйца.|friends|pair=mezclar
register|регистрироваться|Please register at the front desk.|Пожалуйста, зарегистрируйтесь на ресепшене.|travel|pair=registrar
succeed|преуспевать|Our plan succeeded.|Наш план удался.|it|pair=tener_éxito
prevent|предотвращать|A good test can prevent many bugs.|Хороший тест предотвращает много багов.|it|pair=prevenir
announce|объявлять|They announced a delay.|Объявили задержку.|travel|pair=anunciar
fit|подходить по размеру|These shoes don't fit me.|Эти туфли мне не по размеру.|daily|dbl
invent|изобретать|Who invented the telephone?|Кто изобрёл телефон?|daily|pair=inventar
recall|вспоминать; отзывать|I can't recall his name.|Не могу вспомнить его имя.|friends
concentrate|сосредоточиваться|I can't concentrate in this noise.|Не могу сосредоточиться в таком шуме.|it|pair=concentrarse
demand|требовать|Customers demand a refund.|Клиенты требуют возврата денег.|travel|pair=exigir
load|грузить; загружаться|The page takes long to load.|Страница долго загружается.|it
regard|считать|I regard her as a good friend.|Я считаю её хорошей подругой.|friends
stretch|растягивать(ся)|Stretch your legs on the flight.|Разомните ноги во время полёта.|travel
shine|светить, сиять|The sun shines all day in July.|В июле солнце светит весь день.|travel|irr=shone/shone
locate|находить; располагать|The hotel is located near the beach.|Отель находится рядом с пляжем.|travel|pair=ubicar
attract|привлекать|The festival attracts thousands of tourists.|Фестиваль привлекает тысячи туристов.|travel|pair=atraer
achieve|достигать|We achieved our goal.|Мы достигли своей цели.|it|pair=lograr
design|проектировать; разрабатывать дизайн|She designs mobile interfaces.|Она проектирует мобильные интерфейсы.|it|pair=diseñar
resist|сопротивляться; устоять|I can't resist chocolate.|Не могу устоять перед шоколадом.|friends|pair=resistir
sort|сортировать|Sort the files by date.|Отсортируй файлы по дате.|it
inspire|вдохновлять|The trip inspired her to paint.|Поездка вдохновила её на живопись.|travel|pair=inspirar
arrange|организовывать; договариваться|I'll arrange a taxi for you.|Я организую для вас такси.|travel|pair=organizar
proceed|продолжать; переходить|Proceed to gate twelve.|Проследуйте к выходу двенадцать.|travel|pair=proceder
track|отслеживать|You can track your parcel online.|Посылку можно отслеживать онлайн.|it|pair=rastrear
organize|организовывать|Who is organizing the party?|Кто организует вечеринку?|friends|pair=organizar
''', 'en', 'verb')
