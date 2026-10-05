import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { blogs } from '../lib/blogs'
import { IconArrowRight, IconShuffle } from './Icons'

const BULBS = 22

function Bulbs({ side }) {
  return (
    <div className={`bulbs bulbs-${side}`} aria-hidden>
      {Array.from({ length: side === 'top' || side === 'bottom' ? BULBS : 5 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${(i % 3) * 0.25}s` }} />
      ))}
    </div>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const navigate = useNavigate()
  const mx = useMotionValue(50)
  const my = useMotionValue(40)
  const sx = useSpring(mx, { stiffness: 80, damping: 20 })
  const sy = useSpring(my, { stiffness: 80, damping: 20 })
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(245,197,24,.14), transparent 60%)`

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 160])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 100)
    my.set(((e.clientY - r.top) / r.height) * 100)
  }

  const random = () => navigate(`/blog/${blogs[Math.floor(Math.random() * blogs.length)].slug}`)
  const title = 'CineBlog'.split('')

  return (
    <section className="hero" ref={ref} onMouseMove={onMove}>
      <motion.div className="hero-spot" style={{ background: spotlight }} />
      <div className="searchlight one" aria-hidden />
      <div className="searchlight two" aria-hidden />

      <motion.div className="hero-inner" style={{ y, opacity }}>
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: '0.8em' }}
          animate={{ opacity: 1, letterSpacing: '0.35em' }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          Función continua · Debates de cine
        </motion.p>

        <div className="marquee-sign">
          <Bulbs side="top" />
          <Bulbs side="bottom" />
          <Bulbs side="left" />
          <Bulbs side="right" />
          <h1 className="hero-title" aria-label="CineBlog">
            {title.map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: 80, opacity: 0, rotateX: -90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 180, damping: 14 }}
                whileHover={{ y: -12, color: 'var(--yellow)', transition: { duration: 0.15 } }}
              >
                {ch}
              </motion.span>
            ))}
          </h1>
          <motion.p className="marquee-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            Ahora en cartelera: {blogs.length} películas en debate
          </motion.p>
        </div>

        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
        >
          Cada película es una sala. Entra, lee la publicación original y sumérgete en los hilos de respuestas.
          ¿No te da tiempo de leer todo? Pregúntale a CineBot.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
        >
          <motion.a
            href="#cartelera"
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('cartelera')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Ver cartelera <IconArrowRight width={18} height={18} />
          </motion.a>
          <motion.button className="btn btn-ghost" onClick={random} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconShuffle width={18} height={18} /> Película al azar
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div className="scroll-cue" style={{ opacity }} aria-hidden>
        <span className="reel" />
        <span>Desliza</span>
      </motion.div>
    </section>
  )
}
