import api from '../../../services/api';
import type {
  AttachPhotoPayload,
  AttachPhotoResult,
  DeletePhotoResponse,
  TaskPhoto,
} from '../types';

const isAttachPhotoPayload = (value: unknown): value is AttachPhotoPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.task_id === 'number' &&
    typeof candidate.photo_id === 'number' &&
    typeof candidate.photo_url === 'string' &&
    typeof candidate.uploaded_at === 'string'
  );
};

const isTaskPhoto = (value: unknown): value is TaskPhoto => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'number' &&
    typeof candidate.url === 'string' &&
    typeof candidate.uploaded_at === 'string'
  );
};

/**
 * Upload a single photo for a given task.
 */
export const attachPhotoToTask = async (
  taskId: number | string,
  photo: File
): Promise<AttachPhotoResult> => {
  if (!taskId) {
    throw new Error('Task ID is required to attach a photo.');
  }

  if (!(photo instanceof File)) {
    throw new Error('A valid File instance is required to attach a photo.');
  }

  const formData = new FormData();
  formData.append('photo', photo);

  const response = await api.post(
    `/tasks/${taskId}/photo/`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  const payload = response.data ?? {};
  const maybeData = (payload && typeof payload === 'object'
    ? (payload as Record<string, unknown>).data
    : null) ?? payload;

  const data = isAttachPhotoPayload(maybeData) ? maybeData : null;

  return {
    data,
    status:
      payload && typeof payload === 'object' && 'status' in payload
        ? (payload as Record<string, unknown>).status as string | undefined
        : undefined,
    message:
      payload && typeof payload === 'object' && 'message' in payload
        ? (payload as Record<string, unknown>).message as string | undefined
        : undefined,
  };
};

/**
 * Retrieve photos attached to a task, normalising different response shapes.
 */
export const getTaskPhotos = async (
  taskId: number | string
): Promise<TaskPhoto[]> => {
  if (!taskId) {
    throw new Error('Task ID is required to fetch photos.');
  }

  const response = await api.get(`/tasks/${taskId}/photo/`);
  const payload = response.data;

  const photosFromData = payload?.data?.photos ?? payload?.photos ?? payload;

  if (Array.isArray(photosFromData)) {
    return photosFromData.filter(isTaskPhoto) as TaskPhoto[];
  }

  return [];
};

/**
 * Delete a specific photo belonging to a task.
 */
export const deleteTaskPhoto = async (
  taskId: number | string,
  photoId: number | string
): Promise<DeletePhotoResponse> => {
  if (!taskId) {
    throw new Error('Task ID is required to delete a photo.');
  }

  if (photoId === undefined || photoId === null || photoId === '') {
    throw new Error('Photo ID is required to delete a photo.');
  }

  const response = await api.delete(`/tasks/${taskId}/photo/`, {
    params: { photo_id: photoId },
  });

  if (response.data && typeof response.data === 'object') {
    const payload = response.data as Record<string, unknown>;

    return {
      status: typeof payload.status === 'string' ? payload.status : undefined,
      message: typeof payload.message === 'string' ? payload.message : undefined,
    };
  }

  return {
    status: 'success',
    message: 'Photo deleted successfully.',
  };
};

export default {
  attachPhotoToTask,
  getTaskPhotos,
  deleteTaskPhoto,
};

