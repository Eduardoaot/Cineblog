const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
const units = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit)
  }
  return 'justo ahora'
}

export function longDate(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function compact(n) {
  return new Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function runtime(min) {
  return `${Math.floor(min / 60)} h ${min % 60} min`
}

const AVATAR = ['#d7262f', '#f5c518', '#f5f1e8', '#8f1118', '#3a3a40']
export function avatarColor(name) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AVATAR[h % AVATAR.length]
}
