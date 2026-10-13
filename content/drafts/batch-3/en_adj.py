# ИИ-черновик (D-25): английские прилагательные партии 3 (LNG-S1-020). c = (comparative, superlative).
def J(tr, c, ex1, ex2, pair=None, note=None):
    d = dict(tr=tr, ex=[ex1, ex2])
    if c: d['F'] = {'comparative': c[0], 'superlative': c[1]}
    if pair: d['pair'] = 'es:' + pair
    if note: d['note'] = note
    return d

V = {
 'local': J('местный', None, ('Could you recommend a local dish?', 'Посоветуете местное блюдо?', 'travel'), ('Run the tests on your local machine.', 'Запусти тесты на своей машине.', 'it')),
 'extra': J('дополнительный, лишний', None, ('Is there an extra charge for the bag?', 'За сумку есть доплата?', 'travel'), ('We need an extra day for testing.', 'Нам нужен лишний день на тестирование.', 'it')),
 'expensive': J('дорогой', ('more expensive', 'most expensive'), ("It's too expensive for us.", 'Для нас это слишком дорого.', 'travel'), ('The new server is more expensive.', 'Новый сервер дороже.', 'it')),
 'cheap': J('дешёвый', ('cheaper', 'cheapest'), ('The bus is cheaper than a taxi.', 'Автобус дешевле такси.', 'travel'), ('Cheap hosting is not always reliable.', 'Дешёвый хостинг не всегда надёжен.', 'it')),
 'due': J('ожидаемый к сроку; должный', None, ('The train is due at five.', 'Поезд должен прибыть в пять.', 'travel'), ('The task is due on Friday.', 'Срок задачи — пятница.', 'it'), note='be due — «срок — …», «ожидается»: The report is due tomorrow'),
 'correct': J('правильный, верный', None, ('Is this the correct platform?', 'Это правильная платформа?', 'travel'), ('The data is correct now.', 'Теперь данные верные.', 'it')),
}
