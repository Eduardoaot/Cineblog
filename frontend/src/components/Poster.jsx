import { blogIndex } from '../lib/blogs'

const K = '#0b0b0c'
const R = '#d7262f'
const Y = '#f5c518'
const W = '#f5f1e8'

// Tres combinaciones fijas para que todos los pósters usen la misma paleta
const THEMES = [
  { bg: K, main: R, accent: Y },
  { bg: R, main: K, accent: W },
  { bg: '#141416', main: Y, accent: R },
]

function seeded(seed) {
  let s = seed + 1
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

function Motif({ type, c, rand }) {
  const { bg, main, accent } = c
  switch (type) {
    case 'sun':
      return (
        <>
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2
            return <line key={i} x1="100" y1="130" x2={100 + Math.cos(a) * 160} y2={130 + Math.sin(a) * 160} stroke={accent} strokeWidth="3" opacity=".35" />
          })}
          <circle cx="100" cy="130" r="52" fill={main} />
          <rect x="0" y="160" width="200" height="140" fill={bg} />
          <rect x="0" y="160" width="200" height="3" fill={accent} />
        </>
      )
    case 'diagonal':
      return (
        <g transform="rotate(-30 100 150)">
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x="-100" y={-40 + i * 40} width="400" height="16" fill={i === 4 ? accent : main} opacity={i === 4 ? 1 : 0.8} />
          ))}
        </g>
      )
    case 'bars':
      return Array.from({ length: 8 }, (_, i) => {
        const h = 60 + rand() * 150
        return <rect key={i} x={14 + i * 23} y={230 - h} width="14" height={h} fill={i === 5 ? accent : main} />
      })
    case 'circles':
      return (
        <>
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx="100" cy="130" r={100 - i * 13} fill="none" stroke={main} strokeWidth="5" opacity={1 - i * 0.1} />
          ))}
          <circle cx="132" cy="96" r="12" fill={accent} />
        </>
      )
    case 'stairs':
      return (
        <>
          <path d="M0 250 H40 V215 H80 V180 H120 V145 H160 V110 H200 V300 H0Z" fill={main} />
          <circle cx="100" cy="160" r="8" fill={accent} />
          <rect x="96" y="167" width="8" height="18" fill={accent} />
        </>
      )
    case 'moon':
      return (
        <>
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={rand() * 200} cy={rand() * 220} r={rand() * 1.8 + 0.4} fill={main} />
          ))}
          <circle cx="110" cy="115" r="58" fill={accent} />
          <circle cx="135" cy="100" r="52" fill={bg} />
          <path d="M0 230 Q50 210 100 230 T200 230 V300 H0Z" fill={main} opacity=".7" />
        </>
      )
    case 'flowers':
      return Array.from({ length: 9 }, (_, i) => {
        const cx = 30 + (i % 3) * 70 + rand() * 10
        const cy = 50 + Math.floor(i / 3) * 70 + rand() * 10
        const col = i % 4 === 0 ? accent : main
        return (
          <g key={i}>
            {Array.from({ length: 10 }, (_, p) => {
              const a = (p / 10) * Math.PI * 2
              return <circle key={p} cx={cx + Math.cos(a) * 14} cy={cy + Math.sin(a) * 14} r="8" fill={col} opacity=".9" />
            })}
            <circle cx={cx} cy={cy} r="7" fill={bg} />
          </g>
        )
      })
    case 'grid':
      return (
        <>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`v${i}`} x1="100" y1="120" x2={-140 + i * 40} y2="300" stroke={main} strokeWidth="1.5" opacity=".8" />
          ))}
          {Array.from({ length: 7 }, (_, i) => {
            const y = 130 + Math.pow(i, 1.8) * 6
            return <line key={`h${i}`} x1="0" y1={y} x2="200" y2={y} stroke={main} strokeWidth="1.5" opacity=".8" />
          })}
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={`r${i}`} x={rand() * 195} y={rand() * 100} width="3" height={10 + rand() * 30} fill={accent} opacity=".85" />
          ))}
        </>
      )
    case 'spiral': {
      let d = ''
      for (let t = 0; t < 34; t += 0.2) {
        const r = 3 + t * 3
        d += `${t === 0 ? 'M' : 'L'}${100 + Math.cos(t) * r} ${130 + Math.sin(t) * r} `
      }
      return (
        <>
          <path d={d} fill="none" stroke={main} strokeWidth="5" />
          <circle cx="100" cy="130" r="6" fill={accent} />
        </>
      )
    }
    case 'stars':
      return (
        <>
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={rand() * 200} cy={rand() * 300} r={rand() * 2 + 0.4} fill={main} />
          ))}
          <path d="m100 70 14 30 33 4-24 23 6 33-29-16-29 16 6-33-24-23 33-4z" fill={accent} />
        </>
      )
    case 'clock':
      return (
        <>
          <circle cx="100" cy="130" r="72" fill="none" stroke={main} strokeWidth="8" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2
            return <line key={i} x1={100 + Math.cos(a) * 54} y1={130 + Math.sin(a) * 54} x2={100 + Math.cos(a) * 64} y2={130 + Math.sin(a) * 64} stroke={main} strokeWidth="4" />
          })}
          <line x1="100" y1="130" x2="100" y2="80" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="130" x2="136" y2="118" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <path d="M0 250 L60 215 L80 240 L120 200 L140 230 L200 190" fill="none" stroke={accent} strokeWidth="4" />
        </>
      )
    case 'egg':
      return (
        <>
          <ellipse cx="100" cy="140" rx="55" ry="72" fill={main} />
          <path d="M70 100 L90 120 L80 140 L105 160 L95 185" fill="none" stroke={accent} strokeWidth="4" />
          <ellipse cx="100" cy="225" rx="80" ry="10" fill={accent} opacity=".25" />
        </>
      )
    case 'waves':
      return (
        <>
          <path d="M70 150 L130 150 L120 175 L80 175Z" fill={accent} />
          <rect x="95" y="110" width="6" height="40" fill={accent} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M0 ${170 + i * 18} Q25 ${160 + i * 18} 50 ${170 + i * 18} T100 ${170 + i * 18} T150 ${170 + i * 18} T200 ${170 + i * 18}`} fill="none" stroke={main} strokeWidth="4" />
          ))}
        </>
      )
    case 'eye':
      return (
        <>
          <path d="M20 130 Q100 50 180 130 Q100 210 20 130Z" fill="none" stroke={main} strokeWidth="6" />
          <circle cx="100" cy="130" r="34" fill={main} />
          <circle cx="100" cy="130" r="14" fill={bg} />
          <circle cx="110" cy="120" r="5" fill={accent} />
          <path d="M100 164 L100 230" stroke={accent} strokeWidth="3" strokeDasharray="4 6" />
        </>
      )
    case 'dots':
      return Array.from({ length: 12 * 18 }, (_, i) => {
        const x = (i % 12) * 17 + 8
        const y = Math.floor(i / 12) * 17 + 8
        const d = Math.hypot(x - 130, y - 110)
        const r = Math.max(0, 7 - d / 18)
        return r > 0.3 ? <circle key={i} cx={x} cy={y} r={r} fill={d < 30 ? accent : main} /> : null
      })
    case 'heart':
      return (
        <>
          <path d="M100 200 C40 160 30 110 60 90 C80 76 96 88 100 104 C104 88 120 76 140 90 C170 110 160 160 100 200Z" fill={main} />
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={20 + rand() * 160} cy={20 + rand() * 60} r={3 + rand() * 4} fill={accent} />
          ))}
        </>
      )
    case 'crash':
      return Array.from({ length: 14 }, (_, i) => {
        const a1 = (i / 14) * Math.PI * 2
        const a2 = a1 + 0.28
        const r = 90 + rand() * 80
        return <path key={i} d={`M100 140 L${100 + Math.cos(a1) * r} ${140 + Math.sin(a1) * r} L${100 + Math.cos(a2) * r} ${140 + Math.sin(a2) * r}Z`} fill={i % 5 === 0 ? accent : main} opacity={0.5 + rand() * 0.5} />
      })
    case 'road':
      return (
        <>
          <circle cx="100" cy="110" r="40" fill={accent} />
          <rect x="0" y="130" width="200" height="170" fill={bg} />
          <path d="M92 130 L108 130 L200 300 L0 300Z" fill={main} />
          {Array.from({ length: 5 }, (_, i) => (
            <rect key={i} x={99 - i * 1.5} y={140 + i * 32} width={2 + i * 3} height={10 + i * 6} fill={accent} />
          ))}
        </>
      )
    case 'arch':
      return (
        <>
          <rect x="0" y="80" width="200" height="160" fill={main} />
          {[0, 1].map((row) =>
            Array.from({ length: 5 }, (_, i) => (
              <path key={`${row}${i}`} d={`M${12 + i * 38} ${150 + row * 75} v-32 a13 13 0 0 1 26 0 v32z`} fill={bg} />
            )),
          )}
          <rect x="0" y="80" width="200" height="6" fill={accent} />
        </>
      )
    case 'dunes':
      return (
        <>
          <circle cx="140" cy="80" r="28" fill={accent} />
          <path d="M0 170 Q60 120 120 170 T200 160 V300 H0Z" fill={main} opacity=".55" />
          <path d="M0 210 Q70 160 140 210 T200 200 V300 H0Z" fill={main} opacity=".8" />
          <path d="M0 250 Q50 220 100 250 T200 245 V300 H0Z" fill={main} />
        </>
      )
    case 'ring':
      return (
        <>
          <circle cx="100" cy="130" r="60" fill="none" stroke={accent} strokeWidth="14" />
          <circle cx="100" cy="130" r="60" fill="none" stroke={main} strokeWidth="2" strokeDasharray="3 7" />
          <path d="M60 300 L100 210 L140 300Z" fill={main} />
        </>
      )
    case 'rain':
      return (
        <>
          {Array.from({ length: 70 }, (_, i) => {
            const x = rand() * 220 - 10
            const y = rand() * 300
            return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 16} stroke={main} strokeWidth="1.6" opacity=".7" />
          })}
          <path d="M100 150 L70 110 M100 150 L130 110 M100 150 V200 M100 200 L88 240 M100 200 L112 240" stroke={accent} strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="138" r="10" fill={accent} />
        </>
      )
    case 'wave':
      return Array.from({ length: 24 }, (_, i) => {
        const h = 10 + Math.abs(Math.sin(i * 0.55)) * 90 * (0.6 + rand() * 0.4)
        return <rect key={i} x={10 + i * 7.6} y={130 - h / 2} width="4.5" height={h} rx="2" fill={i === 12 ? accent : main} />
      })
    case 'sword':
      return (
        <>
          <line x1="40" y1="230" x2="170" y2="40" stroke={main} strokeWidth="7" />
          <line x1="36" y1="210" x2="64" y2="232" stroke={accent} strokeWidth="9" />
          <line x1="20" y1="260" x2="48" y2="220" stroke={accent} strokeWidth="9" />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={110 + rand() * 80} cy={90 + rand() * 120} r={1 + rand() * 4} fill={main} />
          ))}
        </>
      )
    case 'claw':
      return [0, 1, 2].map((i) => (
        <path key={i} d={`M${50 + i * 35} 40 Q${80 + i * 35} 150 ${60 + i * 35} 260`} fill="none" stroke={i === 1 ? accent : main} strokeWidth="13" strokeLinecap="round" />
      ))
    case 'house':
      return (
        <>
          <path d="M40 140 L100 85 L160 140 V230 H40Z" fill="none" stroke={main} strokeWidth="5" />
          <rect x="62" y="160" width="22" height="22" fill={accent} />
          <rect x="116" y="160" width="22" height="22" fill={main} />
          <rect x="88" y="195" width="24" height="35" fill={main} />
          <path d="M150 70 L150 40" stroke={main} strokeWidth="4" />
        </>
      )
    case 'maze':
      return (
        <>
          {Array.from({ length: 6 }, (_, i) => {
            const s = 160 - i * 26
            const o = (200 - s) / 2
            return <rect key={i} x={o} y={o + 30} width={s} height={s} fill="none" stroke={main} strokeWidth="5" strokeDasharray={`${s * 2.5} 20`} strokeDashoffset={i * 40} />
          })}
          <circle cx="100" cy="130" r="6" fill={accent} />
        </>
      )
    default:
      return <circle cx="100" cy="130" r="60" fill={main} />
  }
}

export default function Poster({ blog, className = '', showText = true }) {
  const idx = blogIndex(blog.slug)
  const theme = THEMES[idx % THEMES.length]
  const rand = seeded(idx * 97 + 13)

  return (
    <div className={`poster ${className}`} style={{ '--poster-bg': theme.bg, '--poster-main': theme.main, '--poster-accent': theme.accent }}>
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid slice" className="poster-art" aria-hidden>
        <rect width="200" height="300" fill={theme.bg} />
        <Motif type={blog.motif} c={theme} rand={rand} />
      </svg>
      {showText && (
        <div className="poster-text">
          <span className="poster-credit">Una película de {blog.director}</span>
          <span className="poster-title">{blog.title}</span>
          <span className="poster-year">{blog.year}</span>
        </div>
      )}
    </div>
  )
}
