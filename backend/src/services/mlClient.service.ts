/**
 * mlClient.service.ts
 * -------------------
 * HTTP client for communicating with the FastAPI ML service.
 *
 * Uses Node 20's built-in global fetch (no node-fetch dependency needed).
 * The backend is CommonJS ("type": "commonjs"), and node-fetch v3 is
 * ESM-only, so the built-in fetch is the correct choice here.
 *
 * Responsibilities:
 *  - Forward audio files to the ML service (multipart/form-data)
 *  - Proxy audio streams from the ML service to the caller
 *  - Delete relay copies from backend/uploads/ after forwarding
 *  - Map ML service errors to AppError with appropriate HTTP codes
 */
import fs from 'fs';
import path from 'path';

import config from '@/config';
import { AppError } from '@/api/middleware/appError';
import type { AudioMetadata } from '@/types';

// ─── ML service response shape (snake_case from Python) ──────────────────────

interface MlAudioMetadataResponse {
  file_id: string;
  original_filename: string;
  original_format: string;
  duration: number;
  sample_rate: number;
  channels: number;
  target_format: string;
  target_sample_rate: number;
  target_channels: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toAudioMetadata(raw: MlAudioMetadataResponse): AudioMetadata {
  return {
    fileId: raw.file_id,
    originalFilename: raw.original_filename,
    originalFormat: raw.original_format,
    duration: raw.duration,
    sampleRate: raw.sample_rate,
    channels: raw.channels,
    targetFormat: raw.target_format,
    targetSampleRate: raw.target_sample_rate,
    targetChannels: raw.target_channels,
  };
}

async function deleteRelayFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    // Non-fatal — log and continue. The relay copy may have already been removed.
    console.warn('[mlClient] Could not delete relay file:', filePath, err);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Forward an audio file from disk to the ML service for processing.
 *
 * @param filePath       Absolute path to the relay copy in backend/uploads/
 * @param originalName   Original filename reported by the browser
 * @returns              Parsed AudioMetadata from the ML service response
 * @throws AppError      On network failure or ML service error
 */
export async function processAudio(
  filePath: string,
  originalName: string,
): Promise<AudioMetadata> {
  const fileBuffer = await fs.promises.readFile(filePath);
  const ext = path.extname(originalName).toLowerCase();

  // Use the Blob/FormData globals available in Node 20+
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
  const form = new FormData();
  form.append('file', blob, originalName || `upload${ext}`);

  let response: Response;
  try {
    response = await fetch(`${config.ML_SERVICE_URL}/audio/process`, {
      method: 'POST',
      body: form,
    });
  } catch (networkErr) {
    await deleteRelayFile(filePath);
    throw new AppError(
      'Could not reach the ML service. Ensure it is running.',
      503,
      'ML_SERVICE_UNAVAILABLE',
    );
  }

  // Always clean up the relay copy, regardless of ML service outcome
  await deleteRelayFile(filePath);

  if (!response.ok) {
    let detail = `ML service responded with ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // Ignore JSON parse failures; use the status-based message
    }

    const statusCode = response.status >= 500 ? 502 : response.status;
    throw new AppError(detail, statusCode, 'ML_SERVICE_ERROR');
  }

  const raw = (await response.json()) as MlAudioMetadataResponse;
  return toAudioMetadata(raw);
}

/**
 * Proxy a GET /audio/{fileId} request from the ML service.
 *
 * @param fileId   The file_id returned from processAudio()
 * @returns        The raw fetch Response whose body can be piped to res
 * @throws AppError  On 404 or network/service error
 */
export async function streamAudio(fileId: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${config.ML_SERVICE_URL}/audio/${fileId}`);
  } catch {
    throw new AppError(
      'Could not reach the ML service to stream audio.',
      503,
      'ML_SERVICE_UNAVAILABLE',
    );
  }

  if (response.status === 404) {
    throw new AppError(
      `Audio file not found for id '${fileId}'.`,
      404,
      'FILE_NOT_FOUND',
    );
  }

  if (!response.ok) {
    throw new AppError(
      `ML service returned ${response.status} for audio stream.`,
      502,
      'ML_SERVICE_ERROR',
    );
  }

  return response;
}
