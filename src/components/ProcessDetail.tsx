import { useState } from 'react';
import { ProcessInstance, StepInstance, User } from '../types';
import {
  mockProcessInstances,
  mockStepInstances,
  mockFiles,
  getProcessTypeById,
  getUserById,
  getRoleById,
  getProgressForProcess,
  getStepsForProcess,
  getFilesForStep
} from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  FileText,
  Calendar,
  User as UserIcon,
  Download,
  Home,
  ChevronRight,
  TagIcon
} from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

interface ProcessDetailProps {
  processId: number;
  currentUser: User;
  onBack: () => void;
}

// Mock process tags
const mockProcessTags = [
  { process_id: 1, tag_id: 1, name: 'Urgente', color: '#EF4444' },
  { process_id: 1, tag_id: 2, name: 'Prioritario', color: '#F59E0B' },
  { process_id: 2, tag_id: 3, name: 'Revisado', color: '#10B981' },
  { process_id: 3, tag_id: 5, name: 'Completado', color: '#3B82F6' }
];

// Mock audit logs for process
const mockProcessAuditLog = [
  {
    id: 1,
    user_id: 1,
    action: 'CREATE_PROCESS',
    details: 'Proceso creado',
    created_at: '2025-10-01T08:00:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 2,
    user_id: 1,
    action: 'UPLOAD_FILE',
    details: 'Cargó evidencias_docentes_2025_2.pdf v1',
    created_at: '2025-10-08T14:30:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 3,
    user_id: 1,
    action: 'UPLOAD_FILE',
    details: 'Cargó evidencias_docentes_2025_2.pdf v2',
    created_at: '2025-10-10T10:45:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 4,
    user_id: 2,
    action: 'APPROVE_STEP',
    details: 'Aprobó paso: Carga de Evidencias',
    created_at: '2025-10-10T11:00:00Z',
    ip_address: '192.168.1.15'
  },
  {
    id: 5,
    user_id: 2,
    action: 'OBSERVE_STEP',
    details: 'Observó paso: Revisión por Director - Falta documentación',
    created_at: '2025-10-15T09:30:00Z',
    ip_address: '192.168.1.15'
  }
];

export function ProcessDetail({ processId, currentUser, onBack }: ProcessDetailProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const process = mockProcessInstances.find(p => p.id === processId);
  const steps = getStepsForProcess(processId);
  const progress = getProgressForProcess(processId);
  const processTags = mockProcessTags.filter(pt => pt.process_id === processId);

  if (!process) {
    return (
      <div className="p-6">
        <p>Proceso no encontrado</p>
        <Button onClick={onBack} className="mt-4">Volver</Button>
      </div>
    );
  }

  const processType = getProcessTypeById(process.process_type_id);
  const responsible = getUserById(process.responsible_user_id);

  const statusLabels: Record<string, string> = {
    'DRAFT': 'Borrador',
    'IN_PROGRESS': 'En Progreso',
    'PENDING_APPROVAL': 'Pendiente Aprobación',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado',
    'CLOSED': 'Cerrado',
    'ARCHIVED': 'Archivado'
  };

  const stepStatusLabels: Record<string, string> = {
    'PENDING': 'Pendiente',
    'IN_PROGRESS': 'En Progreso',
    'SUBMITTED': 'Enviado',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado',
    'SKIPPED': 'Omitido',
    'CARGADO': 'Cargado',
    'OBSERVADO': 'Observado'
  };

  const getProcessStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CLOSED': 'bg-gray-100 text-gray-800',
      'ARCHIVED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStepStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'SUBMITTED': 'bg-purple-100 text-purple-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'SKIPPED': 'bg-gray-100 text-gray-800',
      'CARGADO': 'bg-blue-100 text-blue-800',
      'OBSERVADO': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'IN_PROGRESS':
      case 'SUBMITTED':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleUploadFile = (stepId: number) => {
    setSelectedStep(stepId);
    setShowUploadModal(true);
  };

  const handleCloseProcess = () => {
    alert('Proceso cerrado exitosamente');
  };

  const allRequiredStepsApproved = steps
    .filter(s => s.status !== 'SKIPPED')
    .every(s => s.status === 'APPROVED');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onBack}>
              <Home className="w-4 h-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onBack}>
              Procesos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" onClick={onBack}>
              {processType?.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{process.title || `Proceso #${process.id}`}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Process Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <CardTitle>{process.title || processType?.name}</CardTitle>
              <CardDescription>{processType?.description}</CardDescription>
              
              {/* Tags */}
              {processTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                  {processTags.map(tag => (
                    <Badge
                      key={tag.tag_id}
                      style={{ backgroundColor: tag.color, color: '#fff' }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Año {process.year} - Mes {String(process.month).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span>{responsible?.full_name}</span>
                </div>
                {process.due_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Vence: {formatDate(process.due_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <Badge className={getProcessStatusColor(process.state)}>
              {statusLabels[process.state] || process.state}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {progress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Progreso del Proceso</span>
                <span className="text-sm">{progress.progress_percent}%</span>
              </div>
              <Progress value={progress.progress_percent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {progress.completed_steps} de {progress.total_steps} pasos completados
              </p>
            </div>
          )}
          
          {process.comment && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm mb-2">Comentarios del Proceso</h4>
                <p className="text-sm text-muted-foreground">{process.comment}</p>
              </div>
            </>
          )}

          {allRequiredStepsApproved && process.state !== 'CLOSED' && (
            <>
              <Separator />
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Todos los pasos requeridos están aprobados</span>
                </div>
                <Button onClick={handleCloseProcess} variant="default">
                  Cerrar Proceso
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Steps List */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos del Proceso</CardTitle>
          <CardDescription>Seguimiento y gestión de cada etapa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => {
            const reviewerRole = getRoleById(step.reviewer_role_id);
            const reviewer = step.reviewed_by ? getUserById(step.reviewed_by) : null;
            const files = getFilesForStep(step.id);
            const latestFile = files.sort((a, b) => b.version - a.version)[0];

            return (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStepIcon(step.status)}
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span>Paso {index + 1}: {step.title}</span>
                        <Badge className={getStepStatusColor(step.status)}>
                          {stepStatusLabels[step.status] || step.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Revisor: {reviewerRole?.name}</p>
                        {reviewer && <p>Revisado por: {reviewer.full_name}</p>}
                        {step.due_at && (
                          <p>Fecha límite: {formatDate(step.due_at)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {step.comment && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm">Comentario</p>
                        <p className="text-sm text-muted-foreground">{step.comment}</p>
                      </div>
                    </div>
                  </div>
                )}

                {latestFile && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm">{latestFile.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            Versión {latestFile.version} - {(latestFile.size_bytes / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadFile(step.id)}
                    disabled={step.status === 'APPROVED'}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Cargar Archivo
                  </Button>
                  {step.status === 'SUBMITTED' && (
                    <>
                      <Button variant="default" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Observar
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Comentar
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Audit Log / Bitácora */}
      <Card>
        <CardHeader>
          <CardTitle>Bitácora del Proceso</CardTitle>
          <CardDescription>Historial de acciones y eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProcessAuditLog.map(log => {
              const user = getUserById(log.user_id);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{user?.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.details}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatDateTime(log.created_at)}</span>
                      <span>•</span>
                      <span>IP: {log.ip_address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showUploadModal && selectedStep && (
        <UploadDocumentModal
          stepId={selectedStep}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedStep(null);
          }}
        />
      )}
    </div>
  );
}
