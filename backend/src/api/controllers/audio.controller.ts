import { Request, Response, NextFunction } from 'express';

import { AppError } from '@/api/middleware/appError';
import { processAudio, streamAudio } from '@/services/mlClient.service';
import type { ApiSuccessResponse, UploadResponse } from '@/types';

// ─── POST /api/audio/upload ───────────────────────────────────────────────────

/**
 * uploadAudio
 *
 * Receives the audio file written by Multer (req.file), forwards it to the
 * ML service for metadata extraction and FFmpeg conversion, and returns the
 * structured AudioMetadata to the client.
 *
 * The relay copy in backend/uploads/ is deleted by mlClientService
 * after forwarding — regardless of success or failure.
 */
export async function uploadAudio(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError(
        'No audio file provided. Include a file in the "audio" form field.',
        400,
        'NO_FILE',
      );
    }

    const metadata = await processAudio(req.file.path, req.file.originalname);

    const body: ApiSuccessResponse<UploadResponse> = {
      success: true,
      data: metadata,
      message: 'Audio processed successfully.',
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/audio/:fileId ───────────────────────────────────────────────────

/**
 * streamAudioFile
 *
 * Proxies the converted WAV from the ML service to the client.
 * Used as the src for the <audio> element on the ResultsPage.
 * No filesystem path is ever sent to the browser.
 */
export async function streamAudioFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      throw new AppError('fileId parameter is required.', 400, 'MISSING_PARAM');
    }

    const mlResponse = await streamAudio(fileId);

    // Pipe the ML service response body directly to the client
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');

    if (mlResponse.body) {
      // Node 20 fetch ReadableStream → Node.js Writable (res)
      const { Readable } = await import('stream');
      const nodeStream = Readable.fromWeb(
        mlResponse.body as import('stream/web').ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      throw new AppError('ML service returned an empty body.', 502, 'ML_SERVICE_ERROR');
    }
  } catch (err) {
    next(err);
  }
}
