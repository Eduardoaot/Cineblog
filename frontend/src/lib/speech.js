import { useEffect, useState } from 'react'

// Lector de voz único para toda la app: solo un mensaje suena a la vez.
const listeners = new Set()
let state = { id: null, paused: false }
const setState = (next) => {
  state = { ...state, ...next }
  listeners.forEach((l) => l(state))
}

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  const prefs = ['es-MX', 'es-US', 'es-419', 'es-ES']
  for (const lang of prefs) {
    const v = voices.find((x) => x.lang === lang || x.lang.replace('_', '-') === lang)
    if (v) return v
  }
  return voices.find((v) => v.lang.toLowerCase().startsWith('es')) ?? null
}

export function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[*_`#>~]/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Chrome corta las frases largas, así que se divide el texto en trozos cortos
function chunks(text) {
  const sentences = text.split(/(?<=[.!?:;])\s+/)
  const out = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > 180 && current) {
      out.push(current.trim())
      current = ''
    }
    current += s + ' '
  }
  if (current.trim()) out.push(current.trim())
  return out
}

export function speak(id, markdown, rate = 1) {
  if (!speechSupported) return
  const synth = window.speechSynthesis
  synth.cancel()
  const parts = chunks(plainText(markdown))
  const voice = pickVoice()
  setState({ id, paused: false })
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part)
    u.lang = voice?.lang ?? 'es-MX'
    if (voice) u.voice = voice
    u.rate = rate
    if (i === parts.length - 1) {
      u.onend = () => state.id === id && setState({ id: null, paused: false })
    }
    u.onerror = () => state.id === id && setState({ id: null, paused: false })
    synth.speak(u)
  })
}

export function stopSpeech() {
  if (!speechSupported) return
  window.speechSynthesis.cancel()
  setState({ id: null, paused: false })
}

export function togglePause() {
  if (!speechSupported || !state.id) return
  if (state.paused) window.speechSynthesis.resume()
  else window.speechSynthesis.pause()
  setState({ paused: !state.paused })
}

export function useSpeech() {
  const [s, set] = useState(state)
  useEffect(() => {
    listeners.add(set)
    // Algunas voces se cargan de forma asíncrona
    if (speechSupported) window.speechSynthesis.getVoices()
    return () => listeners.delete(set)
  }, [])
  return s
}
