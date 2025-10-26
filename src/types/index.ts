// Types based on FIEC database schema

export interface User {
  id: number;
  full_name: string;
  email: string;
  password_hash?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  created_at: string;
}

export interface ProcessType {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
  created_by: number;
  created_at: string;
}

export interface ProcessTemplate {
  id: number;
  process_type_id: number;
  description: string;
  version: number;
  is_published: boolean;
  created_by: number;
  created_at: string;
}

export interface StepTemplate {
  id: number;
  template_id: number;
  ord: number;
  title: string;
  description: string;
  required: boolean;
  reviewer_role_id: number;
  created_at: string;
}

export type ProcessState = 'DRAFT' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
export type NotificationType = 'INFO' | 'REMINDER' | 'APPROVAL_PENDING' | 'RETURNED' | 'SYSTEM';

export interface ProcessInstance {
  id: number;
  process_type_id: number;
  template_id: number;
  parent_instance_id?: number;
  year: number;
  month: number;
  state: ProcessState;
  responsible_user_id: number;
  title?: string;
  comment?: string;
  revised_at?: string;
  reviewed_by?: number;
  reversed_at?: string;
  due_at?: string;
  security_level?: string;
  archived: boolean;
  closing_type?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface StepInstance {
  id: number;
  process_instance_id: number;
  step_template_id: number;
  title: string;
  status: StepStatus;
  comment?: string;
  reviewer_role_id: number;
  reviewed_by?: number;
  due_at?: string;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: number;
  step_instance_id: number;
  filename: string;
  version: number;
  name_type: string;
  size_bytes: number;
  storage_backend: string;
  sha256: string;
  uploaded_by: number;
  uploaded_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  payload?: string;
  due_at?: string;
  process_instance_id?: number;
  step_instance_id?: number;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details?: string;
  created_at: string;
}

export interface ProcessProgress {
  process_instance_id: number;
  total_steps: number;
  completed_steps: number;
  progress_percent: number;
}

export interface SavedView {
  id: number;
  owner_user_id: number;
  name: string;
  filters: string;
  is_shared: boolean;
  created_at: string;
}

export interface ExportLog {
  id: number;
  user_id: number;
  file_url: string;
  size_bytes: number;
  created_at: string;
}
