import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="footer">
      <motion.span
        className="footer-fin"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
        whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        Fin
      </motion.span>
      <div className="credits">
        <p><span>Producción</span> CineBlog</p>
        <p><span>Backend</span> FastAPI + Ollama</p>
        <p><span>Inteligencia artificial</span> Llama 3.2 · 3B</p>
        <p><span>Frontend</span> React + Vite</p>
      </div>
      <p className="footer-note">Proyecto local del curso · Solo lectura · {new Date().getFullYear()}</p>
    </footer>
  )
}
