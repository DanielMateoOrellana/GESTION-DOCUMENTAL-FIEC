import { useState } from 'react';
import { ProcessInstance, StepInstance, User } from '../types';
import {
  mockProcessInstances,
  mockStepInstances,
  mockFiles,
  getProcessTypeById,
  getUserById,
  getProgressForProcess,
  getStepsForProcess,
  getFilesForStep
} from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  Clock, 
  FileText,
  Calendar,
  User as UserIcon,
  Download,
  X,
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
import { toast } from 'sonner@2.0.3';

interface ProcessDetailSimpleProps {
  processId: number;
  currentUser: User;
  onBack: () => void;
}

// Mock process tags
const mockProcessTags = [
  { process_id: 1, tag_id: 1, name: 'Urgente', color: '#EF4444' },
  { process_id: 1, tag_id: 2, name: 'Prioritario', color: '#F59E0B' },
  { process_id: 2, tag_id: 3, name: 'Revisado', color: '#10B981' },
];

export function ProcessDetailSimple({ processId, currentUser, onBack }: ProcessDetailSimpleProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  const process = mockProcessInstances.find(p => p.id === processId);
  const processType = process ? getProcessTypeById(process.process_type_id) : null;
  const responsible = process ? getUserById(process.responsible_user_id) : null;
  const steps = process ? getStepsForProcess(process.id) : [];
  const progress = process ? getProgressForProcess(process.id) : null;
  const tags = mockProcessTags.filter(t => t.process_id === processId);

  if (!process || !processType) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Proceso no encontrado</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const handleUploadFile = (stepId: number) => {
    setSelectedStepId(stepId);
    setUploadModalOpen(true);
  };

  const handleRemoveFile = (fileId: number, fileName: string) => {
    toast.success(`Archivo ${fileName} eliminado`);
  };

  const handleMarkComplete = () => {
    toast.success('Proceso marcado como completado');
  };

  const getSimplifiedState = (state: string) => {
    if (state === 'APPROVED' || state === 'CLOSED') {
      return { label: 'Completado', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getStepState = (status: string) => {
    if (status === 'APPROVED' || status === 'CARGADO') {
      return { label: 'Completado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5 text-green-600" /> };
    }
    return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5 text-yellow-600" /> };
  };

  const state = getSimplifiedState(process.state);
  const allStepsComplete = steps.every(s => s.status === 'APPROVED' || s.status === 'CARGADO');

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onBack} className="cursor-pointer">
              Procesos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{process.title || processType.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1>{process.title || processType.name}</h1>
          <p className="text-muted-foreground">
            {processType.name} - {process.year}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Process Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Proceso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Estado</div>
              <Badge className={state.color}>{state.label}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Responsable</div>
              <div className="flex items-center gap-2 mt-1">
                <UserIcon className="w-4 h-4" />
                <span>{responsible?.full_name}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Fecha de creación</div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(process.created_at)}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Año/Mes</div>
              <div className="mt-1">
                {process.year} / {process.month}
              </div>
            </div>
          </div>

          {tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-2">Etiquetas</div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge 
                      key={tag.tag_id}
                      style={{ backgroundColor: tag.color, color: '#fff' }}
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {progress && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progreso</span>
                  <span className="text-sm">{progress.progress_percent}%</span>
                </div>
                <Progress value={progress.progress_percent} className="h-2" />
              </div>
            </>
          )}

          {allStepsComplete && process.state !== 'CLOSED' && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Todos los pasos han sido completados</span>
                </div>
                <Button onClick={handleMarkComplete}>
                  Marcar como Completado
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos del Proceso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => {
            const files = getFilesForStep(step.id);
            const latestFile = files.sort((a, b) => b.version - a.version)[0];
            const stepState = getStepState(step.status);

            return (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {stepState.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>Paso {step.ord}: {step.title}</span>
                        <Badge className={stepState.color}>{stepState.label}</Badge>
                      </div>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                {files.length > 0 && (
                  <div className="ml-8 space-y-2">
                    <div className="text-sm">Archivos cargados:</div>
                    {files.map(file => (
                      <div 
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{file.original_name}</div>
                            <div className="text-xs text-muted-foreground">
                              v{file.version} - {(file.size_bytes / 1024).toFixed(1)} KB - {formatDateTime(file.uploaded_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveFile(file.id, file.original_name)}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="ml-8 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUploadFile(step.id)}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {files.length > 0 ? 'Subir nueva versión' : 'Cargar archivo'}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {selectedStepId && (
        <UploadDocumentModal
          open={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedStepId(null);
          }}
          stepId={selectedStepId}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
