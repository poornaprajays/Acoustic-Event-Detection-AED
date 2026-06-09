import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  formatDuration,
  formatSampleRate,
  formatChannels,
  formatAudioFormat,
} from '@/utils/formatters';
import type { AudioMetadata } from '@/types';

interface LocationState {
  metadata?: AudioMetadata;
}

/**
 * ResultsPage
 *
 * Displays audio metadata after a successful upload and preprocessing.
 * Receives AudioMetadata via react-router location state.
 *
 * If accessed directly (no state), redirects to / immediately.
 *
 * Phase 2 scope:
 *   ✓ Original audio metadata card
 *   ✓ YAMNet conversion details card
 *   ✓ Native HTML audio player (converted WAV)
 *   ✗ Spectrograms, waveforms, predictions (Phase 3)
 */
export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const metadata = state?.metadata;

  // Redirect to home if no metadata in state (e.g. direct navigation)
  useEffect(() => {
    if (!metadata) {
      navigate('/', { replace: true });
    }
  }, [metadata, navigate]);

  if (!metadata) return null;

  const audioSrc = `/api/audio/${metadata.fileId}`;

  return (
    <section className="flex flex-1 flex-col items-center px-6 py-16">
      <div className="w-full max-w-2xl space-y-8">

        {/* ── Page heading ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="label">Preprocessing complete</p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Audio Analysis Results
          </h1>
          <p className="text-sm text-neutral-500">
            Ready for YAMNet inference in Phase 3.
          </p>
        </div>

        {/* ── Card 1: Original audio ───────────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-widest">
            Original Audio
          </h2>
          <div className="divide-y divide-neutral-100">
            <MetadataRow label="Filename" value={metadata.originalFilename} />
            <MetadataRow label="Format" value={formatAudioFormat(metadata.originalFormat)} />
            <MetadataRow label="Duration" value={formatDuration(metadata.duration)} />
            <MetadataRow label="Sample Rate" value={formatSampleRate(metadata.sampleRate)} />
            <MetadataRow label="Channels" value={formatChannels(metadata.channels)} />
          </div>
        </div>

        {/* ── Card 2: YAMNet conversion ────────────────────────────────── */}
        <div className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-widest">
            Converted for YAMNet
          </h2>
          <div className="divide-y divide-neutral-100">
            <MetadataRow label="Format" value={formatAudioFormat(metadata.targetFormat)} />
            <MetadataRow label="Sample Rate" value={formatSampleRate(metadata.targetSampleRate)} />
            <MetadataRow label="Channels" value={formatChannels(metadata.targetChannels)} />
            <MetadataRow
              label="Status"
              value={
                <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-sm">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"
                    aria-hidden="true"
                  />
                  Ready
                </span>
              }
            />
          </div>
        </div>

        {/* ── Card 3: Audio preview ─────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-widest">
            Audio Preview
          </h2>
          <p className="text-xs text-neutral-400">
            Playing the YAMNet-compatible converted WAV (16 kHz · Mono).
          </p>
          {/* Native HTML audio player — no custom library required */}
          <audio
            controls
            src={audioSrc}
            className="w-full"
            aria-label={`Audio preview for ${metadata.originalFilename}`}
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* ── Back button ───────────────────────────────────────────────── */}
        <div className="flex justify-start">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate('/')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Analyse another file
          </button>
        </div>

      </div>
    </section>
  );
}

// ─── MetadataRow ──────────────────────────────────────────────────────────────

interface MetadataRowProps {
  label: string;
  value: React.ReactNode;
}

function MetadataRow({ label, value }: MetadataRowProps) {
  return (
    <div className="flex items-center justify-between py-3 gap-4">
      <dt className="text-sm text-neutral-500 shrink-0">{label}</dt>
      <dd className="text-sm font-medium text-neutral-900 text-right">{value}</dd>
    </div>
  );
}
