import time
import os
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_start_time = time.time()


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    environment: str


@router.get("/health", response_model=HealthResponse, summary="Liveness check")
async def health_check() -> HealthResponse:
    """
    Returns the service health status.

    - **status**: Always `"ok"` when the service is running.
    - **uptime_seconds**: Seconds since the process started.
    - **environment**: Current `ENV` setting.
    """
    return HealthResponse(
        status="ok",
        uptime_seconds=round(time.time() - _start_time, 2),
        environment=os.getenv("ENV", "development"),
    )
