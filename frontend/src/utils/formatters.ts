/**
 * formatters.ts
 * -------------
 * Pure formatting utilities for audio metadata display.
 * No side effects. All functions are deterministic.
 */

/**
 * Format a raw duration in seconds to a human-readable string.
 *
 * @example
 *   formatDuration(12.3)   → "12.3 sec"
 *   formatDuration(84.0)   → "1m 24s"
 *   formatDuration(3661.5) → "61m 1s"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) {
    return `${Math.round(seconds * 10) / 10} sec`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

/**
 * Format a sample rate (Hz) with a thousands separator.
 *
 * @example
 *   formatSampleRate(44100) → "44,100 Hz"
 *   formatSampleRate(16000) → "16,000 Hz"
 */
export function formatSampleRate(hz: number): string {
  if (!isFinite(hz) || hz <= 0) return '—';
  return `${hz.toLocaleString('en-US')} Hz`;
}

/**
 * Format a channel count to a descriptive label.
 *
 * @example
 *   formatChannels(1) → "1 (Mono)"
 *   formatChannels(2) → "2 (Stereo)"
 *   formatChannels(6) → "6 (Multi-channel)"
 */
export function formatChannels(channels: number): string {
  if (!isFinite(channels) || channels <= 0) return '—';
  if (channels === 1) return '1 (Mono)';
  if (channels === 2) return '2 (Stereo)';
  return `${channels} (Multi-channel)`;
}

/**
 * Convert a format string to its canonical uppercase display label.
 *
 * @example
 *   formatAudioFormat("mp3")  → "MP3"
 *   formatAudioFormat("wav")  → "WAV"
 *   formatAudioFormat("flac") → "FLAC"
 */
export function formatAudioFormat(format: string): string {
  if (!format) return '—';
  return format.toUpperCase();
}
