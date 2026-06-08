// ─── Audio / Upload types ────────────────────────────────────────────────────

export interface AudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

export interface UploadState {
  status: UploadStatus;
  file: AudioFile | null;
  progress: number; // 0–100
  error: string | null;
}

// ─── Detection result types (stubs — populated in Phase 3) ───────────────────

export interface DetectionEvent {
  label: string;
  score: number;        // confidence 0–1
  startTime: number;   // seconds from audio start
  endTime: number;
}

export interface AnalysisResult {
  id: string;
  filename: string;
  duration: number;     // seconds
  events: DetectionEvent[];
  processedAt: string;  // ISO 8601
}

// ─── API types ───────────────────────────────────────────────────────────────

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

// ─── Utility ─────────────────────────────────────────────────────────────────

export type Nullable<T> = T | null;
