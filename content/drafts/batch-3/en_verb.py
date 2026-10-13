# ИИ-черновик (D-25): английские глаголы партии 3 — слова уроков en-travel-*, en-it-* (LNG-S1-020).
# f = (s, past, participle, ing).
def E(tr, f, ex1, ex2, pair=None, irr=False, note=None):
    d = dict(tr=tr, ex=[ex1, ex2], F=dict(zip(('s', 'past', 'participle', 'ing'), f)))
    if irr: d['irr'] = 1
    if pair: d['pair'] = 'es:' + pair
    if note: d['note'] = note
    return d

V = {
 'confirm': E('подтверждать', ('confirms', 'confirmed', 'confirmed', 'confirming'), ('Could you confirm my booking?', 'Не могли бы вы подтвердить мою бронь?', 'travel'), ('Can you confirm the fix works?', 'Можешь подтвердить, что исправление работает?', 'it')),
 'cancel': E('отменять', ('cancels', 'cancelled', 'cancelled', 'cancelling'), ('Our flight has been cancelled.', 'Наш рейс отменили.', 'travel'), ('We cancelled the meeting.', 'Мы отменили встречу.', 'it'), note='Британское cancelled, американское canceled'),
 'recommend': E('рекомендовать, советовать', ('recommends', 'recommended', 'recommended', 'recommending'), ('Could you recommend a good restaurant?', 'Посоветуете хороший ресторан?', 'travel'), ('I recommend a code review first.', 'Советую сначала сделать ревью кода.', 'it'), note='recommend something; «советую сделать» — recommend doing или recommend that you do'),
 'include': E('включать (в состав)', ('includes', 'included', 'included', 'including'), ('Is breakfast included?', 'Завтрак включён?', 'travel'), ('The release includes three new features.', 'Релиз включает три новые функции.', 'it')),
 'afford': E('позволить себе (по деньгам, времени)', ('affords', 'afforded', 'afforded', 'affording'), ("We can't afford a taxi.", 'Мы не можем позволить себе такси.', 'travel'), ("We can't afford another delay.", 'Мы не можем позволить себе ещё одну задержку.', 'it'), note='Обычно с can / can\'t: can afford, can\'t afford'),
 'spend': E('тратить; проводить (время)', ('spends', 'spent', 'spent', 'spending'), ('We spent a week in Spain.', 'Мы провели неделю в Испании.', 'travel'), ('I spent all day on this bug.', 'Я потратил весь день на этот баг.', 'it'), irr=True),
 'expect': E('ожидать, рассчитывать', ('expects', 'expected', 'expected', 'expecting'), ('They expect rain tomorrow.', 'Завтра ожидается дождь.', 'travel'), ('We expect the release next week.', 'Мы ожидаем релиз на следующей неделе.', 'it'), 'esperar'),
 'complain': E('жаловаться', ('complains', 'complained', 'complained', 'complaining'), ('I want to complain about the noise.', 'Я хочу пожаловаться на шум.', 'travel'), ('Users complain about the slow app.', 'Пользователи жалуются на медленное приложение.', 'it'), note='complain about something, complain to someone'),
 'fix': E('чинить, исправлять', ('fixes', 'fixed', 'fixed', 'fixing'), ('Can you fix the air conditioning?', 'Можете починить кондиционер?', 'travel'), ('Have you fixed the bug yet?', 'Ты уже исправил баг?', 'it')),
 'discuss': E('обсуждать', ('discusses', 'discussed', 'discussed', 'discussing'), ("Let's discuss the plan for tomorrow.", 'Давай обсудим план на завтра.', 'travel'), ("Let's discuss it at the meeting.", 'Обсудим это на встрече.', 'it'), note='Без about: discuss the plan, а не discuss about the plan'),
 'release': E('выпускать (релиз); отпускать', ('releases', 'released', 'released', 'releasing'), ('The hotel released our room early.', 'Отель рано освободил наш номер.', 'travel'), ('We release a new version every month.', 'Мы выпускаем новую версию каждый месяц.', 'it')),
 'finish': E('заканчивать', ('finishes', 'finished', 'finished', 'finishing'), ('The tour finishes at the museum.', 'Экскурсия заканчивается у музея.', 'travel'), ('I need to finish this task by Friday.', 'Мне нужно закончить эту задачу к пятнице.', 'it'), 'terminar'),
 'require': E('требовать, нуждаться', ('requires', 'required', 'required', 'requiring'), ('This trip requires a visa.', 'Для этой поездки нужна виза.', 'travel'), ('This change requires a new test.', 'Это изменение требует нового теста.', 'it'), note='Официальнее, чем need: The job requires…'),
 'explain': E('объяснять', ('explains', 'explained', 'explained', 'explaining'), ('Can you explain the map to me?', 'Можете объяснить мне карту?', 'travel'), ('Can you explain your solution to the team?', 'Можешь объяснить своё решение команде?', 'it'), note='explain something to someone — не explain me: Explain it to me'),
 'crash': E('падать (о программе); разбиться', ('crashes', 'crashed', 'crashed', 'crashing'), ('The booking site crashed again.', 'Сайт бронирования опять упал.', 'travel'), ('The app crashes when I open the camera.', 'Приложение падает, когда я открываю камеру.', 'it')),
 'share': E('делиться; давать доступ', ('shares', 'shared', 'shared', 'sharing'), ('We can share a taxi.', 'Можем взять одно такси на двоих.', 'travel'), ('Could you share the file with me?', 'Можешь дать мне доступ к файлу?', 'it'), note='share something with someone'),
 'manage': E('управлять, руководить; справляться', ('manages', 'managed', 'managed', 'managing'), ('We managed to find a hotel.', 'Нам удалось найти отель.', 'travel'), ('She manages two teams.', 'Она руководит двумя командами.', 'it'), note='manage to do — суметь, удаться'),
 'solve': E('решать (задачу, проблему)', ('solves', 'solved', 'solved', 'solving'), ('The receptionist solved our problem.', 'Администратор решил нашу проблему.', 'travel'), ('We solved the problem with the data.', 'Мы решили проблему с данными.', 'it')),
}
