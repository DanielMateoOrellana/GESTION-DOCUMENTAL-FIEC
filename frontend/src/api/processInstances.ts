import { api } from './http';

// Enums igualitos a tu backend (están en español)
export type EstadoProceso = 'PENDIENTE' | 'COMPLETADO';
export type EstadoPaso = 'PENDIENTE' | 'COMPLETADO';

export type StepInstance = {
  id: number;
  title: string;
  estado: EstadoPaso;
  comment: string | null;
  processInstanceId: number;
  templateStepId: number;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProcessInstance = {
  id: number;
  title: string;
  estado: EstadoProceso;
  processTypeId: number;
  templateId: number;
  responsibleUserId: number | null;
  responsibleUser?: {
    id: number;
    fullName: string;
    email: string;
  };
  year: number | null;
  month: number | null;
  comment: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  processType?: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
  };
  template?: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    processTypeId: number;
    createdAt: string;
    updatedAt: string;
  };
  steps?: StepInstance[];
};

export type CreateProcessInstanceInput = {
  processTypeId: number;
  templateId: number;
  title: string;
  comment?: string;
  year?: number;
  month?: number;
  dueAt?: string;
};

export async function createProcessInstance(
  input: CreateProcessInstanceInput,
): Promise<ProcessInstance> {
  const { data } = await api.post<ProcessInstance>('/process-instances', input);
  return data;
}

export async function fetchProcessInstances(): Promise<ProcessInstance[]> {
  const { data } = await api.get<ProcessInstance[]>('/process-instances');
  return data;
}

/**
 * Descarga el expediente completo como archivo ZIP
 */
export async function downloadProcessZip(processId: number): Promise<Blob> {
  const response = await api.get(`/process-instances/${processId}/zip`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Resultado de la importación de proceso desde ZIP
 */
export type ImportProcessResult = {
  process: ProcessInstance;
  stats: {
    filesImported: number;
    filesSkipped: number;
    stepsCreated: number;
  };
};

/**
 * Importa un proceso desde un archivo ZIP
 */
export async function importProcessZip(
  file: File,
  processTypeId: number,
  templateId: number,
  title?: string,
  year?: number,
): Promise<ImportProcessResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('processTypeId', processTypeId.toString());
  formData.append('templateId', templateId.toString());
  if (title) formData.append('title', title);
  if (year) formData.append('year', year.toString());

  const { data } = await api.post<ImportProcessResult>(
    '/process-instances/import-zip',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return data;
}

/**
 * Exporta múltiples expedientes en un único archivo ZIP
 */
export async function exportBulkProcesses(ids: number[]): Promise<Blob> {
  const response = await api.post(
    '/process-instances/bulk-export-zip',
    { ids },
    {
      responseType: 'blob',
    },
  );
  return response.data;
}

/**
 * Elimina una instancia de proceso y todos sus archivos
 */
export async function deleteProcessInstance(id: number): Promise<void> {
  await api.delete(`/process-instances/${id}`);
}
