from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from chat import chat_router

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
