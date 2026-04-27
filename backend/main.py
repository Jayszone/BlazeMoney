from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.api import router

app = FastAPI(title="Blaze UGC Brief Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://blazemoney.onrender.com", "https://blazemoney-1.onrender.com", "https://blazemoney-2.onrender.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
