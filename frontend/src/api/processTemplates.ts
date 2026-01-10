import { api } from './http';
import type { ProcessType } from './processTypes';

export type ProcessTemplateStep = {
  id: number;
  templateId: number;
  order: number;
  name: string;
  description?: string;
  responsibleRole?: string;
  dueDaysFromStart?: number;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProcessTemplate = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isLocked: boolean;
  processTypeId: number;
  createdAt: string;
  updatedAt: string;

  // relaciones
  processType?: ProcessType;
  steps?: ProcessTemplateStep[];
};

export type CreateTemplateStepInput = {
  order: number;
  name: string;
  description?: string;
  responsibleRole?: string;
  dueDaysFromStart?: number;
  isMandatory?: boolean;
};

export type CreateProcessTemplateInput = {
  name: string;
  description: string;
  processTypeId: number;
  isActive?: boolean;
  isLocked?: boolean;
  steps?: CreateTemplateStepInput[];
};

export type UpdateProcessTemplateInput = Partial<CreateProcessTemplateInput>;

export async function fetchProcessTemplates(): Promise<ProcessTemplate[]> {
  const { data } = await api.get<ProcessTemplate[]>('/process-templates');
  console.log('[fetchProcessTemplates] data from API:', data);
  return data;
}

export async function fetchProcessTemplate(id: number): Promise<ProcessTemplate> {
  const { data } = await api.get<ProcessTemplate>(`/process-templates/${id}`);
  return data;
}

export async function createProcessTemplate(
  input: CreateProcessTemplateInput,
): Promise<ProcessTemplate> {
  const { data } = await api.post<ProcessTemplate>('/process-templates', input);
  return data;
}

export async function updateProcessTemplate(
  id: number,
  input: UpdateProcessTemplateInput,
): Promise<ProcessTemplate> {
  const { data } = await api.patch<ProcessTemplate>(`/process-templates/${id}`, input);
  return data;
}

export async function deleteProcessTemplate(id: number): Promise<void> {
  await api.delete(`/process-templates/${id}`);
}
