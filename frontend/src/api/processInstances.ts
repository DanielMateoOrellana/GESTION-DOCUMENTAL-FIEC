import { api } from './http';

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
  assignedToId?: number | null;
  assignedTo?: {
    id: number;
    fullName: string;
    email: string;
  } | null;
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
  responsibleUserId?: number;
};

export async function createProcessInstance(
  input: CreateProcessInstanceInput,
): Promise<ProcessInstance> {
  const { data } = await api.post<ProcessInstance>('/process-instances', input);
  return data;
}

export async function fetchProcessInstances(search?: string): Promise<ProcessInstance[]> {
  const params = search ? { search } : {};
  const { data } = await api.get<ProcessInstance[]>('/process-instances', { params });
  return data;
}

export async function downloadProcessZip(processId: number): Promise<Blob> {
  const response = await api.get(`/process-instances/${processId}/zip`, {
    responseType: 'blob',
  });
  return response.data;
}

export type ImportProcessResult = {
  process: ProcessInstance;
  stats: {
    filesImported: number;
    filesSkipped: number;
    stepsCreated: number;
  };
};

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
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

export async function exportBulkProcesses(ids: number[]): Promise<Blob> {
  const response = await api.post(
    '/process-instances/bulk-export-zip',
    { ids },
    { responseType: 'blob' },
  );
  return response.data;
}

export async function deleteProcessInstance(id: number): Promise<void> {
  await api.delete(`/process-instances/${id}`);
}

export async function addStepToProcess(
  processId: number,
  stepName: string,
): Promise<{ templateStep: any; stepInstance: any; message: string }> {
  const { data } = await api.post(`/process-instances/${processId}/add-step`, {
    name: stepName,
  });
  return data;
}

// Delegar un paso a un usuario
export async function assignStep(
  stepId: number,
  assignedToId: number,
): Promise<StepInstance> {
  const { data } = await api.patch<StepInstance>(
    `/process-instances/steps/${stepId}/assign`,
    { assignedToId },
  );
  return data;
}

// Remover delegación de un paso
export async function unassignStep(stepId: number): Promise<StepInstance> {
  const { data } = await api.patch<StepInstance>(
    `/process-instances/steps/${stepId}/unassign`,
  );
  return data;
}

// Actualizar responsable del proceso
export async function updateProcessResponsible(
  processId: number,
  responsibleUserId: number | null,
): Promise<ProcessInstance> {
  const { data } = await api.patch<ProcessInstance>(
    `/process-instances/${processId}/responsible`,
    { responsibleUserId },
  );
  return data;
}

