export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function checkHealth() {
  try {
    const res = await fetch(`${API_URL}/health`)
    if (!res.ok) return 'offline'
    const data = await res.json()
    if (!data.ollama) return 'no-ollama'
    return data.model ? 'online' : 'no-model'
  } catch {
    return 'offline'
  }
}

// Pide a la API que Llama vaya leyendo el blog antes de la primera pregunta.
// Ollama solo guarda en memoria el último blog procesado.
let lastPrepared = null
export function prepareBlog(slug, blog) {
  if (lastPrepared === slug) return
  lastPrepared = slug
  fetch(`${API_URL}/prepare-blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blog }),
  }).catch(() => {
    lastPrepared = null
  })
}

// Envía la pregunta y va llamando onChunk con el texto acumulado
export async function askBlog({ slug, question, blog, history, signal, onChunk }) {
  lastPrepared = slug
  const res = await fetch(`${API_URL}/ask-blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, blog, history }),
    signal,
  })
  if (!res.ok) {
    let detail = 'Error al comunicarse con Llama'
    try {
      detail = (await res.json()).detail ?? detail
    } catch {
      // respuesta sin JSON
    }
    throw new Error(detail)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    text += decoder.decode(value, { stream: true })
    onChunk(text)
  }
  return text
}
