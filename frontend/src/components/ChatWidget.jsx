import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Markdown from 'react-markdown'
import { blogs, buildContext, getBlog } from '../lib/blogs'
import { askBlog, checkHealth, prepareBlog } from '../lib/api'
import { speak, speechSupported, stopSpeech, togglePause, useSpeech } from '../lib/speech'
import Poster from './Poster'
import {
  IconBot, IconCheck, IconChevron, IconClose, IconCopy, IconPause, IconPlay, IconSearch, IconSend, IconStop, IconTrash, IconVolume,
} from './Icons'

const SUGGESTIONS = [
  'Resúmeme lo que se dice',
  '¿La película es buena?',
  '¿Tú qué opinas?',
  '¿Cuáles son las conclusiones?',
  '¿Qué critican los usuarios?',
  '¿Qué comentario tiene más votos?',
]

const STATUS = {
  checking: { label: 'Conectando…', cls: 'checking' },
  online: { label: 'Llama 3.2 en línea', cls: 'online' },
  offline: { label: 'API apagada · ejecuta: python -m uvicorn api:app --reload', cls: 'offline' },
  'no-ollama': { label: 'Ollama no está corriendo · ábrelo o ejecuta: ollama serve', cls: 'offline' },
  'no-model': { label: 'Falta el modelo · ejecuta: ollama pull llama3.2:3b', cls: 'offline' },
}

const EVENT = 'cineblog:chat'

// Permite abrir el chat desde cualquier parte de la app
export function openChat(slug) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { slug } }))
}

let uid = 0
const newId = () => `m${Date.now()}-${uid++}`

function AudioButton({ id, text }) {
  const speech = useSpeech()
  const active = speech.id === id
  if (!speechSupported) return null

  return (
    <div className={`audio ${active ? 'active' : ''}`}>
      <motion.button
        className="audio-main"
        onClick={() => (active ? togglePause() : speak(id, text))}
        whileTap={{ scale: 0.92 }}
        aria-label={active ? (speech.paused ? 'Reanudar audio' : 'Pausar audio') : 'Escuchar respuesta'}
      >
        {active ? speech.paused ? <IconPlay width={14} height={14} /> : <IconPause width={14} height={14} /> : <IconVolume width={14} height={14} />}
        <span>{active ? (speech.paused ? 'Reanudar' : 'Pausar') : 'Escuchar'}</span>
        {active && (
          <span className={`eq ${speech.paused ? 'paused' : ''}`} aria-hidden>
            <i /><i /><i /><i />
          </span>
        )}
      </motion.button>
      <AnimatePresence>
        {active && (
          <motion.button
            className="audio-stop"
            onClick={stopSpeech}
            initial={{ opacity: 0, scale: 0.5, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 30 }}
            exit={{ opacity: 0, scale: 0.5, width: 0 }}
            aria-label="Detener audio"
          >
            <IconStop width={12} height={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="msg-tool"
      onClick={() => {
        navigator.clipboard?.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1400)
      }}
      aria-label="Copiar respuesta"
    >
      {done ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
    </button>
  )
}

function Message({ msg, streaming }) {
  const isBot = msg.role === 'assistant'
  return (
    <motion.div
      className={`msg ${isBot ? 'bot' : 'user'} ${msg.error ? 'error' : ''}`}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {isBot && (
        <span className="msg-avatar">
          <IconBot width={16} height={16} />
        </span>
      )}
      <div className="msg-bubble">
        {isBot && !msg.content && streaming ? (
          <span className="typing" aria-label="CineBot está escribiendo">
            <i /><i /><i />
          </span>
        ) : (
          <div className="msg-content">
            {isBot ? <Markdown>{msg.content}</Markdown> : msg.content}
            {streaming && <span className="caret" />}
          </div>
        )}
        {isBot && !streaming && msg.content && !msg.error && (
          <div className="msg-tools">
            <AudioButton id={msg.id} text={msg.content} />
            <CopyButton text={msg.content} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

function BlogPicker({ current, onPick }) {
  const [q, setQ] = useState('')
  const list = blogs.filter((b) => b.title.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <motion.div className="picker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
      <p className="picker-title">¿Sobre qué película quieres hablar?</p>
      <label className="search small">
        <IconSearch width={16} height={16} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar blog…" />
      </label>
      <ul className="picker-list">
        {list.map((b, i) => (
          <motion.li key={b.slug} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.025 }}>
            <button className={b.slug === current ? 'active' : ''} onClick={() => onPick(b.slug)}>
              <Poster blog={b} showText={false} className="mini" />
              <span>
                <strong>{b.title}</strong>
                <small>{b.year} · {b.replyCount} respuestas</small>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function ChatWidget() {
  const location = useLocation()
  const routeSlug = location.pathname.match(/^\/blog\/([^/]+)/)?.[1]
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState(routeSlug ?? null)
  const [picking, setPicking] = useState(false)
  const [convos, setConvos] = useState({})
  const [input, setInput] = useState('')
  const [streamingId, setStreamingId] = useState(null)
  const [health, setHealth] = useState('checking')
  const abortRef = useRef(null)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  const blog = slug ? getBlog(slug) : null
  const messages = useMemo(() => (slug && convos[slug]) || [], [convos, slug])
  const context = useMemo(() => (blog ? buildContext(blog) : ''), [blog])

  // Al entrar a un blog, el chat cambia a ese blog
  useEffect(() => {
    if (routeSlug && getBlog(routeSlug) && !streamingId) setSlug(routeSlug)
  }, [routeSlug]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.slug) setSlug(e.detail.slug)
      setPicking(false)
      setOpen(true)
    }
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [])

  useEffect(() => {
    if (!open) return
    let alive = true
    setHealth('checking')
    checkHealth().then((h) => alive && setHealth(h))
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      alive = false
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, picking])

  useEffect(() => {
    if (open && blog && !picking) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open, blog, picking])

  // En cuanto el chat se abre sobre un blog, Llama empieza a leerlo
  useEffect(() => {
    if (open && blog && health === 'online') prepareBlog(blog.slug, context)
  }, [open, blog, health, context])

  const update = useCallback((s, fn) => setConvos((c) => ({ ...c, [s]: fn(c[s] ?? []) })), [])

  const send = async (text) => {
    const question = text.trim()
    if (!question || !blog || streamingId) return
    const s = slug
    const userMsg = { id: newId(), role: 'user', content: question }
    const botMsg = { id: newId(), role: 'assistant', content: '' }
    const history = messages
      .filter((m) => !m.error && m.content)
      .slice(-6)
      .map(({ role, content }) => ({ role, content }))

    update(s, (m) => [...m, userMsg, botMsg])
    setInput('')
    setStreamingId(botMsg.id)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await askBlog({
        slug: s,
        question,
        blog: context,
        history,
        signal: controller.signal,
        onChunk: (full) => update(s, (m) => m.map((x) => (x.id === botMsg.id ? { ...x, content: full } : x))),
      })
      setHealth('online')
    } catch (err) {
      const aborted = err.name === 'AbortError'
      update(s, (m) =>
        m.map((x) =>
          x.id === botMsg.id
            ? aborted
              ? { ...x, content: x.content ? `${x.content}\n\n_(Respuesta detenida)_` : '_(Respuesta detenida)_' }
              : { ...x, error: true, content: `No pude responder: ${err.message === 'Failed to fetch' ? 'la API no está encendida.' : err.message}` }
            : x,
        ),
      )
      if (!aborted) checkHealth().then(setHealth)
    } finally {
      setStreamingId(null)
      abortRef.current = null
    }
  }

  const clear = () => {
    stopSpeech()
    if (slug) setConvos((c) => ({ ...c, [slug]: [] }))
  }

  const status = STATUS[health]

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            className="chat"
            role="dialog"
            aria-label="Chat con CineBot"
            initial={{ opacity: 0, scale: 0.6, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <header className="chat-head">
              <span className="chat-bot">
                <IconBot width={22} height={22} />
              </span>
              <div className="chat-titles">
                <strong>CineBot</strong>
                <span className={`status ${status.cls}`}>
                  <i /> {status.label}
                </span>
              </div>
              {messages.length > 0 && (
                <button className="icon-btn" onClick={clear} aria-label="Borrar conversación" title="Borrar conversación">
                  <IconTrash width={16} height={16} />
                </button>
              )}
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Cerrar chat">
                <IconClose width={18} height={18} />
              </button>
            </header>

            <button className="chat-context" onClick={() => setPicking((p) => !p)} disabled={!!streamingId}>
              {blog ? (
                <>
                  <Poster blog={blog} showText={false} className="mini" />
                  <span>
                    <small>Hablando sobre</small>
                    <strong>{blog.title}</strong>
                  </span>
                </>
              ) : (
                <span>
                  <small>Ningún blog seleccionado</small>
                  <strong>Elige una película</strong>
                </span>
              )}
              <motion.span animate={{ rotate: picking ? 180 : 0 }} className="chat-context-chev">
                <IconChevron width={18} height={18} />
              </motion.span>
            </button>

            <div className="chat-body" ref={bodyRef}>
              <AnimatePresence mode="wait">
                {picking || !blog ? (
                  <BlogPicker
                    key="picker"
                    current={slug}
                    onPick={(s) => {
                      setSlug(s)
                      setPicking(false)
                    }}
                  />
                ) : messages.length === 0 ? (
                  <motion.div key={`empty-${slug}`} className="chat-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.span className="chat-empty-icon" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>
                      <IconBot width={34} height={34} />
                    </motion.span>
                    <p>
                      Ya leí la publicación y las <strong>{blog.replyCount} respuestas</strong> de <strong>{blog.title}</strong>. Pregúntame lo que quieras.
                    </p>
                    <div className="suggestions">
                      {SUGGESTIONS.map((s, i) => (
                        <motion.button
                          key={s}
                          onClick={() => send(s)}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={`msgs-${slug}`} className="msgs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {messages.map((m) => (
                      <Message key={m.id} msg={m} streaming={m.id === streamingId} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {blog && !picking && messages.length > 0 && !streamingId && (
              <div className="quick">
                {SUGGESTIONS.slice(0, 4).map((s) => (
                  <button key={s} onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                disabled={!blog || picking}
                placeholder={blog ? `Pregunta sobre ${blog.title}…` : 'Primero elige un blog'}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
              />
              {streamingId ? (
                <motion.button type="button" className="send stop" onClick={() => abortRef.current?.abort()} whileTap={{ scale: 0.9 }} aria-label="Detener respuesta">
                  <IconStop width={16} height={16} />
                </motion.button>
              ) : (
                <motion.button type="submit" className="send" disabled={!input.trim() || !blog} whileTap={{ scale: 0.9 }} aria-label="Enviar">
                  <IconSend width={16} height={16} />
                </motion.button>
              )}
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        className={`fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 220, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? 'Cerrar CineBot' : 'Abrir CineBot'}
      >
        {!open && (
          <>
            <span className="fab-ring" />
            <span className="fab-ring delay" />
          </>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? 'x' : 'bot'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            {open ? <IconClose width={26} height={26} /> : <IconBot width={28} height={28} />}
          </motion.span>
        </AnimatePresence>
        {!open && <span className="fab-label">Pregúntale a CineBot</span>}
        {!open && routeSlug && <span className="fab-badge" />}
      </motion.button>
    </>
  )
}
