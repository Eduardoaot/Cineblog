import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Poster from './Poster'
import { IconArrowRight, IconMessage, Star } from './Icons'

// Tarjeta con inclinación 3D y brillo que sigue al cursor
export default function PosterCard({ blog, index = 0, ref }) {
  const tiltRef = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 200, damping: 18 })
  const ry = useSpring(useTransform(px, [0, 1], [-12, 12]), { stiffness: 200, damping: 18 })
  const gx = useTransform(px, (v) => v * 100)
  const gy = useTransform(py, (v) => v * 100)
  const glare = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.28), transparent 55%)`

  const onMove = (e) => {
    const r = tiltRef.current.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.article
      ref={ref}
      layout
      className="card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/blog/${blog.slug}`} className="card-link" aria-label={`Abrir el blog de ${blog.title}`}>
        <motion.div
          ref={tiltRef}
          className="card-3d"
          style={{ rotateX: rx, rotateY: ry }}
          onMouseMove={onMove}
          onMouseLeave={reset}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Poster blog={blog} />
          <motion.div className="card-glare" style={{ background: glare }} />
          <span className="card-score">
            <Star size={13} /> {blog.score.toFixed(1)}
          </span>
          <div className="card-overlay">
            <p className="card-tagline">“{blog.tagline}”</p>
            <span className="card-cta">
              Entrar a la sala <IconArrowRight width={16} height={16} />
            </span>
          </div>
        </motion.div>
        <div className="card-meta">
          <h3>{blog.title}</h3>
          <p>
            <span>{blog.year}</span>
            <span className="dot" />
            <span>{blog.genres[0]}</span>
            <span className="card-replies">
              <IconMessage width={14} height={14} /> {blog.replyCount}
            </span>
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
