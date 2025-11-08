import { useCallback, useState } from 'react';
import { attachPhotoToTask } from '../services/photoService';
import type { AttachPhotoResult } from '../types';

type UseAttachTaskPhotoReturn = {
  attachPhoto: (photo: File, overrideTaskId?: number | string) => Promise<AttachPhotoResult>;
  result: AttachPhotoResult | null;
  loading: boolean;
  error: unknown;
  reset: () => void;
};

export const useAttachTaskPhoto = (
  taskId?: number | string | null
): UseAttachTaskPhotoReturn => {
  const [result, setResult] = useState<AttachPhotoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

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
        const response = await attachPhotoToTask(effectiveTaskId, photo);
        setResult(response);
        return response;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskId]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    attachPhoto,
    result,
    loading,
    error,
    reset,
  };
};
