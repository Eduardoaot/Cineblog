import { blogs } from '../lib/blogs'

function Row({ items, reverse, variant }) {
  const content = [...items, ...items]
  return (
    <div className={`ticker ticker-${variant}`}>
      <div className={`ticker-track ${reverse ? 'reverse' : ''}`}>
        {content.map((t, i) => (
          <span key={i} className="ticker-item">
            {t}
            <span className="ticker-star">★</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Ticker() {
  const titles = blogs.slice(0, 18).map((b) => b.title)
  const words = ['Ahora en debate', 'Sin spoilers… casi', 'Palomitas listas', 'Función continua', 'Pregúntale a CineBot', 'Opiniones sin censura']
  return (
    <div className="tickers" aria-hidden>
      <Row items={titles} variant="red" />
      <Row items={words} variant="yellow" reverse />
    </div>
  )
}
