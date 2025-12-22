import { api } from './http';

export type ProcessCategory = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  _count?: {
    processTypes: number;
  };
};

export interface CreateCategoryInput {
  name: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export async function fetchProcessCategories(): Promise<ProcessCategory[]> {
  const { data } = await api.get<ProcessCategory[]>('/process-categories');
  return data;
}

export async function createProcessCategory(input: CreateCategoryInput): Promise<ProcessCategory> {
  const { data } = await api.post<ProcessCategory>('/process-categories', input);
  return data;
}

export async function updateProcessCategory(id: number, input: UpdateCategoryInput): Promise<ProcessCategory> {
  const { data } = await api.patch<ProcessCategory>(`/process-categories/${id}`, input);
  return data;
}

export async function deleteProcessCategory(id: number): Promise<void> {
  await api.delete(`/process-categories/${id}`);
}

