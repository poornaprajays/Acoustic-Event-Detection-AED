import type { UploadStatus } from '@/types';

interface UploadCardProps {
  /** Current upload lifecycle state */
  status?: UploadStatus;
  /** Called when the user selects or drops a file */
  onFileSelect?: (file: File) => void;
}

// Accepted audio MIME types
const ACCEPTED_TYPES = ['audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/flac', 'audio/mp4'];
const ACCEPTED_EXTENSIONS = '.wav, .mp3, .ogg, .flac, .m4a';

/**
 * UploadCard
 *
 * A focused, single-purpose drag-and-drop card.
 * Interaction handlers (actual file processing) will be wired
 * in Phase 2. This component owns only the UI structure.
 */
export default function UploadCard({ status = 'idle', onFileSelect }: UploadCardProps) {
  const isIdle = status === 'idle';

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input value so the same file can be re-selected
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && ACCEPTED_TYPES.includes(file.type) && onFileSelect) {
      onFileSelect(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
  }

  return (
    <div className="card w-full max-w-xl mx-auto p-1">
      <label
        htmlFor="audio-file-input"
        className={[
          'flex flex-col items-center justify-center gap-5',
          'rounded-xl border-2 border-dashed px-8 py-16',
          'cursor-pointer select-none',
          isIdle
            ? 'border-neutral-200 hover:border-accent-400 hover:bg-accent-50/40'
            : 'border-neutral-200 cursor-not-allowed opacity-60',
        ].join(' ')}
        onDrop={isIdle ? handleDrop : undefined}
        onDragOver={isIdle ? handleDragOver : undefined}
        aria-label="Upload audio file"
      >
        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 border border-neutral-200">
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
            className="text-neutral-500"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        {/* Copy */}
        <div className="text-center space-y-1.5">
          <p className="text-sm font-medium text-neutral-800">
            Drag &amp; drop an audio file, or{' '}
            <span className="text-accent-600 underline underline-offset-2">browse</span>
          </p>
          <p className="text-xs text-neutral-400">
            Supports {ACCEPTED_EXTENSIONS} &mdash; max 100 MB
          </p>
        </div>

        {/* Status message */}
        {!isIdle && (
          <p className="label">{status === 'error' ? 'Upload failed' : status}</p>
        )}
      </label>

      {/* Hidden file input */}
      <input
        id="audio-file-input"
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        disabled={!isIdle}
        onChange={handleFileInputChange}
        aria-label="Choose audio file"
      />
    </div>
  );
}
