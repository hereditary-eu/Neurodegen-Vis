import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from chat import chat_router

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://hereditary.cgv.tugraz.at").split(",")

app = FastAPI()


@app.middleware("http")
async def require_allowed_origin(request: Request, call_next):
    # ponytail: blocks naive scripts only, Origin is trivially spoofed; real abuse protection is a rate limit at the reverse proxy.
    if request.method == "POST" and request.headers.get("origin") not in ALLOWED_ORIGINS:
        return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
    return await call_next(request)


# Allow only the frontend's origin to call the backend from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
