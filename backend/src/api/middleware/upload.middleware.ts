/**
 * upload.middleware.ts
 * --------------------
 * Multer configuration for audio file uploads.
 *
 * Storage  : disk (backend/uploads/) — files are relay copies, deleted
 *            by the controller after forwarding to the ML service.
 * Naming   : <uuid>.<original-extension>
 * Limits   : 100 MB
 * MIME     : wav, mp3, flac, m4a (with extension fallback for browsers
 *            that report application/octet-stream)
 */
import fs from 'fs';
import path from 'path';

import multer, { FileFilterCallback } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

import { AppError } from './appError';

// ─── Upload directory ─────────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');

// Create the directory synchronously at module load time.
// This runs once when the server starts and is safe to call repeatedly.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Accepted formats ─────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = new Set([
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mpeg',         // .mp3
  'audio/mp3',
  'audio/flac',
  'audio/x-flac',
  'audio/mp4',          // .m4a
  'audio/x-m4a',
  'audio/aac',          // some browsers send this for .m4a
]);

const ACCEPTED_EXTENSIONS = new Set(['.wav', '.mp3', '.flac', '.m4a']);

// ─── File filter ──────────────────────────────────────────────────────────────

function audioFileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = ACCEPTED_MIME_TYPES.has(file.mimetype);
  const extOk = ACCEPTED_EXTENSIONS.has(ext);

  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file type. Accepted formats: WAV, MP3, FLAC, M4A.`,
        415,
        'UNSUPPORTED_MEDIA_TYPE',
      ),
    );
  }
}

// ─── Disk storage ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ─── Multer instance ──────────────────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

/**
 * Middleware: accept a single audio file in the 'audio' field.
 * On success, sets req.file.
 * On MIME/extension rejection: passes AppError(415) to next().
 * On size exceeded: passes MulterError(LIMIT_FILE_SIZE) to next()
 *   — caught by the MulterError guard in errorHandler.ts.
 */
export const uploadSingle = upload.single('audio');
