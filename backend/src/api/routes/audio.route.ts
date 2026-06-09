import { Router } from 'express';

import { uploadSingle } from '@/api/middleware/upload.middleware';
import { uploadAudio, streamAudioFile } from '@/api/controllers/audio.controller';

const router = Router();

/**
 * POST /api/audio/upload
 *
 * Upload an audio file (WAV, MP3, FLAC, M4A).
 * Multer validates MIME type and file size (100 MB limit).
 * Returns AudioMetadata after processing by the ML service.
 */
router.post('/upload', uploadSingle, uploadAudio);

/**
 * GET /api/audio/:fileId
 *
 * Stream the YAMNet-compatible converted WAV for a given fileId.
 * Proxied from the ML service. Used as src for the frontend audio player.
 */
router.get('/:fileId', streamAudioFile);

export default router;
