import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blogs } from '../lib/blogs'
import Poster from './Poster'
import { Reveal } from './Effects'

const top = [...blogs].sort((a, b) => b.replyCount - a.replyCount).slice(0, 10)

// Carrusel arrastrable con los blogs con más respuestas
export default function Featured() {
  const track = useRef(null)
  const [limit, setLimit] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const measure = () => {
      const el = track.current
      if (el) setLimit(Math.max(0, el.scrollWidth - el.parentElement.offsetWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section className="featured">
      <Reveal className="section-head">
        <span className="section-kicker">Top 10</span>
        <h2 className="section-title">Los más debatidos</h2>
        <p className="section-sub">Arrastra para recorrer las salas con más respuestas.</p>
      </Reveal>
      <div className="featured-viewport">
        <motion.div
          ref={track}
          className="featured-track"
          drag="x"
          dragConstraints={{ left: -limit, right: 0 }}
          dragElastic={0.12}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setTimeout(() => setDragging(false), 50)}
        >
          {top.map((blog, i) => (
            <motion.div
              key={blog.slug}
              className="featured-item"
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
            >
              <span className="rank">{i + 1}</span>
              <Link
                to={`/blog/${blog.slug}`}
                className="featured-poster"
                draggable={false}
                onClick={(e) => dragging && e.preventDefault()}
              >
                <motion.div whileHover={{ y: -10, rotate: -1.5 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
                  <Poster blog={blog} />
                  <span className="featured-count">{blog.replyCount} respuestas</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
