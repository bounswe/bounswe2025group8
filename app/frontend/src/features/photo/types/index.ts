export type TaskPhoto = {
  id: number;
  url: string;
  uploaded_at: string;
  task?: unknown;
};

export type AttachPhotoPayload = {
  task_id: number;
  photo_id: number;
  photo_url: string;
  uploaded_at: string;
};

export type AttachPhotoResult = {
  data: AttachPhotoPayload | null;
  status?: string;
  message?: string;
};

export type DeletePhotoResponse = {
  status?: string;
  message?: string;
};
