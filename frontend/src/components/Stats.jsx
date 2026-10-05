import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { blogs, genres, totalReplies, totalVotes } from '../lib/blogs'
import { Reveal } from './Effects'

function Counter({ to }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('es-MX')
      },
    })
    return () => controls.stop()
  }, [inView, to])
  return <span ref={ref}>0</span>
}

export default function Stats() {
  const items = [
    { n: blogs.length, label: 'Películas en cartelera' },
    { n: totalReplies, label: 'Respuestas en los hilos' },
    { n: totalVotes, label: 'Votos de la comunidad' },
    { n: genres.length, label: 'Géneros distintos' },
  ]
  return (
    <section className="stats">
      {items.map((it, i) => (
        <Reveal key={it.label} delay={i * 0.1} className="stat">
          <strong className="stat-num">
            <Counter to={it.n} />
          </strong>
          <span className="stat-label">{it.label}</span>
        </Reveal>
      ))}
    </section>
  )
}
