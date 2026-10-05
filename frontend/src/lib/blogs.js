import data from '../data/blogs.json'

export const blogs = data

export const getBlog = (slug) => blogs.find((b) => b.slug === slug)

export const genres = [...new Set(blogs.flatMap((b) => b.genres))].sort((a, b) => a.localeCompare(b))

export const totalReplies = blogs.reduce((sum, b) => sum + b.replyCount, 0)

export const totalVotes = blogs.reduce((sum, b) => sum + b.votes + sumVotes(b.comments), 0)

function sumVotes(list) {
  return list.reduce((s, c) => s + c.votes + sumVotes(c.replies), 0)
}

export function flatten(list, depth = 0, parent = null, out = []) {
  for (const c of list) {
    out.push({ ...c, depth, parent })
    flatten(c.replies, depth + 1, c.author, out)
  }
  return out
}

export function opinionStats(blog) {
  const all = flatten(blog.comments)
  const favor = all.filter((c) => c.stance === 1).length
  const contra = all.filter((c) => c.stance === -1).length
  return { favor, contra, neutral: all.length - favor - contra, total: all.length }
}

export function blogIndex(slug) {
  return blogs.findIndex((b) => b.slug === slug)
}

// Máximo de respuestas que se envían a Llama. Con más, un modelo de 3B en CPU
// tarda demasiado en procesar el contexto.
export const MAX_CONTEXT_REPLIES = 40

// Texto que se envía a Llama como contexto del blog
export function buildContext(blog) {
  const stats = opinionStats(blog)
  const all = flatten(blog.comments)
  const keep = new Set(
    [...all]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, MAX_CONTEXT_REPLIES)
      .map((c) => c.id),
  )
  const shown = all.filter((c) => keep.has(c.id))
  const lines = [
    `PELÍCULA: ${blog.title} (${blog.year}), de ${blog.director}. ${blog.genres.join(', ')}. ${blog.duration} min.`,
    `CALIFICACIÓN DEL AUTOR: ${blog.score}/10`,
    `AUTOR DEL BLOG: ${blog.author}`,
    '',
    'PUBLICACIÓN ORIGINAL:',
    ...blog.post,
    '',
    `RESPUESTAS: ${stats.total} en total (${stats.favor} a favor, ${stats.contra} en contra, ${stats.neutral} neutrales).`,
    shown.length < all.length ? `Se muestran las ${shown.length} más votadas:` : '',
  ]
  for (const c of shown) {
    const op = c.isOp ? ' [autor]' : ''
    lines.push(`${'  '.repeat(c.depth)}- ${c.author}${op} (${c.votes}): ${c.text}`)
  }
  return lines.filter((l, i) => l || lines[i - 1]).join('\n')
}
