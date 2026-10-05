import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { blogs } from '../lib/blogs'
import { IconClapper, IconShuffle } from './Icons'

export default function Navbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const navigate = useNavigate()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 240)
    setSolid(y > 40)
  })

  const random = () => {
    const blog = blogs[Math.floor(Math.random() * blogs.length)]
    navigate(`/blog/${blog.slug}`)
  }

  return (
    <motion.header
      className={`navbar ${solid ? 'solid' : ''}`}
      animate={{ y: hidden ? '-110%' : '0%' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Link to="/" className="brand" aria-label="CineBlog, inicio">
        <IconClapper className="brand-icon" width={26} height={26} />
        <span className="brand-name">CineBlog</span>
      </Link>
      <nav className="nav-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <a href="/#cartelera" onClick={(e) => {
          const el = document.getElementById('cartelera')
          if (el) {
            e.preventDefault()
            el.scrollIntoView({ behavior: 'smooth' })
          }
        }}>
          Cartelera
        </a>
        <button className="nav-random" onClick={random}>
          <IconShuffle width={16} height={16} />
          <span>Al azar</span>
        </button>
      </nav>
    </motion.header>
  )
}
