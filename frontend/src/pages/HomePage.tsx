import { useNavigate } from 'react-router-dom';

import UploadCard from '@/components/UploadCard';
import type { AudioMetadata } from '@/types';

/**
 * HomePage
 *
 * Single-page upload experience.
 * Centred single-column layout with minimal copy above the UploadCard.
 * On successful upload, navigates to /results with the metadata in
 * location state (never stored in a global store or URL params).
 */
export default function HomePage() {
  const navigate = useNavigate();

  function handleUploadSuccess(metadata: AudioMetadata) {
    navigate('/results', { state: { metadata } });
  }

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      {/* Page heading */}
      <div className="mb-12 text-center space-y-3 max-w-lg">
        <p className="label">Acoustic Event Detection</p>
        <h1 className="text-3xl font-semibold text-neutral-900 text-balance">
          Analyse audio with YAMNet
        </h1>
        <p className="text-sm text-neutral-500 text-balance">
          Upload a WAV, MP3, FLAC, or M4A file. The audio will be validated,
          converted to YAMNet-compatible format, and its metadata returned
          for review.
        </p>
      </div>

      {/* Upload card */}
      <UploadCard onUploadSuccess={handleUploadSuccess} />

      {/* Supported formats note */}
      <p className="mt-8 text-xs text-neutral-400 text-center">
        Supports WAV · MP3 · FLAC · M4A &mdash; max 100 MB
      </p>
    </section>
  );
}
