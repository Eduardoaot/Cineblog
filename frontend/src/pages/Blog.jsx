import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { blogIndex, blogs, getBlog, opinionStats } from '../lib/blogs'
import { compact, longDate, runtime } from '../lib/format'
import Poster from '../components/Poster'
import Comment from '../components/Comment'
import { Reveal } from '../components/Effects'
import { IconArrowLeft, IconArrowRight, IconBot, IconClock, IconMessage, IconUpvote, Star } from '../components/Icons'
import NotFound from './NotFound'
import { openChat } from '../components/ChatWidget'

const SORTS = [
  { id: 'top', label: 'Más votados', fn: (a, b) => b.votes - a.votes },
  { id: 'new', label: 'Recientes', fn: (a, b) => new Date(b.date) - new Date(a.date) },
  { id: 'old', label: 'Antiguos', fn: (a, b) => new Date(a.date) - new Date(b.date) },
]

const PAGE = 10

function Stars({ score }) {
  return (
    <div className="stars" aria-label={`${score} de 10`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, score / 2 - i))
        return (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 260, damping: 14 }}
          >
            <Star fill={fill} size={24} />
          </motion.span>
        )
      })}
      <strong>{score.toFixed(1)}</strong>
      <span>/10</span>
    </div>
  )
}

function OpinionMeter({ blog }) {
  const s = opinionStats(blog)
  const pct = (n) => (s.total ? Math.round((n / s.total) * 100) : 0)
  const parts = [
    { key: 'favor', label: 'A favor', n: s.favor, cls: 'favor' },
    { key: 'neutral', label: 'Neutrales', n: s.neutral, cls: 'neutral' },
    { key: 'contra', label: 'En contra', n: s.contra, cls: 'contra' },
  ]
  return (
    <Reveal className="meter">
      <div className="meter-head">
        <span className="section-kicker">Termómetro del hilo</span>
        <span className="meter-total">{s.total} opiniones</span>
      </div>
      <div className="meter-bar">
        {parts.map((p, i) => (
          <motion.span
            key={p.key}
            className={`meter-seg ${p.cls}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct(p.n)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <div className="meter-legend">
        {parts.map((p) => (
          <span key={p.key}>
            <i className={`meter-dot ${p.cls}`} /> {p.label} <strong>{pct(p.n)}%</strong>
          </span>
        ))}
      </div>
    </Reveal>
  )
}

export default function Blog() {
  const { slug } = useParams()
  const blog = getBlog(slug)
  const [sort, setSort] = useState('top')
  const [visible, setVisible] = useState(PAGE)
  const { scrollY } = useScroll()
  const posterY = useTransform(scrollY, [0, 600], [0, 120])
  const bgScale = useTransform(scrollY, [0, 600], [1.1, 1.3])

  const sortFn = SORTS.find((s) => s.id === sort).fn
  const roots = useMemo(() => (blog ? [...blog.comments].sort(sortFn) : []), [blog, sortFn])

  if (!blog) return <NotFound />

  const idx = blogIndex(slug)
  const prev = blogs[(idx - 1 + blogs.length) % blogs.length]
  const next = blogs[(idx + 1) % blogs.length]
  const words = blog.title.split(' ')

  return (
    <article className="blog" key={slug}>
      <section className="blog-hero">
        <motion.div className="blog-hero-bg" style={{ scale: bgScale }} aria-hidden>
          <Poster blog={blog} showText={false} />
        </motion.div>

        <div className="blog-hero-inner">
          <motion.div className="blog-poster" style={{ y: posterY }} initial={{ opacity: 0, rotateY: -35, x: -40 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <Poster blog={blog} />
          </motion.div>

          <div className="blog-info">
            <Link to="/" className="back-link">
              <IconArrowLeft width={16} height={16} /> Volver a la cartelera
            </Link>
            <div className="genre-tags">
              {blog.genres.map((g, i) => (
                <motion.span key={g} className="tag" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
                  {g}
                </motion.span>
              ))}
            </div>
            <h1 className="blog-title">
              {words.map((w, i) => (
                <span className="word-mask" key={i}>
                  <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p className="blog-tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              “{blog.tagline}”
            </motion.p>
            <Stars score={blog.score} />
            <motion.ul className="blog-facts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <li><span>Dirección</span>{blog.director}</li>
              <li><span>Estreno</span>{blog.year}</li>
              <li><span>Duración</span><IconClock width={14} height={14} /> {runtime(blog.duration)}</li>
              <li><span>Respuestas</span><IconMessage width={14} height={14} /> {blog.replyCount}</li>
            </motion.ul>
            <motion.button
              className="btn btn-primary ask-btn"
              onClick={() => openChat(blog.slug)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <IconBot width={18} height={18} /> Pregúntale a CineBot sobre este blog
            </motion.button>
          </div>
        </div>
      </section>

      <div className="blog-body">
        <Reveal className="post">
          <header className="post-head">
            <span className="avatar big" style={{ '--av': 'var(--red)' }}>{blog.author[0]}</span>
            <div>
              <span className="post-author">{blog.author} <span className="badge-op">Autor</span></span>
              <span className="post-date">Publicado el {longDate(blog.date)}</span>
            </div>
            <span className="votes big">
              <IconUpvote width={18} height={18} /> {compact(blog.votes)}
            </span>
          </header>
          <span className="post-label">Publicación original</span>
          {blog.post.map((p, i) => (
            <Reveal key={i} as="p" delay={i * 0.08} y={16} className="post-p">
              {p}
            </Reveal>
          ))}
        </Reveal>

        <OpinionMeter blog={blog} />

        <section className="thread">
          <div className="thread-head">
            <h2 className="section-title small">
              {blog.replyCount} respuestas
            </h2>
            <div className="sort">
              {SORTS.map((s) => (
                <button key={s.id} className={sort === s.id ? 'active' : ''} onClick={() => setSort(s.id)}>
                  {sort === s.id && <motion.span layoutId="thread-sort" className="sort-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <ul className="comments" key={sort}>
            {roots.slice(0, visible).map((c) => (
              <Comment key={c.id} comment={c} sortFn={sortFn} />
            ))}
          </ul>

          {visible < roots.length && (
            <motion.button className="btn btn-ghost more" onClick={() => setVisible((v) => v + PAGE)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              Cargar más hilos ({roots.length - visible})
            </motion.button>
          )}
        </section>

        <nav className="blog-nav">
          {[{ b: prev, label: 'Función anterior', dir: 'prev' }, { b: next, label: 'Siguiente función', dir: 'next' }].map(({ b, label, dir }) => (
            <Link key={dir} to={`/blog/${b.slug}`} className={`blog-nav-item ${dir}`}>
              <motion.div whileHover={{ x: dir === 'next' ? 6 : -6 }} className="blog-nav-inner">
                <Poster blog={b} showText={false} className="mini" />
                <div>
                  <span className="blog-nav-label">
                    {dir === 'prev' && <IconArrowLeft width={14} height={14} />} {label} {dir === 'next' && <IconArrowRight width={14} height={14} />}
                  </span>
                  <strong>{b.title}</strong>
                </div>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>
    </article>
  )
}
