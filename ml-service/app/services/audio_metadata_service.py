"""
audio_metadata_service.py
--------------------------
Extracts audio metadata from a file using ffprobe.

Responsibilities (single):
  - Run ffprobe as an async subprocess
  - Parse the JSON output
  - Return a typed AudioFileMetadata dataclass
  - Raise AudioProcessingError on any failure

No FFmpeg conversion happens here.
"""

import asyncio
import json
import os
from dataclasses import dataclass

from app.utils.errors import AudioProcessingError


@dataclass
class AudioFileMetadata:
    """Metadata extracted from an audio file by ffprobe."""

    duration: float      # seconds
    sample_rate: int     # Hz
    channels: int
    format_name: str     # e.g. "mp3", "wav", "flac"


async def extract_metadata(file_path: str) -> AudioFileMetadata:
    """
    Run ffprobe on *file_path* and return an AudioFileMetadata instance.

    Parameters
    ----------
    file_path : str
        Absolute or relative path to the audio file.

    Raises
    ------
    AudioProcessingError
        If the file does not exist, ffprobe exits non-zero, or the
        output JSON is missing expected keys.
    """
    if not os.path.isfile(file_path):
        raise AudioProcessingError(
            "File not found for metadata extraction.",
            detail=f"path={file_path}",
        )

    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-print_format", "json",
        "-show_streams",
        "-show_format",
        file_path,
    ]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
    except FileNotFoundError:
        raise AudioProcessingError(
            "ffprobe is not installed or not on PATH.",
            detail="Ensure ffprobe is available in the execution environment.",
        )

    if proc.returncode != 0:
        raise AudioProcessingError(
            "ffprobe failed to read the audio file.",
            detail=stderr.decode(errors="replace").strip(),
        )

    try:
        data = json.loads(stdout.decode())
    except json.JSONDecodeError as exc:
        raise AudioProcessingError(
            "ffprobe produced invalid JSON output.",
            detail=str(exc),
        )

    # ── Extract audio stream info ──────────────────────────────────────────
    audio_streams = [
        s for s in data.get("streams", [])
        if s.get("codec_type") == "audio"
    ]

    if not audio_streams:
        raise AudioProcessingError(
            "No audio stream found in the file.",
            detail=f"streams={[s.get('codec_type') for s in data.get('streams', [])]}",
        )

    audio_stream = audio_streams[0]

    # ── Parse fields with explicit fallback handling ───────────────────────
    try:
        # Duration: prefer stream-level, fall back to format-level
        raw_duration = (
            audio_stream.get("duration")
            or data.get("format", {}).get("duration")
        )
        if raw_duration is None:
            raise KeyError("duration")
        duration = float(raw_duration)

        sample_rate = int(audio_stream["sample_rate"])
        channels = int(audio_stream["channels"])

        # Format name: use the first token (e.g. "mp3" from "mp3,audio")
        format_name = data["format"]["format_name"].split(",")[0].strip()

    except (KeyError, ValueError, TypeError) as exc:
        raise AudioProcessingError(
            "ffprobe output is missing required audio fields.",
            detail=str(exc),
        )

    return AudioFileMetadata(
        duration=duration,
        sample_rate=sample_rate,
        channels=channels,
        format_name=format_name,
    )
