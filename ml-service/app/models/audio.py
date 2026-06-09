"""
audio.py  (models)
------------------
Pydantic v2 schemas for the audio processing API.

Design note: `converted_path` is intentionally absent from
AudioMetadataResponse.  The server stores converted files at
  processed/<file_id>_converted.wav
but filesystem paths are never exposed through the public API.
Clients reference audio solely by `file_id`.
"""

from pydantic import BaseModel, Field


class AudioMetadataResponse(BaseModel):
    """
    Response returned by POST /audio/process.
    Contains metadata about the original upload and the
    YAMNet-compatible conversion — no filesystem paths.
    """

    file_id: str = Field(..., description="UUID v4 that uniquely identifies this audio job.")
    original_filename: str = Field(..., description="Original filename as uploaded by the client.")
    original_format: str = Field(..., description="Detected container format (e.g. 'mp3', 'flac').")
    duration: float = Field(..., description="Duration of the audio in seconds.", ge=0)
    sample_rate: int = Field(..., description="Sample rate of the original audio in Hz.", gt=0)
    channels: int = Field(..., description="Number of audio channels in the original file.", gt=0)
    target_format: str = Field(default="wav", description="Output container format.")
    target_sample_rate: int = Field(default=16000, description="Output sample rate in Hz.")
    target_channels: int = Field(default=1, description="Output channel count.")

    model_config = {"json_schema_extra": {"example": {
        "file_id": "3f2a8c1d-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
        "original_filename": "recording.mp3",
        "original_format": "mp3",
        "duration": 12.34,
        "sample_rate": 44100,
        "channels": 2,
        "target_format": "wav",
        "target_sample_rate": 16000,
        "target_channels": 1,
    }}}
