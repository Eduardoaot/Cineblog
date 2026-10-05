// Genera src/data/blogs.json a partir de movies.mjs.
// Uso: node scripts/generate-blogs.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { movies } from './movies.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', 'src', 'data', 'blogs.json')

// Número de respuestas por blog (entre 2 y 80), en el mismo orden que movies.mjs
const REPLY_COUNTS = [80, 47, 12, 2, 63, 25, 8, 71, 34, 5, 56, 19, 3, 77, 41, 15, 66, 28, 9, 52, 36, 4, 74, 22, 11, 59, 31, 6, 68, 44, 17, 2, 49, 26, 13, 61]

const USERS = [
  'PalomitasConSal', 'Cinefilo_MX', 'LaUltimaFila', 'RolloDe35mm', 'Travelling_Lento', 'DirectorFrustrado',
  'TaquillaRota', 'CreditosFinales', 'EscenaPostCreditos', 'ButacaCrítica', 'PlanoSecuencia', 'CorteFinal',
  'FuncionDeMedianoche', 'NitratoViejo', 'ElProyeccionista', 'ClaquetaRoja', 'FotogramaPerdido', 'DobleFuncion',
  'MarquesinaAmarilla', 'Spoilerman', 'CineDeBarrio', 'LaCriticona', 'ZoomDramatico', 'Contraplano',
  'VHS_Rebobinado', 'GuionistaNocturno', 'SalaTres', 'FueraDeFoco', 'Steadicam_Ana', 'MontajeParalelo',
  'CinemaScope', 'LuzDeSala', 'TrailerAdicto', 'BandaSonoraFan', 'Maratonera', 'ElTaquillero',
]

const TOP = {
  1: [
    'Volví a verla anoche y {scene} sigue siendo de lo mejor que ha hecho {director}.',
    '{char} es de esos personajes que se quedan contigo años. Para mí, lo más fuerte de la película.',
    'Lo que más me gusta es que {pro}. Eso no se ve seguido.',
    'La vi en cine en su momento y cuando llegó {scene} la sala se quedó en silencio total.',
    'Le doy un {score}/10 sin pensarlo. {Pro}.',
    'Totalmente de acuerdo con el post. {Pro}, y además {scene} está filmada con una precisión enfermiza.',
    'Mi parte favorita: {scene}. Cada vez que la veo encuentro un detalle nuevo.',
    'Se la puse a mi pareja que nunca la había visto y terminó convencida. {Pro}.',
    'Para quien dude si verla: sí. {Pro} y con eso basta.',
    'No me canso de decirlo: {pro}. {title} no envejece.',
    'Lo de {char} en {scene} es actuación de otro nivel.',
    'Es de las pocas películas que veo una vez al año. {Pro}.',
  ],
  '-1': [
    'Voy a ser el aguafiestas: {con}. No la odio, pero creo que está sobrevalorada.',
    'Para mí {con}. Entiendo el hype, pero no me terminó de convencer.',
    '{char} me pareció el punto débil. Y siendo honestos, {con}.',
    'Le doy un {low}/10. Bien hecha, sí, pero {con}.',
    'La volví a ver con expectativas altas y me decepcionó un poco: {con}.',
    'Opinión impopular: {con}. Y {scene} no me pareció para tanto.',
    'Técnicamente impecable, pero {con}. Me dejó frío.',
  ],
  0: [
    '¿Alguien más notó un detalle en {scene}? Creo que anticipa el final.',
    'Pregunta seria: ¿vale la pena verla doblada o mejor subtitulada?',
    'Primera vez que la veo después de leer este hilo. Mañana vuelvo a comentar.',
    'Lo interesante es que {director} divide a la gente justo por esto: unos ven que {pro}, otros que {con}.',
    'Para mí es un {mid}/10. Lo bueno es muy bueno, pero {con}.',
    '¿Alguien sabe dónde se puede ver en buena calidad? Quiero mostrársela a mi hermano.',
    'Me gusta más cada vez que la veo. La primera vez solo me fijé en {char}.',
    'Lo que nadie menciona: el diseño de sonido en {scene}.',
  ],
}

const REPLY = {
  1: [
    'Exacto. {Pro}.',
    'Esto. Justo lo que iba a decir.',
    'Coincido al cien, sobre todo con lo de {char}.',
    'Gran punto. Me dieron ganas de verla otra vez.',
    'Sí, y súmale {scene}.',
    'Por fin alguien lo dice.',
    'Y eso que no mencionaste que {pro}.',
    'Totalmente. Además, {pro}.',
  ],
  '-1': [
    'Mmm, no estoy tan seguro. {Con}.',
    'Respeto tu opinión, pero creo que {con}.',
    'No exageremos, tampoco es perfecta. {Con}.',
    'A mí me pasó lo contrario: {scene} me pareció lo más flojo.',
    'Entiendo el punto, pero {con} y eso pesa.',
  ],
  2: [
    'Creo que estás siendo injusto. {Pro}.',
    'Ni de broma. {scene} por sí sola ya justifica el boleto.',
    'Tienes que darle otra oportunidad. {Pro}.',
    'Respeto, pero no. {Pro}.',
  ],
  0: [
    '¿En qué formato la viste? En pantalla grande cambia muchísimo.',
    'Jajaja, el debate de siempre con esta película.',
    'Llevo años leyendo esta discusión y sigo sin decidirme.',
    'Buen hilo, lo guardo.',
    'Esto merece su propio post.',
    'Interesante, nunca lo había visto así.',
    'Yo la vi subtitulada y no me imagino verla de otra forma.',
  ],
}

function hash(str) {
  let h = 2166136261
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

function buildBlog(movie, index) {
  const rand = rng(hash(movie.slug))
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]
  const total = REPLY_COUNTS[index]
  const used = new Set()

  const fill = (tpl) => {
    const pro = pick(movie.pros)
    const con = pick(movie.cons)
    return tpl
      .replaceAll('{title}', movie.title)
      .replaceAll('{director}', movie.director)
      .replaceAll('{char}', pick(movie.chars))
      .replaceAll('{scene}', pick(movie.scenes))
      .replaceAll('{Pro}', cap(pro))
      .replaceAll('{pro}', pro)
      .replaceAll('{Con}', cap(con))
      .replaceAll('{con}', con)
      .replaceAll('{score}', String(Math.min(10, Math.round(movie.score + rand()))))
      .replaceAll('{low}', String(Math.max(4, Math.round(movie.score - 2 - rand() * 2))))
      .replaceAll('{mid}', String(Math.max(5, Math.round(movie.score - 1))))
  }

  const unique = (make) => {
    for (let i = 0; i < 25; i++) {
      const text = make()
      if (!used.has(text)) {
        used.add(text)
        return text
      }
    }
    return make()
  }

  const specific = [...movie.lines]
  const nodes = []
  const roots = []
  const posted = new Date(movie.date).getTime()

  for (let k = 0; k < total; k++) {
    const candidates = nodes.filter((n) => n.depth < 4)
    const isRoot = k === 0 || candidates.length === 0 || rand() < 0.42
    let parent = null
    if (!isRoot) {
      // Las respuestas tienden a acumularse en los comentarios más votados
      candidates.sort((a, b) => b.votes - a.votes)
      parent = candidates[Math.floor(Math.pow(rand(), 1.8) * candidates.length)]
    }

    let stance
    let text
    if (!parent) {
      if (specific.length && rand() < 0.75) {
        const [s, t] = specific.splice(Math.floor(rand() * specific.length), 1)[0]
        stance = s
        text = t
        used.add(t)
      } else {
        const r = rand()
        stance = r < 0.55 ? 1 : r < 0.8 ? -1 : 0
        text = unique(() => fill(pick(TOP[stance])))
      }
    } else {
      const r = rand()
      let key
      if (r < 0.2) key = 0
      else if (parent.stance === -1) key = r < 0.65 ? 2 : -1
      else key = r < 0.7 ? 1 : -1
      stance = key === 2 ? 1 : key
      text = unique(() => fill(pick(REPLY[key])))
    }

    const usedAuthors = new Set([parent?.author])
    let author = pick(USERS)
    let isOp = false
    if (parent && rand() < 0.12 && parent.author !== movie.author) {
      author = movie.author
      isOp = true
    }
    while (!isOp && (usedAuthors.has(author) || author === movie.author)) author = pick(USERS)

    const base = parent ? parent.time : posted
    const time = base + Math.floor(rand() * (parent ? 600 : 4000) + 5) * 60000
    const votes = parent
      ? Math.floor(Math.pow(rand(), 2.2) * 420) + 1
      : Math.floor(Math.pow(rand(), 1.6) * 2400) + 3

    const node = {
      id: `${movie.slug}-${k + 1}`,
      author,
      isOp,
      votes,
      stance,
      date: new Date(time).toISOString(),
      text,
      replies: [],
      depth: parent ? parent.depth + 1 : 0,
      time,
    }
    nodes.push(node)
    if (parent) parent.replies.push(node)
    else roots.push(node)
  }

  const clean = (n) => ({
    id: n.id,
    author: n.author,
    isOp: n.isOp,
    votes: n.votes,
    stance: n.stance,
    date: n.date,
    text: n.text,
    replies: n.replies.map(clean),
  })

  return {
    slug: movie.slug,
    title: movie.title,
    year: movie.year,
    director: movie.director,
    genres: movie.genres,
    duration: movie.duration,
    score: movie.score,
    motif: movie.motif,
    tagline: movie.tagline,
    author: movie.author,
    date: new Date(movie.date).toISOString(),
    votes: Math.floor(rand() * 4200) + 300,
    post: movie.post,
    replyCount: total,
    comments: roots.map(clean),
  }
}

const blogs = movies.map(buildBlog)
writeFileSync(out, JSON.stringify(blogs, null, 1))
console.log(`${blogs.length} blogs, ${blogs.reduce((s, b) => s + b.replyCount, 0)} respuestas -> ${out}`)
