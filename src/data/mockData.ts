import {
  User,
  Role,
  ProcessType,
  ProcessTemplate,
  StepTemplate,
  ProcessInstance,
  StepInstance,
  File,
  Notification,
  ProcessProgress,
  AuditLog
} from '../types';

export const mockUsers: User[] = [
  {
    id: 1,
    full_name: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@fiec.edu.ec',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    full_name: 'Dra. María González',
    email: 'maria.gonzalez@fiec.edu.ec',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 3,
    full_name: 'Ing. Juan Pérez',
    email: 'juan.perez@fiec.edu.ec',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  }
];

export const mockRoles: Role[] = [
  { id: 1, code: 'ADMIN', name: 'Administrador', description: 'Acceso total al sistema', created_at: '2024-01-15T08:00:00Z' },
  { id: 2, code: 'DEAN', name: 'Decano', description: 'Decano de la FIEC', created_at: '2024-01-15T08:00:00Z' },
  { id: 3, code: 'SUBDEAN', name: 'Subdecano', description: 'Subdecano de la FIEC', created_at: '2024-01-15T08:00:00Z' },
  { id: 4, code: 'DIRECTOR', name: 'Director de Carrera', description: 'Director de carrera', created_at: '2024-01-15T08:00:00Z' },
  { id: 5, code: 'SECRETARY', name: 'Secretaría', description: 'Personal de secretaría', created_at: '2024-01-15T08:00:00Z' },
  { id: 6, code: 'PROFESSOR', name: 'Docente', description: 'Docente de la FIEC', created_at: '2024-01-15T08:00:00Z' }
];

export const mockProcessTypes: ProcessType[] = [
  {
    id: 1,
    code: 'EVAL_DOCENTE',
    name: 'Evaluación Docente',
    description: 'Proceso de evaluación semestral de desempeño docente',
    active: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    code: 'ACRED_CARRERA',
    name: 'Acreditación de Carrera',
    description: 'Proceso de acreditación de carreras ante organismos externos',
    active: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 3,
    code: 'INFORME_GESTION',
    name: 'Informe de Gestión',
    description: 'Informe mensual de gestión institucional',
    active: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 4,
    code: 'PLAN_ACADEMICO',
    name: 'Plan Académico',
    description: 'Planificación académica semestral',
    active: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  }
];

export const mockProcessTemplates: ProcessTemplate[] = [
  {
    id: 1,
    process_type_id: 1,
    description: 'Plantilla estándar para evaluación docente',
    version: 1,
    is_published: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 2,
    process_type_id: 2,
    description: 'Plantilla para acreditación',
    version: 1,
    is_published: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 3,
    process_type_id: 3,
    description: 'Plantilla para informes de gestión',
    version: 1,
    is_published: true,
    created_by: 1,
    created_at: '2024-01-15T08:00:00Z'
  }
];

export const mockStepTemplates: StepTemplate[] = [
  { id: 1, template_id: 1, ord: 1, title: 'Carga de Evidencias', description: 'Cargar evidencias de desempeño docente', required: true, reviewer_role_id: 5, created_at: '2024-01-15T08:00:00Z' },
  { id: 2, template_id: 1, ord: 2, title: 'Revisión por Director', description: 'Revisión y validación por director de carrera', required: true, reviewer_role_id: 4, created_at: '2024-01-15T08:00:00Z' },
  { id: 3, template_id: 1, ord: 3, title: 'Aprobación Subdecano', description: 'Aprobación final por subdecano', required: true, reviewer_role_id: 3, created_at: '2024-01-15T08:00:00Z' },
  { id: 4, template_id: 2, ord: 1, title: 'Recopilación de Documentos', description: 'Reunir documentación para acreditación', required: true, reviewer_role_id: 5, created_at: '2024-01-15T08:00:00Z' },
  { id: 5, template_id: 2, ord: 2, title: 'Validación Técnica', description: 'Validación técnica de documentos', required: true, reviewer_role_id: 4, created_at: '2024-01-15T08:00:00Z' },
  { id: 6, template_id: 3, ord: 1, title: 'Elaboración de Informe', description: 'Redacción del informe mensual', required: true, reviewer_role_id: 5, created_at: '2024-01-15T08:00:00Z' },
  { id: 7, template_id: 3, ord: 2, title: 'Revisión Decano', description: 'Revisión y aprobación por decano', required: true, reviewer_role_id: 2, created_at: '2024-01-15T08:00:00Z' }
];

export const mockProcessInstances: ProcessInstance[] = [
  {
    id: 1,
    process_type_id: 1,
    template_id: 1,
    year: 2025,
    month: 10,
    state: 'IN_PROGRESS',
    responsible_user_id: 1,
    title: 'Evaluación Docente Semestre 2025-2',
    archived: false,
    created_by: 1,
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-10-20T10:30:00Z',
    due_at: '2025-10-31T23:59:59Z'
  },
  {
    id: 2,
    process_type_id: 3,
    template_id: 3,
    year: 2025,
    month: 9,
    state: 'PENDING_APPROVAL',
    responsible_user_id: 2,
    title: 'Informe de Gestión - Septiembre 2025',
    archived: false,
    created_by: 2,
    created_at: '2025-09-25T08:00:00Z',
    updated_at: '2025-10-15T14:20:00Z',
    due_at: '2025-10-05T23:59:59Z'
  },
  {
    id: 3,
    process_type_id: 2,
    template_id: 2,
    year: 2025,
    month: 8,
    state: 'APPROVED',
    responsible_user_id: 1,
    title: 'Acreditación Carrera de Computación',
    archived: false,
    created_by: 1,
    created_at: '2025-08-01T08:00:00Z',
    updated_at: '2025-09-30T16:45:00Z',
    closed_at: '2025-09-30T16:45:00Z'
  },
  {
    id: 4,
    process_type_id: 4,
    template_id: 1,
    year: 2025,
    month: 10,
    state: 'DRAFT',
    responsible_user_id: 3,
    title: 'Plan Académico 2026-1',
    archived: false,
    created_by: 3,
    created_at: '2025-10-20T09:00:00Z',
    updated_at: '2025-10-20T09:00:00Z'
  },
  {
    id: 5,
    process_type_id: 1,
    template_id: 1,
    year: 2025,
    month: 6,
    state: 'CLOSED',
    responsible_user_id: 1,
    title: 'Evaluación Docente Semestre 2025-1',
    archived: true,
    created_by: 1,
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-07-15T12:00:00Z',
    closed_at: '2025-07-15T12:00:00Z'
  }
];

export const mockStepInstances: StepInstance[] = [
  {
    id: 1,
    process_instance_id: 1,
    step_template_id: 1,
    title: 'Carga de Evidencias',
    status: 'APPROVED',
    reviewer_role_id: 5,
    reviewed_by: 2,
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-10-10T11:00:00Z',
    due_at: '2025-10-15T23:59:59Z'
  },
  {
    id: 2,
    process_instance_id: 1,
    step_template_id: 2,
    title: 'Revisión por Director',
    status: 'IN_PROGRESS',
    reviewer_role_id: 4,
    created_at: '2025-10-10T11:00:00Z',
    updated_at: '2025-10-15T09:30:00Z',
    due_at: '2025-10-25T23:59:59Z'
  },
  {
    id: 3,
    process_instance_id: 1,
    step_template_id: 3,
    title: 'Aprobación Subdecano',
    status: 'PENDING',
    reviewer_role_id: 3,
    created_at: '2025-10-01T08:00:00Z',
    updated_at: '2025-10-01T08:00:00Z',
    due_at: '2025-10-30T23:59:59Z'
  },
  {
    id: 4,
    process_instance_id: 2,
    step_template_id: 6,
    title: 'Elaboración de Informe',
    status: 'SUBMITTED',
    reviewer_role_id: 5,
    reviewed_by: 3,
    created_at: '2025-09-25T08:00:00Z',
    updated_at: '2025-10-02T15:00:00Z',
    due_at: '2025-10-03T23:59:59Z'
  },
  {
    id: 5,
    process_instance_id: 2,
    step_template_id: 7,
    title: 'Revisión Decano',
    status: 'IN_PROGRESS',
    reviewer_role_id: 2,
    created_at: '2025-10-02T15:00:00Z',
    updated_at: '2025-10-15T14:20:00Z',
    due_at: '2025-10-05T23:59:59Z'
  }
];

export const mockFiles: File[] = [
  {
    id: 1,
    step_instance_id: 1,
    filename: 'evidencias_docentes_2025_2.pdf',
    version: 1,
    name_type: 'application/pdf',
    size_bytes: 2456789,
    storage_backend: 'LOCAL',
    sha256: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    uploaded_by: 1,
    uploaded_at: '2025-10-08T14:30:00Z'
  },
  {
    id: 2,
    step_instance_id: 1,
    filename: 'evidencias_docentes_2025_2.pdf',
    version: 2,
    name_type: 'application/pdf',
    size_bytes: 2678901,
    storage_backend: 'LOCAL',
    sha256: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1',
    uploaded_by: 1,
    uploaded_at: '2025-10-10T10:45:00Z'
  },
  {
    id: 3,
    step_instance_id: 4,
    filename: 'informe_gestion_septiembre_2025.pdf',
    version: 1,
    name_type: 'application/pdf',
    size_bytes: 1234567,
    storage_backend: 'LOCAL',
    sha256: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a1b2',
    uploaded_by: 3,
    uploaded_at: '2025-10-02T13:15:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    type: 'APPROVAL_PENDING',
    title: 'Paso pendiente de revisión',
    body: 'El paso "Revisión por Director" requiere su atención en el proceso "Evaluación Docente Semestre 2025-2"',
    is_read: false,
    process_instance_id: 1,
    step_instance_id: 2,
    created_at: '2025-10-15T09:30:00Z',
    due_at: '2025-10-25T23:59:59Z'
  },
  {
    id: 2,
    user_id: 1,
    type: 'REMINDER',
    title: 'Recordatorio: Fecha límite próxima',
    body: 'El proceso "Evaluación Docente Semestre 2025-2" vence el 31 de octubre',
    is_read: false,
    process_instance_id: 1,
    created_at: '2025-10-24T08:00:00Z',
    due_at: '2025-10-31T23:59:59Z'
  },
  {
    id: 3,
    user_id: 2,
    type: 'SYSTEM',
    title: 'Proceso aprobado',
    body: 'El proceso "Acreditación Carrera de Computación" ha sido aprobado exitosamente',
    is_read: true,
    process_instance_id: 3,
    created_at: '2025-09-30T16:45:00Z'
  },
  {
    id: 4,
    user_id: 1,
    type: 'RETURNED',
    title: 'Documento devuelto para correcciones',
    body: 'El paso "Elaboración de Informe" requiere correcciones menores',
    is_read: true,
    process_instance_id: 2,
    step_instance_id: 4,
    created_at: '2025-10-03T10:15:00Z'
  }
];

export const mockProcessProgress: ProcessProgress[] = [
  {
    process_instance_id: 1,
    total_steps: 3,
    completed_steps: 1,
    progress_percent: 33
  },
  {
    process_instance_id: 2,
    total_steps: 2,
    completed_steps: 1,
    progress_percent: 50
  },
  {
    process_instance_id: 3,
    total_steps: 2,
    completed_steps: 2,
    progress_percent: 100
  },
  {
    process_instance_id: 4,
    total_steps: 3,
    completed_steps: 0,
    progress_percent: 0
  }
];

export const mockAuditLog: AuditLog[] = [
  {
    id: 1,
    user_id: 1,
    action: 'UPLOAD_FILE',
    entity_type: 'file',
    entity_id: 1,
    details: 'Uploaded evidencias_docentes_2025_2.pdf v1',
    created_at: '2025-10-08T14:30:00Z'
  },
  {
    id: 2,
    user_id: 1,
    action: 'UPLOAD_FILE',
    entity_type: 'file',
    entity_id: 2,
    details: 'Uploaded evidencias_docentes_2025_2.pdf v2',
    created_at: '2025-10-10T10:45:00Z'
  },
  {
    id: 3,
    user_id: 2,
    action: 'APPROVE_STEP',
    entity_type: 'step_instance',
    entity_id: 1,
    details: 'Approved step: Carga de Evidencias',
    created_at: '2025-10-10T11:00:00Z'
  }
];

// Helper functions
export function getUserById(id: number): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function getRoleById(id: number): Role | undefined {
  return mockRoles.find(r => r.id === id);
}

export function getProcessTypeById(id: number): ProcessType | undefined {
  return mockProcessTypes.find(pt => pt.id === id);
}

export function getProgressForProcess(processId: number): ProcessProgress | undefined {
  return mockProcessProgress.find(p => p.process_instance_id === processId);
}

export function getStepsForProcess(processId: number): StepInstance[] {
  return mockStepInstances.filter(s => s.process_instance_id === processId);
}

export function getFilesForStep(stepId: number): File[] {
  return mockFiles.filter(f => f.step_instance_id === stepId);
}

export function getNotificationsForUser(userId: number): Notification[] {
  return mockNotifications.filter(n => n.user_id === userId);
}
