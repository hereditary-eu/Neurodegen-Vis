from fastapi import APIRouter
from openai import OpenAI
import os
from pydantic import BaseModel


chat_router = APIRouter() # prefix="/chat", tags=["chat"]

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ChatRequest(BaseModel):
    messages: list

MODEL = "gpt-4o-mini"

@chat_router.post("/chat")
async def chat(req: ChatRequest):
    # print("Received messages:", req.messages)
    completion = client.chat.completions.create(
        model=MODEL,
        messages=req.messages
    )
    response = completion.choices[0].message.content
    print("Generated response:", response)
    return {"reply": response}