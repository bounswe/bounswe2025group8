import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { getTaskPhotos } from '../services/photoService';
import type { TaskPhoto } from '../types';

type UseTaskPhotosOptions = {
  autoLoad?: boolean;
  enabled?: boolean;
};

type UseTaskPhotosReturn = {
  photos: TaskPhoto[];
  loading: boolean;
  error: unknown;
  refetch: (overrideTaskId?: number | string) => Promise<TaskPhoto[]>;
  setPhotos: Dispatch<SetStateAction<TaskPhoto[]>>;
};

const defaultOptions: UseTaskPhotosOptions = {
  autoLoad: true,
  enabled: true,
};

export const useTaskPhotos = (
  taskId: number | string | null | undefined,
  options: UseTaskPhotosOptions = {}
): UseTaskPhotosReturn => {
  const { autoLoad, enabled } = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [options]
  );

  const [photos, setPhotos] = useState<TaskPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(
    async (overrideTaskId?: number | string) => {
      const effectiveTaskId = overrideTaskId ?? taskId;

      if (effectiveTaskId === null || effectiveTaskId === undefined || effectiveTaskId === '') {
        const missingIdError = new Error('A valid task ID is required to load photos.');
        setError(missingIdError);
        throw missingIdError;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedPhotos = await getTaskPhotos(effectiveTaskId);
        setPhotos(fetchedPhotos);
        return fetchedPhotos;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskId]
  );

  useEffect(() => {
    if (!enabled || !autoLoad) {
      return;
    }

    if (taskId === null || taskId === undefined || taskId === '') {
      return;
    }

    refetch().catch(() => {
      // error state is handled within refetch; suppress unhandled rejection
    });
  }, [autoLoad, enabled, refetch, taskId]);

  return {
    photos,
    loading,
    error,
    refetch,
    setPhotos,
  };
};
