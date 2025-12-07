// frontend/src/components/ProcessDetailSimple.tsx
import { useEffect, useState, useCallback } from "react";
import type { User } from "../types";

import {
  fetchProcessInstances,
  type ProcessInstance as ApiProcessInstance,
} from "../api/processInstances";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
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
  TagIcon,
} from "lucide-react";
import { UploadDocumentModal } from "./UploadDocumentModal";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { toast } from "sonner";
import {
  listStepFiles,
  downloadStepFile,
  deleteStepFile,
  type StepFileSummary,
} from "../api/stepFiles";

interface ProcessDetailSimpleProps {
  processId: number;
  currentUser: User;
  onBack: () => void;
}

// Paso tal como viene del backend, más archivos
type ApiStep = {
  id: number;
  title: string;
  estado: "PENDIENTE" | "COMPLETADO" | string;
  comment: string | null;
  processInstanceId: number;
  templateStepId: number;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  files?: StepFileSummary[];
};

// Etiquetas mock mientras no haya backend de tags
const mockProcessTags = [
  { process_id: 1, tag_id: 1, name: "Urgente", color: "#EF4444" },
  { process_id: 1, tag_id: 2, name: "Prioritario", color: "#F59E0B" },
  { process_id: 2, tag_id: 3, name: "Revisado", color: "#10B981" },
];

export function ProcessDetailSimple({
  processId,
  currentUser,
  onBack,
}: ProcessDetailSimpleProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);

  const [process, setProcess] = useState<ApiProcessInstance | null>(null);
  const [steps, setSteps] = useState<ApiStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const instances = await fetchProcessInstances();
      const found = instances.find((p) => p.id === processId) ?? null;
      setProcess(found || null);

      if (found && Array.isArray(found.steps)) {
        const stepsFromApi = found.steps as ApiStep[];

        // Para cada paso, traemos sus archivos desde /steps/:id/files
        const stepsWithFiles = await Promise.all(
          stepsFromApi.map(async (step) => {
            try {
              const files = await listStepFiles(step.id);
              return { ...step, files };
            } catch (e) {
              console.error(
                `[ProcessDetailSimple] Error cargando archivos del paso ${step.id}`,
                e
              );
              return { ...step, files: [] as StepFileSummary[] };
            }
          })
        );

        setSteps(stepsWithFiles);
      } else {
        setSteps([]);
      }
    } catch (e) {
      console.error("[ProcessDetailSimple] Error cargando proceso", e);
      setError("No se pudo cargar el proceso");
    } finally {
      setLoading(false);
    }
  }, [processId]);

  useEffect(() => {
    load();
  }, [load]);

  const getSimplifiedState = (estado?: string | null) => {
    if (estado === "COMPLETADO") {
      return { label: "Completado", color: "bg-green-100 text-green-800" };
    }
    return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
  };

  const getStepState = (estado: string) => {
    if (estado === "COMPLETADO") {
      return {
        label: "Completado",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      };
    }
    return {
      label: "Pendiente",
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
    };
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleUploadFile = (stepId: number) => {
    setSelectedStepId(stepId);
    setUploadModalOpen(true);
  };

  const handleRemoveFile = async (fileId: number, fileName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el archivo "${fileName}"?`)) return;

    // Si no tenemos stepId, no podemos llamar a la API correctamente (la API pide /steps/:stepId/files/:fileId)
    // Buscamos el step al que pertenece este archivo
    // En tu estado "steps", cada step tiene "files". Busquemos ahí.
    const stepFound = steps.find(s => s.files?.some(f => f.id === fileId));
    if (!stepFound) {
      toast.error("No se encontró el paso del archivo");
      return;
    }

    try {
      await deleteStepFile(stepFound.id, fileId);
      toast.success(`Archivo ${fileName} eliminado`);
      load(); // Recargar datos para actualizar estado del paso/proceso
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar el archivo");
    }
  };

  const handleDownloadFile = async (stepId: number, file: StepFileSummary) => {
    try {
      const blob = await downloadStepFile(stepId, file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("[ProcessDetailSimple] Error descargando archivo", e);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const handleMarkComplete = () => {
    // Aquí luego harás PATCH al backend
    toast.success("Proceso marcado como completado (mock)");
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Cargando proceso...</p>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error || "Proceso no encontrado"}
          </p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Responsable basado en backend + usuario actual, sin mocks
  const isCurrentUserResponsible =
    process.responsibleUserId != null &&
    process.responsibleUserId === currentUser.id;

  const responsibleName =
    isCurrentUserResponsible
      ? currentUser.full_name
      : process.responsibleUserId != null
        ? `Usuario #${process.responsibleUserId}`
        : "—";

  const createdAtRaw = process.createdAt;
  const state = getSimplifiedState(process.estado);
  const tags = mockProcessTags.filter((t) => t.process_id === processId);

  const completedSteps = steps.filter((s) => s.estado === "COMPLETADO").length;
  const progressPercent =
    steps.length > 0 ? Math.round((completedSteps * 100) / steps.length) : 0;
  const allStepsComplete = steps.length > 0 && completedSteps === steps.length;

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
            <BreadcrumbPage>
              {process.title ||
                process.processType?.name ||
                `Proceso #${process.id}`}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1>
            {process.title ||
              process.processType?.name ||
              `Proceso #${process.id}`}
          </h1>
          <p className="text-muted-foreground">
            {process.processType?.name || "Tipo desconocido"} - {process.year}
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
                <span>{responsibleName}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Fecha de creación
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(createdAtRaw)}</span>
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
                <div className="text-sm text-muted-foreground mb-2">
                  Etiquetas
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.tag_id}
                      style={{ backgroundColor: tag.color, color: "#fff" }}
                    >
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {steps.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Progreso
                  </span>
                  <span className="text-sm">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </>
          )}

          {allStepsComplete && process.estado !== "COMPLETADO" && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">
                    Todos los pasos han sido completados
                  </span>
                </div>
                <Button onClick={handleMarkComplete}>
                  Marcar como Completado
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Steps Card – usando los pasos reales del backend */}
      <Card>
        <CardHeader>
          <CardTitle>Pasos del Proceso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Este proceso aún no tiene pasos.
            </p>
          )}

          {steps.map((step, index) => {
            const stepState = getStepState(step.estado);
            const files = (step.files ?? []) as StepFileSummary[];

            return (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {stepState.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>
                          Paso {index + 1}: {step.title}
                        </span>
                        <Badge className={stepState.color}>
                          {stepState.label}
                        </Badge>
                      </div>
                      {step.comment && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Comentario: {step.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                {files.length > 0 && (
                  <div className="ml-8 space-y-2">
                    <div className="text-sm">Archivos cargados:</div>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{file.originalName}</div>
                            <div className="text-xs text-muted-foreground">
                              v{file.version} ·{" "}
                              {(file.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                              {formatDateTime(file.uploadedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(step.id, file)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveFile(file.id, file.originalName)
                            }
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
                    Cargar archivo
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
          onUploaded={load}
        />
      )}
    </div>
  );
}
