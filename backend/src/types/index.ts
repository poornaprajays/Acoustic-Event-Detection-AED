// ─── Shared backend types ────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Express augmentation ────────────────────────────────────────────────────

// Extend Express Request if request-scoped properties are needed later
// Example: req.user, req.requestId
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// ─── Audio domain types ───────────────────────────────────────────────────────

/**
 * Metadata returned by the ML service after processing an audio file.
 *
 * Design note: `convertedPath` is intentionally absent.
 * The ML service stores converted WAVs internally at
 *   processed/<fileId>_converted.wav
 * Clients reference audio solely by fileId.
 */
export interface AudioMetadata {
  /** UUID v4 identifying this audio job. Used to stream the converted WAV. */
  fileId: string;
  originalFilename: string;
  originalFormat: string;
  /** Duration in seconds (raw float — formatting is the frontend's concern). */
  duration: number;
  /** Sample rate of the original audio in Hz. */
  sampleRate: number;
  /** Number of channels in the original audio. */
  channels: number;
  /** Always "wav" for Phase 2. */
  targetFormat: string;
  /** Always 16000 for YAMNet compatibility. */
  targetSampleRate: number;
  /** Always 1 (mono) for YAMNet compatibility. */
  targetChannels: number;
}

/** Shape of the POST /api/audio/upload success data field. */
export type UploadResponse = AudioMetadata;
