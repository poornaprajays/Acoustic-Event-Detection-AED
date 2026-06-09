/**
 * audioApi.ts
 * -----------
 * Thin HTTP client for the audio upload API.
 *
 * Uses XMLHttpRequest instead of fetch to support upload progress reporting
 * via xhr.upload.onprogress. The fetch API does not expose upload progress.
 */
import type { AudioMetadata, UploadError } from '@/types';

const UPLOAD_ENDPOINT = '/api/audio/upload';

/**
 * Upload an audio file to the backend.
 *
 * @param file        The File object selected or dropped by the user.
 * @param onProgress  Callback invoked with an integer 0–100 as bytes upload.
 * @returns           Resolved AudioMetadata on success.
 * @throws            An UploadError-shaped object on HTTP error or network failure.
 */
export function uploadAudio(
  file: File,
  onProgress: (percent: number) => void,
): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('audio', file, file.name);

    // ── Progress tracking ────────────────────────────────────────────────
    xhr.upload.onprogress = (event: ProgressEvent) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    // ── Success ──────────────────────────────────────────────────────────
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          // Response shape: ApiSuccessResponse<AudioMetadata>
          const body = JSON.parse(xhr.responseText) as {
            success: true;
            data: AudioMetadata;
            message: string;
          };
          resolve(body.data);
        } catch {
          reject({
            success: false,
            error: { message: 'Invalid response from server.', code: 'PARSE_ERROR' },
          } satisfies UploadError);
        }
      } else {
        // Parse the backend error shape
        try {
          const errorBody = JSON.parse(xhr.responseText) as UploadError;
          reject(errorBody);
        } catch {
          reject({
            success: false,
            error: {
              message: `Upload failed with status ${xhr.status}.`,
              code: 'HTTP_ERROR',
            },
          } satisfies UploadError);
        }
      }
    };

    // ── Network failure ───────────────────────────────────────────────────
    xhr.onerror = () => {
      reject({
        success: false,
        error: {
          message: 'Network error. Check that the server is running.',
          code: 'NETWORK_ERROR',
        },
      } satisfies UploadError);
    };

    xhr.ontimeout = () => {
      reject({
        success: false,
        error: {
          message: 'Upload timed out. Try a smaller file or check your connection.',
          code: 'TIMEOUT',
        },
      } satisfies UploadError);
    };

    xhr.open('POST', UPLOAD_ENDPOINT);
    xhr.timeout = 5 * 60 * 1000; // 5 minutes — accommodate large file uploads
    xhr.send(form);
  });
}
