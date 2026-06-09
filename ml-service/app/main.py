import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health
from app.api.routes import audio

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="AED ML Service",
    description="Acoustic Event Detection inference service (YAMNet).",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ─── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(audio.router, prefix="/audio", tags=["Audio"])


# ─── Startup ──────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup() -> None:
    """
    Ensure the processed/ directory exists before any requests are handled.
    Converted WAVs are retained here for Phase 3 YAMNet inference.
    """
    processed_dir = "processed"
    os.makedirs(processed_dir, exist_ok=True)
    logging.getLogger(__name__).info(
        "Processed audio directory ready: %s", os.path.abspath(processed_dir)
    )
