import { useCallback, useRef, useState } from 'react';
import { attachPhotoToTask } from '../services/photoService';
import type { AttachPhotoResult } from '../types';

type UseAttachTaskPhotoReturn = {
  attachPhoto: (photo: File, overrideTaskId?: number | string) => Promise<AttachPhotoResult>;
  result: AttachPhotoResult | null;
  loading: boolean;
  error: unknown;
  progress: number;
  cancel: () => void;
  reset: () => void;
};

export const useAttachTaskPhoto = (
  taskId?: number | string | null
): UseAttachTaskPhotoReturn => {
  const [result, setResult] = useState<AttachPhotoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [progress, setProgress] = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const attachPhoto = useCallback(
    async (photo: File, overrideTaskId?: number | string) => {
      const effectiveTaskId = overrideTaskId ?? taskId;

      if (effectiveTaskId === null || effectiveTaskId === undefined || effectiveTaskId === '') {
        const missingIdError = new Error('A valid task ID is required to attach a photo.');
        setError(missingIdError);
        throw missingIdError;
      }

      try {
        setLoading(true);
        setError(null);
        setProgress(0);
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        const response = await attachPhotoToTask(effectiveTaskId, photo, {
          onProgress: (p) => setProgress(p),
          signal: abortRef.current.signal,
        });
        setResult(response);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [taskId]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setError(new Error('Upload canceled'));
      setLoading(false);
    }
  }, []);

  return {
    attachPhoto,
    result,
    loading,
    error,
    progress,
    cancel,
    reset,
  };
};
