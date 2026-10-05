# CineBlog

Foro de reseñas de películas (solo lectura) con un asistente local que responde preguntas sobre cada blog usando Llama 3.2 vía Ollama.

## Requisitos

- Python 3.10+ con `fastapi[standard]` y `ollama`
- Node 20+
- [Ollama](https://ollama.com/download) con el modelo `llama3.2:3b` (`ollama pull llama3.2:3b`)

## Ejecutar

API (en la raíz del proyecto):

```
pip install "fastapi[standard]" ollama
python -m uvicorn api:app --reload
```

Frontend (en otra terminal):

```
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173

## Datos

Los blogs se generan desde `frontend/scripts/movies.mjs`:

```
cd frontend
node scripts/generate-blogs.mjs
```
