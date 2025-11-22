import { api } from './http';

export type ProcessCategory = {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
};

export async function fetchProcessCategories(): Promise<ProcessCategory[]> {
  const { data } = await api.get<ProcessCategory[]>('/process-categories');
  return data;
}
