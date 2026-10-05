from ollama import chat

response = chat(
    model="llama3.2:3b",
    messages=[
        {"role": "system", "content": "Eres un asistente útil. Responde en español."},
        {"role": "user", "content": "Explica qué es una API REST."}
    ]
)

print(response.message.content)
