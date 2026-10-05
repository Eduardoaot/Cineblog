import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const KEY = 'cineblog-intro-visto'

function alreadySeen() {
  try {
    return sessionStorage.getItem(KEY) === '1' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Cuenta regresiva de película antigua seguida de un telón que se abre
export default function Intro() {
  const [phase, setPhase] = useState(() => (alreadySeen() ? 'done' : 3))

  useEffect(() => {
    if (phase === 'done') return
    const next = { 3: 2, 2: 1, 1: 'curtain', curtain: 'done' }[phase]
    const t = setTimeout(() => setPhase(next), phase === 'curtain' ? 1400 : 750)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== 'done') return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // sin almacenamiento disponible
    }
  }, [phase])

  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? '' : 'hidden'
  }, [phase])

  if (phase === 'done') return null

  const counting = typeof phase === 'number'

  return (
    <div className={`intro ${counting ? 'counting' : 'opening'}`} role="presentation">
      <AnimatePresence>
        {counting && (
          <motion.div className="leader" key="leader" exit={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.35 }}>
            <div className="leader-cross" />
            <div className="leader-ring" />
            <div className="leader-sweep" key={phase} />
            <AnimatePresence mode="popLayout">
              <motion.span
                key={phase}
                className="leader-num"
                initial={{ scale: 1.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {phase}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="curtain-panel left"
        initial={{ x: 0 }}
        animate={{ x: counting ? 0 : '-102%' }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.2, 1] }}
        style={{ opacity: counting ? 0 : 1 }}
      />
      <motion.div
        className="curtain-panel right"
        initial={{ x: 0 }}
        animate={{ x: counting ? 0 : '102%' }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.2, 1] }}
        style={{ opacity: counting ? 0 : 1 }}
      />
      {!counting && (
        <motion.div
          className="intro-logo"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.8 }}
        >
          CineBlog
        </motion.div>
      )}

      <button className="intro-skip" onClick={() => setPhase('done')}>
        Saltar intro
      </button>
    </div>
  )
}
