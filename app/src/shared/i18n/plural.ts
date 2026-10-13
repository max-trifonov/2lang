// Формы множественного числа в словаре — через «|» в порядке категорий CLDR:
// ru — «one | few | many» (1 урок | 2 урока | 5 уроков), прочие — «one | other».
// Категорию выбирает Intl.PluralRules: 11–14, 21, дробные — без своей арифметики.
const FORMS: Record<string, readonly Intl.LDMLPluralRule[]> = {
  ru: ['one', 'few', 'many'],
}
const DEFAULT_FORMS: readonly Intl.LDMLPluralRule[] = ['one', 'other']

export function pluralIndex(locale: string, choice: number, choicesLength: number): number {
  const forms = FORMS[locale] ?? DEFAULT_FORMS
  const category = new Intl.PluralRules(locale).select(choice)
  let index = forms.indexOf(category)
  // Категории вне набора: дробные в ru («1,5 урока») — форма few, many в es (миллионы) — other.
  if (index === -1) index = category === 'other' && locale === 'ru' ? 1 : forms.length - 1
  return Math.min(index, choicesLength - 1)
}

export function pluralRulesFor(locales: readonly string[]) {
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      (choice: number, choicesLength: number) => pluralIndex(locale, choice, choicesLength),
    ]),
  )
}
