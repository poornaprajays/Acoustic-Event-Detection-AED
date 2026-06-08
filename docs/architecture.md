# AED Explorer — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User's Browser                             │
│                    React + TypeScript + Vite                        │
│                          Port: 5173                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP REST (proxied via Vite dev server)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Express Backend                             │
│                       Node.js + TypeScript                          │
│                           Port: 3000                                │
│                                                                     │
│   routes → controllers → services                                   │
└─────────────┬───────────────────────────────┬───────────────────────┘
              │ HTTP (internal)               │ pg (node-postgres)
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────────────┐
│    FastAPI ML Service   │     │           PostgreSQL 16              │
│   Python + TensorFlow   │     │            Port: 5432               │
│       Port: 8001        │     └─────────────────────────────────────┘
│                         │
│  /inference  (Phase 3)  │
│  /health                │
└─────────────────────────┘
```

## Request Flow (Phase 2+)

1. User drops an audio file on the **UploadCard**.
2. **Frontend** `POST /api/upload` → **Express Backend**.
3. Backend validates the file, stores metadata, forwards audio to **ML Service** `POST /inference`.
4. ML Service preprocesses audio (FFmpeg + Librosa), runs **YAMNet**, returns detected events.
5. Backend persists results to **PostgreSQL**, returns structured JSON.
6. Frontend renders the event timeline.

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React 18 + Vite | Fastest DX, broad ecosystem |
| CSS | TailwindCSS v3 | Utility-first, zero runtime |
| Backend runtime | Node.js 20 LTS | Matches frontend language (TypeScript) |
| Backend framework | Express 4 | Minimal, well-understood, stable |
| ML service language | Python 3.11 | Required for TensorFlow / YAMNet |
| ML framework | FastAPI | Async, automatic OpenAPI docs |
| Schema validation | Zod (BE) + Pydantic v2 (ML) | Type-safe env and request validation |
| Database | PostgreSQL 16 | Relational, JSONB support for event arrays |
| Containerisation | Docker Compose | Consistent dev and prod environments |

## Folder Conventions

- **Types first**: All shared types live in each service's `types/` directory.
- **No logic in routes**: Routes call controllers; controllers call services.
- **Fail fast**: Both backend (Zod) and ML service (pydantic-settings) validate env vars at startup.
- **Consistent health checks**: All three services expose a `/health` endpoint with the same schema pattern.

## Environment Boundaries

| Boundary | Mechanism |
|----------|-----------|
| Frontend → Backend | HTTP REST via Vite proxy (dev) / nginx (prod) |
| Backend → ML Service | HTTP REST, internal Docker network |
| Backend → PostgreSQL | node-postgres connection pool |
| Secrets | `.env` files, never committed; Docker env injection in prod |
