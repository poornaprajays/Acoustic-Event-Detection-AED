/**
 * useUpload.ts
 * ------------
 * Upload state machine hook.
 *
 * States
 * ------
 *   idle      Initial state. Ready to accept a file.
 *   uploading File is being sent; progress 0→100.
 *   success   Upload and processing complete. metadata is set.
 *   error     Upload or processing failed. state.error is set.
 *
 * Transitions
 * -----------
 *   idle  ──[upload()]──► uploading ──[resolve]──► success
 *                                    └─[reject]──► error
 *   success / error ──[reset()]──► idle
 */
import { useCallback, useReducer } from 'react';

import { uploadAudio } from '@/services/audioApi';
import type { AudioMetadata, UploadError, UploadState, UploadStatus } from '@/types';

// ─── State & Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'START'; file: File }
  | { type: 'PROGRESS'; percent: number }
  | { type: 'SUCCESS'; metadata: AudioMetadata }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' };

const initialState: UploadState = {
  status: 'idle',
  file: null,
  progress: 0,
  error: null,
};

function reducer(state: UploadState, action: Action): UploadState {
  switch (action.type) {
    case 'START':
      return {
        status: 'uploading',
        file: {
          id: crypto.randomUUID(),
          name: action.file.name,
          size: action.file.size,
          type: action.file.type,
          lastModified: action.file.lastModified,
        },
        progress: 0,
        error: null,
      };

    case 'PROGRESS':
      return { ...state, progress: action.percent };

    case 'SUCCESS':
      return { ...state, status: 'success', progress: 100, error: null };

    case 'ERROR':
      return { ...state, status: 'error', error: action.message };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseUploadReturn {
  state: UploadState;
  metadata: AudioMetadata | null;
  upload: (file: File) => Promise<void>;
  reset: () => void;
}

export function useUpload(): UseUploadReturn {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [metadata, setMetadata] = useReducerMetadata();

  const upload = useCallback(
    async (file: File): Promise<void> => {
      // Guard: prevent double submission
      if ((state.status as UploadStatus) !== 'idle') return;

      dispatch({ type: 'START', file });
      setMetadata(null);

      try {
        const result = await uploadAudio(file, (percent) => {
          dispatch({ type: 'PROGRESS', percent });
        });

        setMetadata(result);
        dispatch({ type: 'SUCCESS', metadata: result });
      } catch (err) {
        const uploadError = err as UploadError;
        const message =
          uploadError?.error?.message ?? 'An unexpected error occurred.';
        dispatch({ type: 'ERROR', message });
      }
    },
    [state.status, setMetadata],
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setMetadata(null);
  }, [setMetadata]);

  return { state, metadata, upload, reset };
}

// ─── Metadata sub-state ───────────────────────────────────────────────────────
// Kept separate from UploadState to avoid polluting the upload state shape
// with data that belongs to the results domain.

function useReducerMetadata() {
  const [metadata, setMetadata] = useReducer(
    (_prev: AudioMetadata | null, next: AudioMetadata | null) => next,
    null,
  );
  return [metadata, setMetadata] as const;
}
