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
  // 🚫 fuera: responsibleUserId
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
