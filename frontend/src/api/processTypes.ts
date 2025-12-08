import { api } from './http';
import type { ProcessCategory } from './processCategories';

export type ProcessType = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  categoryId: number;
  category: ProcessCategory;
};

export type CreateProcessTypeInput = {
  name: string;
  description: string;
  categoryId: number;
  isActive: boolean;
};

export async function fetchProcessTypes(): Promise<ProcessType[]> {
  const { data } = await api.get<ProcessType[]>('/process-types');
  console.log('[fetchProcessTypes] data from API:', data);
  return data;
}

export async function createProcessType(
  input: CreateProcessTypeInput,
): Promise<ProcessType> {
  const { data } = await api.post<ProcessType>('/process-types', input);
  return data;
}

export type UpdateProcessTypeInput = Partial<CreateProcessTypeInput>;

export async function updateProcessType(
  id: number,
  input: UpdateProcessTypeInput,
): Promise<ProcessType> {
  const { data } = await api.patch<ProcessType>(`/process-types/${id}`, input);
  return data;
}
