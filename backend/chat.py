from multiprocessing import process
from fastapi import APIRouter
from openai import OpenAI
import os
from pydantic import BaseModel

# from dotenv import load_dotenv
# load_dotenv()

chat_router = APIRouter()  # prefix="/chat", tags=["chat"]

if os.getenv("SERVER") == "true":
    MODEL = os.getenv("OPENAI_MODEL", "meta-llama/Llama-3.2-3B-Instruct")
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=os.getenv(
            "OPENAI_BASE_URL", "https://hereditary.cgv.tugraz.at/lm/api/v1"
        ),
    )
else:
    MODEL = "gpt-4o-mini"
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

print("Using model:", MODEL)
print("Using base URL:", client.base_url)


class ChatRequest(BaseModel):
    messages: list


@chat_router.post("/chat")
async def chat(req: ChatRequest):
    print("Received chat request", flush=True)
    print("Using model inside endpoint:", MODEL, flush=True)

    # print("Received messages:", req.messages)
    completion = client.chat.completions.create(
        model=MODEL, messages=req.messages, timeout=180
    )
    response = completion.choices[0].message.content

    print("Generated response:", response)
    return {"reply": response}
