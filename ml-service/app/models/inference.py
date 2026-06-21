"""
inference.py  (models)
----------------------
Pydantic v2 schemas for the YAMNet inference API.

InferenceResponse is returned by POST /audio/{file_id}/analyse.
DetectionEvent represents a single detected acoustic class within the audio.
"""

from typing import List

from pydantic import BaseModel, Field


class DetectionEvent(BaseModel):
    """
    A single YAMNet-detected acoustic event.

    Attributes
    ----------
    label : str
        Human-readable YAMNet class name (e.g. "Music", "Speech", "Dog").
    score : float
        Mean confidence score across all overlapping patches (0.0–1.0).
    start_time : float
        Earliest patch start time in seconds where this class was detected.
    end_time : float
        Latest patch end time in seconds where this class was detected.
    """

    label: str = Field(..., description="YAMNet class label name.")
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score (0–1).")
    start_time: float = Field(..., ge=0.0, description="Start time in seconds.")
    end_time: float = Field(..., ge=0.0, description="End time in seconds.")

    model_config = {"json_schema_extra": {"example": {
        "label": "Music",
        "score": 0.87,
        "start_time": 0.0,
        "end_time": 3.9,
    }}}


class InferenceResponse(BaseModel):
    """
    Full inference result for a processed audio file.

    Attributes
    ----------
    file_id : str
        UUID v4 that was returned by POST /audio/process.
    filename : str
        Original filename as uploaded by the client.
    duration : float
        Duration of the source audio in seconds.
    events : list[DetectionEvent]
        Detected acoustic events, sorted by score descending.
    processed_at : str
        ISO 8601 timestamp of when inference completed.
    """

    file_id: str = Field(..., description="UUID v4 audio job identifier.")
    filename: str = Field(..., description="Original uploaded filename.")
    duration: float = Field(..., ge=0.0, description="Audio duration in seconds.")
    events: List[DetectionEvent] = Field(
        ..., description="Detected events sorted by score descending."
    )
    processed_at: str = Field(..., description="ISO 8601 inference completion timestamp.")

    model_config = {"json_schema_extra": {"example": {
        "file_id": "3f2a8c1d-4e5b-6f7a-8b9c-0d1e2f3a4b5c",
        "filename": "recording.mp3",
        "duration": 12.34,
        "events": [
            {"label": "Music", "score": 0.87, "start_time": 0.0, "end_time": 3.9},
            {"label": "Speech", "score": 0.43, "start_time": 4.9, "end_time": 9.8},
        ],
        "processed_at": "2024-01-15T10:30:00Z",
    }}}
