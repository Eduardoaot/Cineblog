import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { IconArrowUp } from './Icons'

// Barra de progreso de lectura con forma de tira de película
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return <motion.div className="scroll-progress" style={{ scaleX }} />
}

export function FilmGrain() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  )
}

export function BackToTop() {
  const { scrollYProgress } = useScroll()
  const [show, setShow] = useState(false)
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  useEffect(() => scrollYProgress.on('change', (v) => setShow(v > 0.15)), [scrollYProgress])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          className="back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Volver arriba"
        >
          <svg viewBox="0 0 48 48" className="back-top-ring">
            <circle cx="24" cy="24" r="21" className="ring-bg" />
            <motion.circle cx="24" cy="24" r="21" className="ring-fg" style={{ pathLength: progress }} />
          </svg>
          <IconArrowUp />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Telón rojo que barre la pantalla en cada cambio de página
export function Curtain() {
  return (
    <motion.div
      className="page-curtain"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      aria-hidden
    >
      <span>CineBlog</span>
    </motion.div>
  )
}

export function Reveal({ children, delay = 0, y = 30, className, as = 'div' }) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  )
}
