import { useCallback, useState } from 'react';
import { deleteTaskPhoto } from '../services/photoService';
import type { DeletePhotoResponse } from '../types';

type UseDeleteTaskPhotoReturn = {
  deletePhoto: (photoId: number | string, overrideTaskId?: number | string) => Promise<DeletePhotoResponse>;
  response: DeletePhotoResponse | null;
  loading: boolean;
  error: unknown;
  reset: () => void;
};

export const useDeleteTaskPhoto = (
  taskId?: number | string | null
): UseDeleteTaskPhotoReturn => {
  const [response, setResponse] = useState<DeletePhotoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const deletePhoto = useCallback(
    async (photoId: number | string, overrideTaskId?: number | string) => {
      const effectiveTaskId = overrideTaskId ?? taskId;

      if (effectiveTaskId === null || effectiveTaskId === undefined || effectiveTaskId === '') {
        const missingIdError = new Error('A valid task ID is required to delete a photo.');
        setError(missingIdError);
        throw missingIdError;
      }

      if (photoId === null || photoId === undefined || photoId === '') {
        const missingPhotoError = new Error('A valid photo ID is required to delete a photo.');
        setError(missingPhotoError);
        throw missingPhotoError;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await deleteTaskPhoto(effectiveTaskId, photoId);
        setResponse(result);
        return result;
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
    setResponse(null);
    setError(null);
  }, []);

  return {
    deletePhoto,
    response,
    loading,
    error,
    reset,
  };
};
