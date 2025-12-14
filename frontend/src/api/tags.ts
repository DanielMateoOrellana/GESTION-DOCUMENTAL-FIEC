// frontend/src/api/tags.ts
import { api } from "./http";

export interface Tag {
    id: number;
    name: string;
    color: string;
    createdById?: number;
    createdBy?: {
        id: number;
        fullName: string;
        email?: string;
    };
    createdAt: string;
    updatedAt: string;
    _count?: {
        processInstances: number;
    };
}

export interface ProcessInstanceTag {
    id: number;
    processInstanceId: number;
    tagId: number;
    tag: Tag;
    assignedAt: string;
}

export interface CreateTagInput {
    name: string;
    color: string;
}

export interface UpdateTagInput {
    name?: string;
    color?: string;
}

// Obtener todas las etiquetas
export async function fetchTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>("/tags");
    return response.data;
}

// Obtener una etiqueta por ID
export async function fetchTagById(id: number): Promise<Tag> {
    const response = await api.get<Tag>(`/tags/${id}`);
    return response.data;
}

// Crear una nueva etiqueta
export async function createTag(input: CreateTagInput): Promise<Tag> {
    const response = await api.post<Tag>("/tags", input);
    return response.data;
}

// Actualizar una etiqueta
export async function updateTag(id: number, input: UpdateTagInput): Promise<Tag> {
    const response = await api.patch<Tag>(`/tags/${id}`, input);
    return response.data;
}

// Eliminar una etiqueta
export async function deleteTag(id: number): Promise<void> {
    await api.delete(`/tags/${id}`);
}

// Asignar una etiqueta a un proceso
export async function assignTagToProcess(processId: number, tagId: number): Promise<ProcessInstanceTag> {
    const response = await api.post<ProcessInstanceTag>(`/tags/assign/${processId}/${tagId}`);
    return response.data;
}

// Remover una etiqueta de un proceso
export async function removeTagFromProcess(processId: number, tagId: number): Promise<void> {
    await api.delete(`/tags/assign/${processId}/${tagId}`);
}

// Obtener etiquetas de un proceso
export async function fetchTagsByProcess(processId: number): Promise<ProcessInstanceTag[]> {
    const response = await api.get<ProcessInstanceTag[]>(`/tags/process/${processId}`);
    return response.data;
}

// Establecer todas las etiquetas de un proceso (reemplaza las anteriores)
export async function setProcessTags(processId: number, tagIds: number[]): Promise<ProcessInstanceTag[]> {
    const response = await api.post<ProcessInstanceTag[]>(`/tags/process/${processId}/set`, { tagIds });
    return response.data;
}

// Crear etiqueta y asignarla a un proceso en un solo paso
export async function createAndAssignTag(processId: number, input: CreateTagInput): Promise<{ tag: Tag; assignment: ProcessInstanceTag }> {
    // Primero crear la etiqueta
    const tag = await createTag(input);
    // Luego asignarla al proceso
    const assignment = await assignTagToProcess(processId, tag.id);
    return { tag, assignment };
}
