# ML Service

FastAPI-based ML inference service for AED Explorer.

## Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS / Linux)
source .venv/bin/activate

# Install production dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

## Running

```bash
uvicorn app.main:app --reload --port 8001
```

OpenAPI docs available at: http://localhost:8001/docs

## Environment Variables

Copy `.env.example` to `.env` and populate:

```bash
cp .env.example .env
```

| Variable | Default       | Description          |
|----------|---------------|----------------------|
| PORT     | 8001          | Uvicorn listen port  |
| ENV      | development   | Runtime environment  |

## Structure

```
app/
├── main.py              # FastAPI app entry point
├── api/
│   └── routes/
│       └── health.py    # GET /health
├── services/            # Inference logic (Phase 3)
├── models/              # Pydantic schemas (Phase 3)
└── utils/               # Shared helpers
```

## Phase 3 — YAMNet Integration

The following will be added in Phase 3:
- TensorFlow / TensorFlow Hub dependency
- YAMNet model loading on startup (lifespan event)
- Audio preprocessing with Librosa / FFmpeg
- `POST /inference` endpoint accepting audio files
