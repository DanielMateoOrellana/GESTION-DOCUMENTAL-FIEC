// frontend/src/api/stepFiles.ts
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
};

// Lista de archivos de un paso
export async function listStepFiles(stepId: number): Promise<StepFileSummary[]> {
  const { data } = await api.get<StepFileSummary[]>(`/steps/${stepId}/files`);
  return data;
}

// Subir archivo a un paso
export async function uploadStepFile(
  stepId: number,
  file: File,
): Promise<StepFileSummary> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<StepFileSummary>(
    `/steps/${stepId}/files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return data;
}

// Descargar archivo (devuelve un Blob)
export async function downloadStepFile(
  stepId: number,
  fileId: number,
): Promise<Blob> {
  const response = await api.get(`/steps/${stepId}/files/${fileId}`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}
