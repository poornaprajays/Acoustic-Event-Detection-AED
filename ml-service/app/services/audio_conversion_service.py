"""
audio_conversion_service.py
----------------------------
Converts any supported audio file to YAMNet-compatible format:
  WAV / 16 kHz / Mono

Responsibilities (single):
  - Run ffmpeg as an async subprocess
  - Verify the output file exists and is non-empty
  - Post-conversion verification via ffprobe
  - Raise AudioProcessingError on any failure

Does NOT delete output files — converted WAVs are retained
for Phase 3 YAMNet inference.
"""

import asyncio
import os

from app.services.audio_metadata_service import extract_metadata
from app.utils.errors import AudioProcessingError

# YAMNet-compatible target parameters
TARGET_SAMPLE_RATE = 16000
TARGET_CHANNELS = 1
TARGET_FORMAT = "wav"


async def convert(input_path: str, output_path: str) -> None:
    """
    Convert *input_path* to WAV / 16 kHz / mono and write to *output_path*.

    Parameters
    ----------
    input_path : str
        Path to the source audio file.
    output_path : str
        Destination path for the converted WAV file.

    Raises
    ------
    AudioProcessingError
        If the input file is missing, ffmpeg fails, the output is not
        produced, or post-conversion verification detects incorrect format.
    """
    if not os.path.isfile(input_path):
        raise AudioProcessingError(
            "Source file not found for conversion.",
            detail=f"path={input_path}",
        )

    cmd = [
        "ffmpeg",
        "-y",                      # overwrite output without prompting
        "-i", input_path,
        "-ac", str(TARGET_CHANNELS),
        "-ar", str(TARGET_SAMPLE_RATE),
        "-f", TARGET_FORMAT,
        output_path,
    ]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
    except FileNotFoundError:
        raise AudioProcessingError(
            "ffmpeg is not installed or not on PATH.",
            detail="Ensure ffmpeg is available in the execution environment.",
        )

    if proc.returncode != 0:
        raise AudioProcessingError(
            "ffmpeg conversion failed.",
            detail=stderr.decode(errors="replace").strip(),
        )

    # ── Verify output exists and is non-empty ─────────────────────────────
    if not os.path.isfile(output_path):
        raise AudioProcessingError(
            "Conversion produced no output file.",
            detail=f"expected_path={output_path}",
        )

    if os.path.getsize(output_path) == 0:
        raise AudioProcessingError(
            "Conversion produced an empty output file.",
            detail=f"path={output_path}",
        )

    # ── Post-conversion format verification ───────────────────────────────
    try:
        verified = await extract_metadata(output_path)
    except AudioProcessingError as exc:
        raise AudioProcessingError(
            "Post-conversion metadata verification failed.",
            detail=exc.detail,
        )

    if verified.sample_rate != TARGET_SAMPLE_RATE:
        raise AudioProcessingError(
            f"Converted file has incorrect sample rate: {verified.sample_rate} Hz "
            f"(expected {TARGET_SAMPLE_RATE} Hz).",
        )

    if verified.channels != TARGET_CHANNELS:
        raise AudioProcessingError(
            f"Converted file has incorrect channel count: {verified.channels} "
            f"(expected {TARGET_CHANNELS}).",
        )
