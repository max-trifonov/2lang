// Озвучка слов и фраз (D-13, D-36): записанный файл из поставки → голос устройства →
// онлайн-синтез. Голоса устройства может не быть вовсе (Chromium/Electron на Linux, Android
// WebView), поэтому кнопка озвучки не зависит от него, а источник выбирается при нажатии.

/** Регион по умолчанию для языка: испанский — Испания, английский — США. */
const DEFAULT_REGION: Record<string, string> = { es: 'es-ES', en: 'en-US' }

export interface VoiceLike {
  lang: string
  name: string
  localService?: boolean
}

/** Голос для языка: регион по умолчанию → любой того же языка (локальный выше) → нет. */
export function pickVoice<V extends VoiceLike>(voices: readonly V[], lang: string): V | null {
  const norm = (l: string) => l.replace('_', '-').toLowerCase()
  const wanted = norm(DEFAULT_REGION[lang] ?? lang)
  const same = voices.filter((v) => norm(v.lang).split('-')[0] === lang)
  const local = (v: V) => (v.localService ? 0 : 1)
  return (
    same.find((v) => norm(v.lang) === wanted && v.localService) ??
    same.find((v) => norm(v.lang) === wanted) ??
    [...same].sort((a, b) => local(a) - local(b))[0] ??
    null
  )
}

/** Сервис отдаёт 404 на запрос с Referer — в index.html политика referrer same-origin. */
const ONLINE_MAX = 200

/** URL онлайн-синтеза; длинный текст сервис не принимает — null. */
export function onlineSpeechUrl(text: string, lang: string): string | null {
  const q = text.trim()
  if (!q || q.length > ONLINE_MAX) return null
  const params = new URLSearchParams({ ie: 'UTF-8', client: 'tw-ob', tl: lang, q })
  return `https://translate.google.com/translate_tts?${params}`
}

const synth = () => (typeof window !== 'undefined' ? window.speechSynthesis : undefined)

let voiceList: SpeechSynthesisVoice[] = []

/** Голоса грузятся асинхронно (Chrome): ждём voiceschanged, но не дольше секунды. */
function voices(): Promise<SpeechSynthesisVoice[]> {
  const s = synth()
  if (!s) return Promise.resolve([])
  voiceList = s.getVoices()
  if (voiceList.length) return Promise.resolve(voiceList)
  return new Promise((resolve) => {
    const done = () => resolve((voiceList = s.getVoices()))
    s.addEventListener('voiceschanged', done, { once: true })
    setTimeout(done, 1000)
  })
}

void voices()

export async function canSpeak(lang: string): Promise<boolean> {
  return pickVoice(await voices(), lang) !== null
}

let playing: HTMLAudioElement | null = null
/** Ссылка держится, пока фраза звучит: Chrome иначе собирает её и теряет события. */
let utterance: SpeechSynthesisUtterance | null = null

function stop(): void {
  playing?.pause()
  playing = null
  const s = synth()
  if (s && (s.speaking || s.pending)) s.cancel()
  utterance = null
}

async function playUrl(url: string): Promise<boolean> {
  const audio = new Audio(url)
  playing = audio
  try {
    await audio.play()
    return true
  } catch {
    if (playing === audio) playing = null
    return false
  }
}

/** Голос устройства; true — речь началась. Молчащий движок отсекается по таймауту. */
function speakVoice(text: string, lang: string): Promise<boolean> {
  const s = synth()
  const voice = pickVoice(voiceList, lang)
  if (!s || !voice) return Promise.resolve(false)
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    utterance = u
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.9
    const timer = setTimeout(() => finish(false), 2000)
    function finish(started: boolean): void {
      clearTimeout(timer)
      if (!started && utterance === u) {
        s?.cancel()
        utterance = null
      }
      resolve(started)
    }
    u.onstart = () => finish(true)
    u.onerror = () => finish(false)
    s.resume() // Chrome может «застрять» на паузе после сна вкладки
    s.speak(u)
  })
}

export type SpeechSource = 'file' | 'voice' | 'online' | 'none'

/**
 * Произносит текст: запись `recorded` → голос устройства → онлайн-синтез. Новое нажатие
 * прерывает предыдущее. Файл запускается без ожиданий до него: Safari требует жеста.
 */
export async function speak(text: string, lang: string, recorded?: string): Promise<SpeechSource> {
  stop()
  if (recorded && (await playUrl(recorded))) return 'file'
  if (await speakVoice(text, lang)) return 'voice'
  const online = onlineSpeechUrl(text, lang)
  if (online && (await playUrl(online))) return 'online'
  return 'none'
}
