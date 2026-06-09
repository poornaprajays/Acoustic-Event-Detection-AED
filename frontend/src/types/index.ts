// ─── Audio / Upload types ────────────────────────────────────────────────────

export interface AudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadState {
  status: UploadStatus;
  file: AudioFile | null;
  progress: number; // 0–100
  error: string | null;
}

// ─── Phase 2: Audio upload API contracts ─────────────────────────────────────

/**
 * Metadata returned by the backend after a successful upload + conversion.
 *
 * Note: `convertedPath` is intentionally absent — the server never exposes
 * filesystem paths. Use `fileId` with GET /api/audio/:fileId to stream audio.
 */
export interface AudioMetadata {
  /** UUID v4 identifying this audio job. */
  fileId: string;
  originalFilename: string;
  originalFormat: string;
  /** Raw duration in seconds. Use formatDuration() for display. */
  duration: number;
  /** Sample rate of the original audio in Hz. */
  sampleRate: number;
  /** Number of channels in the original audio. */
  channels: number;
  /** Always "wav" for Phase 2. */
  targetFormat: 'wav';
  /** Always 16000 — YAMNet requirement. */
  targetSampleRate: 16000;
  /** Always 1 (mono) — YAMNet requirement. */
  targetChannels: 1;
}

export interface UploadResponse {
  success: true;
  data: AudioMetadata;
  message: string;
}

export interface UploadError {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

// ─── API utility types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// ─── Phase 3 stub: YAMNet inference result ────────────────────────────────────
// These types are defined now to avoid breaking changes when Phase 3 is
// implemented. They are intentionally unused in Phase 2.

export interface DetectionEvent {
  label: string;
  score: number;     // confidence 0–1
  startTime: number; // seconds from audio start
  endTime: number;
}

export interface AudioAnalysisResult {
  fileId: string;
  filename: string;
  duration: number;
  events: DetectionEvent[];
  processedAt: string; // ISO 8601
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export type Nullable<T> = T | null;
