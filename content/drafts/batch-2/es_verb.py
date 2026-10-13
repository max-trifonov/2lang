# ИИ-черновик (D-25): испанские глаголы партии 2 — слова уроков (LNG-S1-018). Формы, которых нет
# в F, сборка выводит по правилам спряжения.
P = lambda s: s.split()

V = {
 'probar': dict(tr='пробовать; проверять, тестировать', irr=1, F=dict(present=P('pruebo pruebas prueba probamos probáis prueban')),
   ex=[('¿Puedo probar la paella?', 'Можно попробовать паэлью?', 'travel'), ('Voy a probar la nueva versión.', 'Я протестирую новую версию.', 'it')]),
 'guardar': dict(tr='сохранять; хранить', ex=[('¿Me puede guardar la maleta?', 'Можете подержать мой чемодан?', 'travel'), ('Guarda los cambios antes de salir.', 'Сохрани изменения перед выходом.', 'it')]),
}
