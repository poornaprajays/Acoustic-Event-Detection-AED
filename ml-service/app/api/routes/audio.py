"""
audio.py  (routes)
------------------
Audio processing endpoints for the ML service.

Endpoints
---------
POST /audio/process
    Receive an uploaded audio file, extract metadata, convert to
    YAMNet-compatible format (WAV / 16 kHz / mono), and return metadata.
    No filesystem paths are exposed in the response.

GET /audio/{file_id}
    Stream the converted WAV file for the given file_id.
    Used by the backend to proxy audio to the frontend player.
"""

import logging
import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.models.audio import AudioMetadataResponse
from app.services import audio_conversion_service, audio_metadata_service
from app.utils.errors import AudioProcessingError

logger = logging.getLogger(__name__)

router = APIRouter()

# Resolved at import time — PROCESSED_DIR is set in main.py startup
PROCESSED_DIR = Path("processed")

SUPPORTED_EXTENSIONS = {"wav", "mp3", "flac", "m4a"}


def _get_extension(filename: str) -> str:
    """Return the lowercase extension without the leading dot."""
    return Path(filename).suffix.lstrip(".").lower()


# ─── POST /audio/process ──────────────────────────────────────────────────────


@router.post(
    "/process",
    response_model=AudioMetadataResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and preprocess an audio file",
    description=(
        "Accepts a multipart audio upload. Extracts metadata with ffprobe, "
        "converts to WAV / 16 kHz / mono with ffmpeg, and returns metadata. "
        "No filesystem paths are included in the response."
    ),
)
async def process_audio(file: UploadFile) -> AudioMetadataResponse:
    # ── Validate filename / extension ─────────────────────────────────────
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file has no filename.",
        )

    ext = _get_extension(file.filename)
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file extension '.{ext}'. "
                f"Accepted: {sorted(SUPPORTED_EXTENSIONS)}."
            ),
        )

    file_id = str(uuid4())
    original_path = PROCESSED_DIR / f"{file_id}_original.{ext}"
    converted_path = PROCESSED_DIR / f"{file_id}_converted.wav"

    # ── Persist original file ─────────────────────────────────────────────
    try:
        content = await file.read()
        original_path.write_bytes(content)
    except OSError as exc:
        logger.error("Failed to write original file: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not save the uploaded file.",
        )
    finally:
        await file.close()

    # ── Extract original metadata ─────────────────────────────────────────
    try:
        original_meta = await audio_metadata_service.extract_metadata(
            str(original_path)
        )
    except AudioProcessingError as exc:
        logger.error("Metadata extraction failed [%s]: %s", file_id, exc.detail)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Metadata extraction failed: {exc.message}",
        )

    # ── Convert to YAMNet-compatible format ───────────────────────────────
    try:
        await audio_conversion_service.convert(
            str(original_path), str(converted_path)
        )
    except AudioProcessingError as exc:
        logger.error("Audio conversion failed [%s]: %s", file_id, exc.detail)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Audio conversion failed: {exc.message}",
        )

    logger.info(
        "Processed audio [%s]: %s → WAV/16kHz/mono",
        file_id,
        file.filename,
    )

    return AudioMetadataResponse(
        file_id=file_id,
        original_filename=file.filename,
        original_format=original_meta.format_name,
        duration=round(original_meta.duration, 3),
        sample_rate=original_meta.sample_rate,
        channels=original_meta.channels,
        target_format="wav",
        target_sample_rate=16000,
        target_channels=1,
    )


# ─── GET /audio/{file_id} ─────────────────────────────────────────────────────


@router.get(
    "/{file_id}",
    summary="Stream a converted audio file",
    description=(
        "Returns the converted WAV file for the given file_id as audio/wav. "
        "Intended to be proxied by the backend — not called directly by the browser."
    ),
    response_class=FileResponse,
)
async def stream_audio(file_id: str) -> FileResponse:
    # Sanitise file_id to prevent path traversal
    if "/" in file_id or "\\" in file_id or ".." in file_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file_id.",
        )

    converted_path = PROCESSED_DIR / f"{file_id}_converted.wav"

    if not converted_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No converted audio found for file_id '{file_id}'.",
        )

    return FileResponse(
        path=str(converted_path),
        media_type="audio/wav",
        filename=f"{file_id}_converted.wav",
    )
