// frontend/src/api/auditLogs.ts
import { api } from "./http";

export interface AuditLogUser {
    id: number;
    fullName: string;
    email: string;
    role: string;
}

export interface AuditLog {
    id: number;
    action: string;
    entityType: string;
    entityId: number | null;
    description: string;
    details: string | null;
    userId: number | null;
    user: AuditLogUser | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface AuditLogResponse {
    data: AuditLog[];
    total: number;
    limit: number;
    offset: number;
}

export interface AuditLogFilter {
    action?: string;
    entityType?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export interface AuditLogStats {
    totalLogs: number;
    byAction: { action: string; count: number }[];
    byEntityType: { entityType: string; count: number }[];
    recentActivity: AuditLog[];
}

// Obtener registros de la bitácora con filtros
export async function fetchAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    if (filter.action) params.append("action", filter.action);
    if (filter.entityType) params.append("entityType", filter.entityType);
    if (filter.userId) params.append("userId", filter.userId.toString());
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);
    if (filter.limit) params.append("limit", filter.limit.toString());
    if (filter.offset) params.append("offset", filter.offset.toString());

    const response = await api.get<AuditLogResponse>(`/audit-logs?${params.toString()}`);
    return response.data;
}

// Obtener un registro específico
export async function fetchAuditLogById(id: number): Promise<AuditLog> {
    const response = await api.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
}

// Obtener estadísticas
export async function fetchAuditLogStats(): Promise<AuditLogStats> {
    const response = await api.get<AuditLogStats>("/audit-logs/stats");
    return response.data;
}

// Obtener tipos de acciones únicos
export async function fetchActionTypes(): Promise<string[]> {
    const response = await api.get<string[]>("/audit-logs/action-types");
    return response.data;
}

// Obtener tipos de entidades únicos
export async function fetchEntityTypes(): Promise<string[]> {
    const response = await api.get<string[]>("/audit-logs/entity-types");
    return response.data;
}

// Traducciones para acciones
export const actionLabels: Record<string, string> = {
    CREATE: "Crear",
    UPDATE: "Actualizar",
    DELETE: "Eliminar",
    LOGIN: "Iniciar sesión",
    LOGOUT: "Cerrar sesión",
    UPLOAD: "Subir archivo",
    DOWNLOAD: "Descargar archivo",
    ASSIGN: "Asignar",
    UNASSIGN: "Desasignar",
    COMPLETE: "Completar",
    ACTIVATE: "Activar",
    DEACTIVATE: "Desactivar",
};

// Traducciones para tipos de entidad
export const entityTypeLabels: Record<string, string> = {
    USER: "Usuario",
    PROCESS_CATEGORY: "Categoría de proceso",
    PROCESS_TYPE: "Tipo de proceso",
    PROCESS_TEMPLATE: "Plantilla",
    TEMPLATE_STEP: "Paso de plantilla",
    PROCESS_INSTANCE: "Proceso",
    STEP_INSTANCE: "Paso",
    TAG: "Etiqueta",
    FILE: "Archivo",
    SESSION: "Sesión",
};

// Colores para acciones
export const actionColors: Record<string, string> = {
    CREATE: "#10B981", // green
    UPDATE: "#3B82F6", // blue
    DELETE: "#EF4444", // red
    LOGIN: "#8B5CF6", // purple
    LOGOUT: "#6B7280", // gray
    UPLOAD: "#14B8A6", // teal
    DOWNLOAD: "#06B6D4", // cyan
    ASSIGN: "#F59E0B", // amber
    UNASSIGN: "#F97316", // orange
    COMPLETE: "#22C55E", // green
    ACTIVATE: "#10B981", // green
    DEACTIVATE: "#6B7280", // gray
};
