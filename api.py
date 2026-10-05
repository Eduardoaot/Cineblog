from typing import Literal

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from ollama import chat, list as list_models

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

class PromptRequest(BaseModel):
    prompt: str

@app.get("/")
def home():
    return {
        "message": "API de Python funcionando correctamente"
    }

@app.post("/ask")
def ask_llama(request: PromptRequest):
    try:
        response = chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Eres un asistente de programación. "
                        "Responde siempre en español."
                    )
                },
                {
                    "role": "user",
                    "content": request.prompt
                }
            ]
        )

        return {
            "answer": response.message.content
        }

    except Exception as error:
        print(f"Error de Ollama: {error}")

        raise HTTPException(
            status_code=500,
            detail="Error al comunicarse con Llama"
        )


# ---------- CineBlog ----------

BLOG_SYSTEM_PROMPT = (
    "Eres CineBot, el asistente de CineBlog, un foro de discusión de películas. "
    "Responde siempre en español, de forma clara y amena, en máximo 150 palabras. "
    "Tu fuente principal es el BLOG que se te entrega: la publicación original y las "
    "respuestas de los usuarios. Cada respuesta tiene el formato "
    "'- usuario (votos): texto' y las respuestas anidadas van con sangría. "
    "Si te piden un resumen o conclusiones, básate solo en lo que dice el blog y menciona "
    "los puntos de acuerdo y desacuerdo. "
    "Si te preguntan si la película es buena, explica el consenso del hilo usando la "
    "calificación del autor y las opiniones más votadas. "
    "Si te piden tu opinión, da una opinión propia y breve, aclarando que es tuya, "
    "apoyada en lo que se discute y en conocimiento general de la película. "
    "Si la pregunta no tiene relación con el blog o la película, dilo amablemente. "
    "Puedes usar listas cortas y negritas en Markdown. "
    "Nunca copies las respuestas del blog ni repitas su formato de usuario y votos: "
    "redacta siempre con tus propias palabras."
)

# Recordatorio que se agrega a cada pregunta. Va al final del mensaje para no
# romper el prefijo (instrucciones + blog) que Ollama ya tiene en memoria.
QUESTION_REMINDER = (
    "\n\n(Responde con tus propias palabras en un texto breve. "
    "No copies ni enumeres los comentarios del blog.)"
)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class BlogQuestion(BaseModel):
    question: str = Field(min_length=1, max_length=1000)
    blog: str = Field(min_length=1, max_length=40000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=12)


@app.get("/health")
def health():
    try:
        models = [m.model for m in list_models().models]
        return {"ollama": True, "model": "llama3.2:3b" in models}
    except Exception:
        return {"ollama": False, "model": False}


class BlogContext(BaseModel):
    blog: str = Field(min_length=1, max_length=40000)


# Mismas opciones en todas las llamadas para que Ollama pueda reutilizar
# el prefijo (instrucciones + blog) que ya tiene procesado en memoria.
BLOG_OPTIONS = {"num_ctx": 6144, "temperature": 0.6, "num_predict": 400}
KEEP_ALIVE = "30m"


def blog_messages(blog: str) -> list[dict]:
    return [
        {"role": "system", "content": BLOG_SYSTEM_PROMPT},
        {"role": "system", "content": f"BLOG:\n{blog}"},
    ]


def warm_up(blog: str):
    try:
        chat(
            model="llama3.2:3b",
            messages=[*blog_messages(blog), {"role": "user", "content": "Hola"}],
            options={**BLOG_OPTIONS, "num_predict": 1},
            keep_alive=KEEP_ALIVE,
        )
    except Exception as error:
        print(f"Error al precargar el blog: {error}")


@app.post("/prepare-blog", status_code=202)
def prepare_blog(request: BlogContext, background: BackgroundTasks):
    # Procesa el blog en segundo plano mientras el usuario escribe su pregunta
    background.add_task(warm_up, request.blog)
    return {"status": "preparando"}


@app.post("/ask-blog")
def ask_blog(request: BlogQuestion):
    messages = [
        *blog_messages(request.blog),
        *[m.model_dump() for m in request.history],
        {"role": "user", "content": request.question + QUESTION_REMINDER},
    ]

    try:
        stream = chat(
            model="llama3.2:3b",
            messages=messages,
            stream=True,
            options=BLOG_OPTIONS,
            keep_alive=KEEP_ALIVE,
        )
        # Pedimos el primer fragmento aquí para que los errores de Ollama
        # se conviertan en un 500 en lugar de cortar la respuesta a medias.
        first = next(stream)
    except Exception as error:
        print(f"Error de Ollama: {error}")
        raise HTTPException(
            status_code=500,
            detail="Error al comunicarse con Llama"
        )

    def generate():
        yield first.message.content
        try:
            for chunk in stream:
                yield chunk.message.content
        except Exception as error:
            print(f"Error de Ollama durante el stream: {error}")
            yield "\n\n_(La respuesta se interrumpió)_"

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")
