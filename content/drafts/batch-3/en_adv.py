# ИИ-черновик (D-25): английские наречия партии 3 (LNG-S1-020).
def A(tr, ex1, ex2, pair=None, note=None):
    d = dict(tr=tr, ex=[ex1, ex2])
    if pair: d['pair'] = 'es:' + pair
    if note: d['note'] = note
    return d

V = {
 'unfortunately': A('к сожалению', ('Unfortunately, the museum is closed.', 'К сожалению, музей закрыт.', 'travel'), ('Unfortunately, the build failed.', 'К сожалению, сборка упала.', 'it')),
 'nearly': A('почти, чуть не', ('I nearly missed the bus.', 'Я чуть не опоздал на автобус.', 'travel'), ("I've nearly finished the task.", 'Я почти закончил задачу.', 'it'), note='nearly + глагол в прошедшем — «чуть не»: I nearly fell'),
 'abroad': A('за границей, за границу', ("We're going abroad this summer.", 'Этим летом мы едем за границу.', 'travel'), ('Half of our team works abroad.', 'Половина нашей команды работает за границей.', 'it'), note='Без предлога: go abroad, а не go to abroad'),
 'currently': A('в настоящее время, сейчас', ('The pool is currently closed.', 'Бассейн сейчас закрыт.', 'travel'), ("We're currently testing the new version.", 'Сейчас мы тестируем новую версию.', 'it')),
 'recently': A('недавно, в последнее время', ('Prices have gone up recently.', 'В последнее время цены выросли.', 'travel'), ('The system has crashed twice recently.', 'В последнее время система упала дважды.', 'it')),
}
