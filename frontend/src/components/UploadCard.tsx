import { useRef } from 'react';

import { useUpload } from '@/hooks/useUpload';
import type { AudioMetadata } from '@/types';

interface UploadCardProps {
  /** Called with the processed metadata when upload succeeds. */
  onUploadSuccess: (metadata: AudioMetadata) => void;
}

// Accepted audio MIME types — WAV, MP3, FLAC, M4A only (OGG not supported)
const ACCEPTED_MIME_TYPES = [
  'audio/wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',
  'audio/x-m4a',
];
const ACCEPTED_EXTENSIONS = '.wav,.mp3,.flac,.m4a';

/**
 * UploadCard
 *
 * Drag-and-drop / click-to-upload audio card.
 * Owns the useUpload state machine internally.
 * Calls onUploadSuccess when the ML service returns metadata.
 *
 * States rendered:
 *   idle      → Drop zone with browse prompt
 *   uploading → Progress bar + percentage
 *   success   → Brief confirmation (caller navigates away)
 *   error     → Inline error with retry option
 */
export default function UploadCard({ onUploadSuccess }: UploadCardProps) {
  const { state, metadata, upload, reset } = useUpload();
  const { status, progress, error } = state;
  const dragCounterRef = useRef(0);

  const isIdle = status === 'idle';
  const isUploading = status === 'uploading';
  const isError = status === 'error';
  const isSuccess = status === 'success';

  // Navigate on success — give the user a brief moment to see the confirmation
  if (isSuccess && metadata) {
    // Use setTimeout so the component can render the success state first
    setTimeout(() => onUploadSuccess(metadata), 600);
  }

  // ── File handlers ──────────────────────────────────────────────────────

  function handleFileSelected(file: File | undefined) {
    if (!file || !isIdle) return;

    // Client-side MIME validation (backend validates too)
    if (!ACCEPTED_MIME_TYPES.includes(file.type) && file.type !== '') {
      return; // Silently ignore — the file input accept attribute filtered it
    }

    void upload(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileSelected(e.target.files?.[0]);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounterRef.current = 0;
    if (!isIdle) return;
    handleFileSelected(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  function handleDragEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounterRef.current += 1;
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragCounterRef.current -= 1;
  }

  // ── Render helpers ─────────────────────────────────────────────────────

  function renderIcon() {
    if (isSuccess) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-green-500"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }

    if (isUploading) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent-500 animate-pulse"
          aria-hidden="true"
        >
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
    }

    // idle / error — upload icon
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isError ? 'text-red-400' : 'text-neutral-500'}
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    );
  }

  function renderBody() {
    if (isSuccess) {
      return (
        <div className="text-center space-y-1.5">
          <p className="text-sm font-medium text-green-600">Upload complete</p>
          <p className="text-xs text-neutral-400">Loading results…</p>
        </div>
      );
    }

    if (isUploading) {
      return (
        <div className="w-full max-w-xs space-y-3">
          <p className="text-sm font-medium text-neutral-700 text-center">
            Processing audio…
          </p>
          {/* Progress bar */}
          <div
            className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Upload progress"
          >
            <div
              className="bg-accent-500 h-full rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400 text-center">{progress}%</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            type="button"
            className="btn-ghost text-xs px-3 py-1.5"
            onClick={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    // idle
    return (
      <div className="text-center space-y-1.5">
        <p className="text-sm font-medium text-neutral-800">
          Drag &amp; drop an audio file, or{' '}
          <span className="text-accent-600 underline underline-offset-2">
            browse
          </span>
        </p>
        <p className="text-xs text-neutral-400">
          Supports WAV, MP3, FLAC, M4A &mdash; max 100 MB
        </p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="card w-full max-w-xl mx-auto p-1">
      <label
        htmlFor="audio-file-input"
        className={[
          'flex flex-col items-center justify-center gap-5',
          'rounded-xl border-2 border-dashed px-8 py-16',
          'select-none transition-colors duration-150',
          isIdle
            ? 'border-neutral-200 hover:border-accent-400 hover:bg-accent-50/40 cursor-pointer'
            : 'border-neutral-200 cursor-default',
          isError ? 'border-red-200 bg-red-50/30' : '',
          isSuccess ? 'border-green-200 bg-green-50/30' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onDrop={isIdle ? handleDrop : undefined}
        onDragOver={isIdle ? handleDragOver : undefined}
        onDragEnter={isIdle ? handleDragEnter : undefined}
        onDragLeave={isIdle ? handleDragLeave : undefined}
        aria-label="Upload audio file"
        aria-disabled={!isIdle}
      >
        {/* Icon */}
        <div
          className={[
            'flex h-14 w-14 items-center justify-center rounded-2xl border',
            isSuccess
              ? 'bg-green-50 border-green-200'
              : isError
                ? 'bg-red-50 border-red-200'
                : 'bg-neutral-100 border-neutral-200',
          ].join(' ')}
        >
          {renderIcon()}
        </div>

        {/* Body */}
        {renderBody()}
      </label>

      {/* Hidden file input */}
      <input
        id="audio-file-input"
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        disabled={!isIdle}
        onChange={handleInputChange}
        aria-label="Choose audio file"
      />
    </div>
  );
}
