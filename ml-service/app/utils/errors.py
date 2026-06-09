"""
errors.py
---------
Typed exception classes for the AED ML service.
All audio processing failures raise AudioProcessingError so the route
handler has a single, predictable exception type to catch.
"""


class AudioProcessingError(Exception):
    """
    Raised when any audio processing step fails (ffprobe, ffmpeg,
    file I/O, format validation).

    Attributes
    ----------
    message : str
        Short, human-readable error description.
    detail : str
        Optional technical detail (e.g. stderr output) for logging.
    """

    def __init__(self, message: str, detail: str = "") -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail

    def __repr__(self) -> str:
        return f"AudioProcessingError(message={self.message!r}, detail={self.detail!r})"
