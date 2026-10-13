# ИИ-черновик (D-25): английские существительные партии 3 — слова уроков (LNG-S1-020).
def N(tr, pl, ex1, ex2, pair=None, note=None):
    d = dict(tr=tr, ex=[ex1, ex2])
    if pl: d['F'] = {'plural': pl}
    if pair: d['pair'] = 'es:' + pair
    if note: d['note'] = note
    return d

V = {
 'hotel': N('отель, гостиница', 'hotels', ('The hotel is close to the beach.', 'Отель рядом с пляжем.', 'travel'), ("I'm working from the hotel this week.", 'На этой неделе я работаю из отеля.', 'it'), 'hotel'),
 'flight': N('рейс, полёт', 'flights', ('My flight leaves at six.', 'Мой рейс вылетает в шесть.', 'travel'), ('I answered emails during the flight.', 'Я отвечал на письма во время полёта.', 'it'), 'vuelo'),
 'bus': N('автобус', 'buses', ('The bus to the airport leaves every hour.', 'Автобус в аэропорт ходит каждый час.', 'travel'), ('I read the docs on the bus.', 'Я читаю документацию в автобусе.', 'it')),
 'corner': N('угол', 'corners', ('Turn left at the corner.', 'Поверните налево на углу.', 'travel'), ('Check the icon in the top right corner.', 'Посмотри на значок в правом верхнем углу.', 'it')),
 'station': N('вокзал, станция', 'stations', ('How do I get to the station?', 'Как пройти к вокзалу?', 'travel'), ('The office is near the metro station.', 'Офис рядом со станцией метро.', 'it'), 'estación'),
 'dish': N('блюдо; тарелка', 'dishes', ('Could you recommend a local dish?', 'Посоветуете местное блюдо?', 'travel'), ('We had a team lunch with lots of dishes.', 'У нас был командный обед с кучей блюд.', 'it')),
 'bill': N('счёт (к оплате)', 'bills', ('Could we have the bill, please?', 'Можно счёт, пожалуйста?', 'travel'), ('The cloud bill is too high this month.', 'Счёт за облако в этом месяце слишком большой.', 'it'), 'cuenta', 'В американском английском в ресторане — check'),
 'tip': N('чаевые; совет', 'tips', ('Is the tip included in the bill?', 'Чаевые включены в счёт?', 'travel'), ('Thanks for the tip about the shortcut.', 'Спасибо за совет насчёт сочетания клавиш.', 'it')),
 'price': N('цена', 'prices', ('The price includes breakfast.', 'В цену входит завтрак.', 'travel'), ('The price of the license went up.', 'Цена лицензии выросла.', 'it')),
 'weekend': N('выходные', 'weekends', ("We're spending the weekend in Madrid.", 'Мы проводим выходные в Мадриде.', 'travel'), ("Don't deploy on the weekend.", 'Не деплой на выходных.', 'it'), note='at the weekend (брит.) / on the weekend (амер.)'),
 'trip': N('поездка', 'trips', ('How was your trip?', 'Как съездил?', 'travel'), ('I have a business trip next week.', 'На следующей неделе у меня командировка.', 'it'), note='business trip — командировка'),
 'weather': N('погода', None, ('What will the weather be like tomorrow?', 'Какая завтра будет погода?', 'travel'), ('The weather app shows the wrong city.', 'Приложение погоды показывает не тот город.', 'it'), note='Неисчисляемое: без a — nice weather, а не a nice weather'),
 'rain': N('дождь', None, ('They expect rain tomorrow.', 'Завтра ожидается дождь.', 'travel'), ('The office roof leaks in the rain.', 'В дождь крыша офиса протекает.', 'it')),
 'view': N('вид; точка зрения', 'views', ('We would like a room with a sea view.', 'Мы бы хотели номер с видом на море.', 'travel'), ('Switch to the list view.', 'Переключись на вид списком.', 'it')),
 'bug': N('баг, ошибка в программе; насекомое', 'bugs', ('There are bugs in the room!', 'В номере насекомые!', 'travel'), ('I found a bug in the login form.', 'Я нашёл баг в форме входа.', 'it')),
 'meeting': N('встреча, совещание', 'meetings', ('Our meeting point is the hotel lobby.', 'Место встречи — холл отеля.', 'travel'), ('The meeting starts at ten.', 'Совещание начинается в десять.', 'it'), 'reunión'),
 'schedule': N('расписание, график', 'schedules', ('Where can I see the train schedule?', 'Где посмотреть расписание поездов?', 'travel'), ('We are behind schedule.', 'Мы отстаём от графика.', 'it'), note='on schedule — по графику, behind schedule — с отставанием'),
 'version': N('версия', 'versions', ('Is there an English version of the menu?', 'Есть меню на английском?', 'travel'), ('Update to the latest version.', 'Обнови до последней версии.', 'it'), 'versión'),
 'task': N('задача, задание', 'tasks', ('Packing is my least favourite task.', 'Сборы — моё самое нелюбимое занятие.', 'travel'), ('I have three tasks for today.', 'У меня на сегодня три задачи.', 'it'), 'tarea'),
 'client': N('клиент, заказчик', 'clients', ('The hotel has many regular clients.', 'У отеля много постоянных клиентов.', 'travel'), ('The client wants a demo on Monday.', 'Клиент хочет демо в понедельник.', 'it'), 'cliente'),
 'request': N('запрос, просьба', 'requests', ('We have a special request: a quiet room.', 'У нас особая просьба: тихий номер.', 'travel'), ('The client sent a new request.', 'Клиент прислал новый запрос.', 'it')),
 'solution': N('решение (задачи)', 'solutions', ('The easiest solution is to take a taxi.', 'Самое простое решение — взять такси.', 'travel'), ('Can you explain your solution?', 'Можешь объяснить своё решение?', 'it')),
 'system': N('система', 'systems', ('The metro system is easy to use.', 'Метро удобное.', 'travel'), ('The system has crashed twice.', 'Система упала дважды.', 'it')),
 'file': N('файл; папка с документами', 'files', ('Keep a copy of the ticket file.', 'Сохрани копию файла с билетом.', 'travel'), ('Could you share the file with me?', 'Можешь дать мне доступ к файлу?', 'it'), 'archivo'),
 'colleague': N('коллега', 'colleagues', ('I travel with a colleague.', 'Я еду с коллегой.', 'travel'), ('My colleague is on vacation.', 'Мой коллега в отпуске.', 'it')),
 'project': N('проект', 'projects', ('Our trip is a family project.', 'Наша поездка — семейный проект.', 'travel'), ("I'm working on a new project.", 'Я работаю над новым проектом.', 'it'), 'proyecto'),
 'manager': N('руководитель, менеджер', 'managers', ('I want to speak to the manager.', 'Я хочу поговорить с управляющим.', 'travel'), ('Our manager usually runs the meeting.', 'Совещание обычно ведёт наш руководитель.', 'it')),
 'data': N('данные', None, ('Roaming data is expensive.', 'Мобильный интернет в роуминге дорогой.', 'travel'), ('The data is correct now.', 'Теперь данные верные.', 'it'), note='В IT обычно неисчисляемое: the data is, а не the data are'),
}
