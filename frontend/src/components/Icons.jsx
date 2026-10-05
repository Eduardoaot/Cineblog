const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const make = (children) => (props) => <svg {...base} {...props}>{children}</svg>

export const IconSearch = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const IconArrowUp = make(<path d="M12 19V5M5 12l7-7 7 7" />)
export const IconArrowLeft = make(<path d="M19 12H5M12 19l-7-7 7-7" />)
export const IconArrowRight = make(<path d="M5 12h14M12 5l7 7-7 7" />)
export const IconChevron = make(<path d="m6 9 6 6 6-6" />)
export const IconSend = make(<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></>)
export const IconClose = make(<path d="M18 6 6 18M6 6l12 12" />)
export const IconStop = make(<rect x="6" y="6" width="12" height="12" rx="2" />)
export const IconPlay = make(<path d="M7 4v16l13-8z" />)
export const IconPause = make(<><path d="M8 5v14" /><path d="M16 5v14" /></>)
export const IconVolume = make(<><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></>)
export const IconCopy = make(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>)
export const IconCheck = make(<path d="M20 6 9 17l-5-5" />)
export const IconMessage = make(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />)
export const IconClock = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const IconShuffle = make(<><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></>)
export const IconTrash = make(<><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /></>)
export const IconFilm = make(<><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5M2 12h20" /></>)
export const IconUpvote = (props) => (
  <svg {...base} {...props}><path d="M12 4 4 14h5v6h6v-6h5z" /></svg>
)

export function IconBot(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="8" width="16" height="12" rx="4" />
      <path d="M12 4v4" />
      <circle cx="12" cy="3" r="1" />
      <circle cx="9" cy="14" r="1.2" fill="currentColor" />
      <circle cx="15" cy="14" r="1.2" fill="currentColor" />
      <path d="M2 13v2M22 13v2" />
    </svg>
  )
}

export function IconClapper(props) {
  return (
    <svg {...base} {...props}>
      <path className="clap-top" d="m3 9 17-5 1 3L4 12z" />
      <path d="M4 12h17v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="m8 7 2 4M13 5.5l2 4" />
    </svg>
  )
}

export function Star({ fill = 1, size = 18 }) {
  const id = `s${Math.round(fill * 100)}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="var(--yellow)" />
          <stop offset={`${fill * 100}%`} stopColor="rgba(255,255,255,.15)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  )
}
