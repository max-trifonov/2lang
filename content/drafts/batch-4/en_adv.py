# ИИ-черновик (D-25): английские наречия партии 4 (LNG-S1-032) — остаток каркаса.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dsl import parse

V = parse('''
somehow|как-нибудь; каким-то образом|Somehow we missed the bus.|Каким-то образом мы упустили автобус.|travel|
hard|усердно; сильно|We worked hard all week.|Мы всю неделю усердно работали.|it|
truly|поистине|The view was truly amazing.|Вид был по-настоящему потрясающим.|travel|
honestly|честно говоря|Honestly, I prefer the first hotel.|Честно говоря, мне больше нравится первый отель.|friends|
perfectly|идеально|Everything worked perfectly.|Всё сработало идеально.|it|
nowhere|нигде, никуда|There is nowhere to sit.|Сесть негде.|travel|
deeply|глубоко|I'm deeply sorry for the delay.|Мне очень жаль из-за задержки.|travel|
surely|несомненно, наверняка|Surely there's a train at nine?|Наверняка есть поезд в девять?|travel|
lately|в последнее время|I've been tired lately.|Я в последнее время устаю.|friends|
slowly|медленно|Could you speak more slowly?|Не могли бы вы говорить медленнее?|travel|
easily|легко|You can easily walk there.|Туда легко дойти пешком.|travel|
basically|в основном, по сути|Basically, we need one more day.|По сути, нам нужен ещё один день.|it|
personally|лично|Personally, I like the old town.|Лично мне нравится старый город.|friends|
barely|едва, еле|I barely slept on the plane.|Я едва поспал в самолёте.|travel|
lower|ниже|Is there a lower price?|Есть ли цена пониже?|travel|
downstairs|внизу, вниз|Breakfast is served downstairs.|Завтрак подают внизу.|travel|
higher|выше|The price is higher in summer.|Летом цена выше.|travel|
eventually|в конце концов|Eventually we found the hotel.|В конце концов мы нашли отель.|travel|
carefully|осторожно, тщательно|Read the instructions carefully.|Внимательно прочитайте инструкцию.|it|
badly|плохо|The bus badly needs repair.|Автобус сильно нуждается в ремонте.|travel|
aside|в сторону|Let's put the phones aside.|Давай отложим телефоны.|friends|
extremely|чрезвычайно|It was extremely hot.|Было чрезвычайно жарко.|travel|
literally|буквально|It was literally the best meal ever.|Это был буквально лучший обед в жизни.|friends|
properly|как следует|The app isn't working properly.|Приложение работает неправильно.|it|
mostly|в основном|We mostly eat out.|Мы в основном едим вне дома.|travel|
directly|прямо, напрямую|The bus goes directly to the airport.|Автобус идёт напрямую в аэропорт.|travel|
someday|когда-нибудь|Someday I'll visit Japan.|Когда-нибудь я побываю в Японии.|friends|
therefore|поэтому|It rained; therefore, we stayed in.|Шёл дождь, поэтому мы остались дома.|travel|
wide|широко|Open your mouth wide.|Откройте рот шире.|daily|
sometime|когда-нибудь, как-нибудь|Let's meet sometime next week.|Давай встретимся как-нибудь на следующей неделе.|friends|
fully|полностью|The hotel is fully booked.|Отель полностью забронирован.|travel|
previously|ранее|The room was previously a library.|Раньше в этой комнате была библиотека.|travel|
normally|обычно|Normally we have breakfast at eight.|Обычно мы завтракаем в восемь.|travel|
highly|высоко; весьма|The restaurant is highly recommended.|Ресторан настоятельно рекомендуют.|travel|
entirely|полностью, целиком|I entirely agree.|Я полностью согласен.|friends|
naturally|естественно, конечно|Naturally, we said yes.|Конечно, мы согласились.|friends|
online|онлайн|I booked the tickets online.|Я купил билеты онлайн.|travel|
heavily|сильно, тяжело|It rained heavily all night.|Всю ночь шёл сильный дождь.|travel|
quietly|тихо|The kids are playing quietly.|Дети тихо играют.|travel|
daily|ежедневно|The museum is open daily.|Музей открыт ежедневно.|travel|
hopefully|надеюсь; хочется надеяться|Hopefully the weather will be nice.|Надеюсь, погода будет хорошей.|travel|
particularly|особенно|I particularly liked the old town.|Мне особенно понравился старый город.|travel|
terribly|ужасно; очень|I'm terribly sorry!|Мне ужасно жаль!|friends|
anytime|в любое время|Call me anytime.|Звони мне в любое время.|friends|
afterwards|потом, после|We had dinner and walked afterwards.|Мы поужинали, а потом погуляли.|friends|
throughout|на протяжении|It was sunny throughout the trip.|Всю поездку было солнечно.|travel|
practically|практически|It's practically free.|Это практически бесплатно.|travel|
frankly|откровенно говоря|Frankly, I didn't like the film.|Откровенно говоря, фильм мне не понравился.|friends|
incredibly|невероятно|The food was incredibly good.|Еда была невероятно вкусной.|travel|
officially|официально|The museum is officially closed.|Музей официально закрыт.|travel|
nearby|поблизости|Is there a pharmacy nearby?|Поблизости есть аптека?|travel|
thus|таким образом|The tickets sold out; thus, we took the bus.|Билеты раскупили, так что мы поехали на автобусе.|travel|
meantime|тем временем (in the meantime)|In the meantime, have some coffee.|А пока выпейте кофе.|friends|
slightly|слегка|The train is slightly late.|Поезд немного опаздывает.|travel|
precisely|точно|The train leaves at precisely nine.|Поезд отправляется ровно в девять.|travel|
merely|всего лишь|It was merely a mistake.|Это была всего лишь ошибка.|it|
technically|технически|Technically, the room is ready.|Формально номер готов.|it|
meanwhile|между тем|Meanwhile, the others were waiting outside.|Тем временем остальные ждали на улице.|friends|
softly|тихо, мягко|She spoke softly.|Она говорила тихо.|friends|
safely|безопасно|We arrived safely.|Мы добрались благополучно.|travel|
constantly|постоянно|The app constantly crashes.|Приложение постоянно падает.|it|
nicely|хорошо, приятно|The room is nicely decorated.|Номер приятно оформлен.|travel|
happily|счастливо; охотно|I'll happily help you.|Я с удовольствием помогу.|friends|
awfully|ужасно; очень|I'm awfully sorry to be late.|Мне ужасно жаль, что я опоздал.|friends|
differently|по-другому|Everyone does it differently.|Каждый делает это по-своему.|daily|
shortly|вскоре|The train will arrive shortly.|Поезд прибудет в ближайшее время.|travel|
halfway|на полпути|We stopped halfway for lunch.|На полпути мы остановились пообедать.|travel|
necessarily|обязательно|It doesn't necessarily mean it's cheap.|Это необязательно означает, что дёшево.|travel|
nowadays|в наши дни|Nowadays everyone uses a smartphone.|В наши дни у всех есть смартфон.|daily|
gently|нежно, осторожно|Handle the box gently.|Обращайтесь с коробкой осторожно.|travel|
backwards|назад, задом наперёд|Don't walk backwards.|Не иди задом наперёд.|daily|
closely|внимательно; близко|Watch closely, please.|Смотрите внимательно, пожалуйста.|daily|
fairly|довольно, справедливо|The room is fairly big.|Номер довольно большой.|travel|
specifically|конкретно|I asked specifically for a quiet room.|Я специально просил тихий номер.|travel|
alike|одинаково|The two hotels look alike.|Два отеля выглядят одинаково.|travel|
physically|физически|I was physically tired.|Я физически устал.|travel|
overnight|на ночь, ночью|We stayed overnight in Seville.|Мы остались на ночь в Севилье.|travel|
louder|громче|Please speak louder.|Говорите, пожалуйста, громче.|travel|
elsewhere|в другом месте|Let's go elsewhere for dinner.|Давай поужинаем в другом месте.|friends|
luckily|к счастью|Luckily, we found a taxi.|К счастью, мы нашли такси.|travel|
kindly|любезно|Kindly wait here.|Любезно подождите здесь.|travel|
accidentally|случайно|I accidentally deleted the file.|Я случайно удалил файл.|it|
anyways|в любом случае (разг.)|Anyways, let's go.|Ладно, пойдём.|friends|
somewhat|несколько, отчасти|The hotel was somewhat noisy.|В отеле было довольно шумно.|travel|
strictly|строго|Smoking is strictly forbidden.|Курение строго запрещено.|travel|
fortunately|к счастью|Fortunately, nobody was hurt.|К счастью, никто не пострадал.|travel|
loudly|громко|They sang loudly.|Они громко пели.|friends|
anyhow|так или иначе|Anyhow, thanks for your help.|Так или иначе, спасибо за помощь.|friends|
''', 'en', 'adv')
