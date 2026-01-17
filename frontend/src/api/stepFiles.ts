import { api } from './http';

export type StepFileSummary = {
  id: number;
  stepId: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  version: number;
  uploadedAt: string;
  uploadedById: number | null;
  uploadedBy?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
};

export async function listStepFiles(stepId: number): Promise<StepFileSummary[]> {
  const { data } = await api.get<StepFileSummary[]>(`/steps/${stepId}/files`);
  return data;
}

export async function uploadStepFile(
  stepId: number,
  file: File,
): Promise<StepFileSummary> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<StepFileSummary>(
    `/steps/${stepId}/files`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function downloadStepFile(
  stepId: number,
  fileId: number,
): Promise<Blob> {
  const response = await api.get(`/steps/${stepId}/files/${fileId}`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}

export async function deleteStepFile(
  stepId: number,
  fileId: number,
): Promise<void> {
  await api.delete(`/steps/${stepId}/files/${fileId}`);
}

export async function getFilePresignedUrl(
  stepId: number,
  fileId: number,
): Promise<{ url: string; fileName: string }> {
  const { data } = await api.get<{ url: string; fileName: string }>(
    `/steps/${stepId}/files/${fileId}/presigned`,
  );
  return data;
}
