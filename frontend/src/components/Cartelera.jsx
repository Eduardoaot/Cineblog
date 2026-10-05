import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { blogs, genres } from '../lib/blogs'
import PosterCard from './PosterCard'
import { Reveal } from './Effects'
import { IconClose, IconSearch } from './Icons'

const SORTS = [
  { id: 'debate', label: 'Más debatidos', fn: (a, b) => b.replyCount - a.replyCount },
  { id: 'score', label: 'Mejor calificados', fn: (a, b) => b.score - a.score },
  { id: 'recent', label: 'Más recientes', fn: (a, b) => new Date(b.date) - new Date(a.date) },
  { id: 'year', label: 'Por año', fn: (a, b) => a.year - b.year },
  { id: 'az', label: 'A – Z', fn: (a, b) => a.title.localeCompare(b.title) },
]

export default function Cartelera() {
  const [genre, setGenre] = useState('Todas')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('debate')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogs
      .filter((b) => genre === 'Todas' || b.genres.includes(genre))
      .filter((b) => !q || `${b.title} ${b.director} ${b.year}`.toLowerCase().includes(q))
      .sort(SORTS.find((s) => s.id === sort).fn)
  }, [genre, query, sort])

  return (
    <section className="cartelera" id="cartelera">
      <Reveal className="section-head">
        <span className="section-kicker">Cartelera completa</span>
        <h2 className="section-title">Elige tu función</h2>
        <p className="section-sub">Cada póster es un blog distinto. Filtra, busca y entra a la sala.</p>
      </Reveal>

      <div className="filters">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar película, director o año…"
            aria-label="Buscar"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                className="search-clear"
                onClick={() => setQuery('')}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                aria-label="Limpiar búsqueda"
              >
                <IconClose width={14} height={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="sort">
          {SORTS.map((s) => (
            <button key={s.id} className={sort === s.id ? 'active' : ''} onClick={() => setSort(s.id)}>
              {sort === s.id && <motion.span layoutId="sort-pill" className="sort-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <LayoutGroup>
        <div className="chips" role="tablist" aria-label="Géneros">
          {['Todas', ...genres].map((g) => (
            <button key={g} role="tab" aria-selected={genre === g} className={`chip ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>
              {genre === g && <motion.span layoutId="chip-pill" className="chip-pill" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
              <span>{g}</span>
            </button>
          ))}
        </div>
      </LayoutGroup>

      <motion.p className="results" key={list.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        {list.length} {list.length === 1 ? 'función' : 'funciones'} disponibles
      </motion.p>

      <motion.div layout className="grid">
        <AnimatePresence mode="popLayout">
          {list.map((b, i) => (
            <PosterCard key={b.slug} blog={b} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {list.length === 0 && (
          <motion.div className="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <span className="empty-title">Sala vacía</span>
            <p>No hay funciones con esos filtros.</p>
            <button className="btn btn-ghost" onClick={() => { setQuery(''); setGenre('Todas') }}>
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
