// Уроки, формат v1 — .flow/lesson-format.md; вид words — LNG-S1-008.
export {
  EXERCISE_TYPES,
  LESSON_KINDS,
  lessonKey,
  type Exercise,
  type Lesson,
  type Letter,
  type ReadingRule,
  type SoundLesson,
  type WordsLesson,
} from './domain/types'
export {
  checkLessonFile,
  validateLesson,
  validateLessonSet,
  type LessonCheckResult,
  type NamedLesson,
} from './domain/validate'
export { loadLessons } from './loader'
export { rulesFor, rulesIndex, type RuleHint } from './rules'
export { checkAnswer, type Checked, type Verdict } from './player/answer'
export { scramble, seeded, splitBlocks } from './player/blocks'
export { nextLesson, type NextLesson } from './player/next'
export { lessonPath, type LessonPath, type LessonStatus, type PathItem } from './path'
export {
  buildPractice,
  hearTask,
  introSteps,
  lessonWords,
  pickTask,
  recallTask,
  recognizeTask,
  shortTranslation,
  type IntroStep,
  type Task,
} from './player/practice'
export {
  answer as answerPractice,
  current as currentTask,
  finished as practiceFinished,
  score as practiceScore,
  startPractice,
  type Practice,
} from './player/session'
export { useLessonProgressStore, type LessonProgress } from './progress'
export { default as PracticeTask } from './ui/PracticeTask.vue'
export { default as WordIntro } from './ui/WordIntro.vue'
export { phraseOfDay, type PhraseOfDay } from './phrase'
export { audioUrl, playSound } from './audio'
export {
  alphabetOf,
  buildSoundPractice,
  soundLessons,
  spellNames,
  type SoundTask,
} from './player/sound'
export { default as SoundButton } from './ui/SoundButton.vue'
export { default as SoundPractice } from './ui/SoundTask.vue'
