import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <section className="notfound">
      <motion.span className="notfound-code" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 0.4, 1], scale: 1 }} transition={{ duration: 1 }}>
        404
      </motion.span>
      <h1 className="section-title">Esta sala no existe</h1>
      <p>La película que buscas no está en cartelera.</p>
      <Link to="/" className="btn btn-primary">Volver a la cartelera</Link>
    </section>
  )
}
