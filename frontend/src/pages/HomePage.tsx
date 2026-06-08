import UploadCard from '@/components/UploadCard';

/**
 * HomePage
 *
 * Single-page upload experience.
 * Centred single-column layout with minimal copy above the UploadCard.
 */
export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-20">
      {/* Page heading */}
      <div className="mb-12 text-center space-y-3 max-w-lg">
        <p className="label">Acoustic Event Detection</p>
        <h1 className="text-3xl font-semibold text-neutral-900 text-balance">
          Analyse audio with YAMNet
        </h1>
        <p className="text-sm text-neutral-500 text-balance">
          Upload a WAV, MP3, OGG, FLAC, or M4A file and receive a time-stamped
          breakdown of detected acoustic events.
        </p>
      </div>

      {/* Upload card */}
      <UploadCard status="idle" />

      {/* Supported formats note */}
      <p className="mt-8 text-xs text-neutral-400 text-center">
        Files are processed locally — your audio is never stored without consent.
      </p>
    </section>
  );
}
