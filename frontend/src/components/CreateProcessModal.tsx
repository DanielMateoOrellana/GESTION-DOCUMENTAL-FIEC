// frontend/src/components/CreateProcessModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { User } from "../types";
import { toast } from "sonner";
import { FileText, CheckCircle, AlertTriangle, Calendar } from "lucide-react";
import { format } from "date-fns";

import type { ProcessType } from "../api/processTypes";
import { fetchProcessTypes } from "../api/processTypes";
import type { ProcessTemplate } from "../api/processTemplates";
import { fetchProcessTemplates } from "../api/processTemplates";
import {
  createProcessInstance,
  type CreateProcessInstanceInput,
  type ProcessInstance,
} from "../api/processInstances";
import { FormField } from "./ui/form-field";
import { LoadingSpinner, TableSkeleton } from "./ui/loading-spinner";
import { cn } from "./ui/utils";

interface CreateProcessModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: User;
  onProcessCreated?: (instance: ProcessInstance) => void;
}

interface FormErrors {
  processType?: string;
  template?: string;
  title?: string;
  year?: string;
  month?: string;
}

export function CreateProcessModal({
  open,
  onClose,
  currentUser,
  onProcessCreated,
}: CreateProcessModalProps) {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);

  const [selectedProcessTypeId, setSelectedProcessTypeId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showObsoleteTemplates, setShowObsoleteTemplates] = useState(false);
  const [processTitle, setProcessTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [dueAt, setDueAt] = useState<Date | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const [types, allTemplates] = await Promise.all([
          fetchProcessTypes(),
          fetchProcessTemplates(),
        ]);
        setProcessTypes(types);
        setTemplates(allTemplates);
      } catch (error) {
        console.error(error);
        setLoadError("No se pudieron cargar los datos. Por favor, intente nuevamente.");
        toast.error("Error al cargar datos iniciales");
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  const availableTemplates = templates.filter(
    (t) =>
      t.processTypeId.toString() === selectedProcessTypeId &&
      (showObsoleteTemplates ? true : t.isActive)
  );

  const selectedTemplate = templates.find(
    (t) => t.id.toString() === selectedTemplateId
  );

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!selectedProcessTypeId) {
      errors.processType = "Seleccione un tipo de proceso";
    }

    if (!selectedTemplateId) {
      errors.template = "Seleccione una plantilla";
    }

    if (!processTitle.trim()) {
      errors.title = "El título es requerido";
    } else if (processTitle.trim().length < 5) {
      errors.title = "El título debe tener al menos 5 caracteres";
    }

    setFormErrors(errors);
    setTouched({ processType: true, template: true, title: true });
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateProcessInstanceInput = {
        processTypeId: Number(selectedProcessTypeId),
        templateId: Number(selectedTemplateId),
        title: processTitle.trim(),
        year: Number(year),
        month: Number(month),
        comment: undefined,
        dueAt: dueAt ? dueAt.toISOString() : undefined,
      };

      const newInstance = await createProcessInstance(payload);

      toast.success("Proceso creado exitosamente", {
        description: `${processTitle} ha sido creado correctamente.`,
        icon: <CheckCircle className="w-4 h-4" />,
      });

      if (onProcessCreated) {
        onProcessCreated(newInstance);
      }

      handleReset();
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "No se pudo crear el proceso";
      toast.error("Error al crear el proceso", {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProcessTypeId("");
    setSelectedTemplateId("");
    setProcessTitle("");
    setYear(new Date().getFullYear().toString());
    setMonth((new Date().getMonth() + 1).toString());
    setDueAt(undefined);
    setShowObsoleteTemplates(false);
    setFormErrors({});
    setTouched({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const years = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proceso</DialogTitle>
          <DialogDescription>
            Complete la información para crear un nuevo proceso institucional. Los campos marcados con * son requeridos.
          </DialogDescription>
        </DialogHeader>

        {loadError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">Error al cargar datos</p>
            <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
            <Button variant="outline" onClick={() => { setLoadError(null); }}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <div className="space-y-4">
              <FormField
                label="Tipo de proceso"
                htmlFor="processType"
                required
                error={touched.processType ? formErrors.processType : undefined}
              >
                <Select
                  value={selectedProcessTypeId}
                  onValueChange={(value: string) => {
                    setSelectedProcessTypeId(value);
                    setSelectedTemplateId("");
                    setFormErrors(prev => ({ ...prev, processType: undefined }));
                  }}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="processType"
                    className={cn(
                      touched.processType && formErrors.processType && "border-destructive"
                    )}
                  >
                    <SelectValue
                      placeholder={loading ? "Cargando..." : "Seleccione un tipo"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {processTypes.length === 0 && !loading ? (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No hay tipos de proceso disponibles
                      </div>
                    ) : (
                      processTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </FormField>

              {selectedProcessTypeId && (
                <>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showObsolete"
                      checked={showObsoleteTemplates}
                      onCheckedChange={(checked: boolean) =>
                        setShowObsoleteTemplates(checked)
                      }
                    />
                    <Label
                      htmlFor="showObsolete"
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      Mostrar plantillas inactivas
                    </Label>
                  </div>

                  <FormField
                    label="Plantilla"
                    htmlFor="template"
                    required
                    error={touched.template ? formErrors.template : undefined}
                    hint={availableTemplates.length === 0 && !loading ? "No hay plantillas disponibles para este tipo" : undefined}
                  >
                    <Select
                      value={selectedTemplateId}
                      onValueChange={(value: string) => {
                        setSelectedTemplateId(value);
                        setFormErrors(prev => ({ ...prev, template: undefined }));
                      }}
                      disabled={loading || availableTemplates.length === 0}
                    >
                      <SelectTrigger
                        id="template"
                        className={cn(
                          touched.template && formErrors.template && "border-destructive"
                        )}
                      >
                        <SelectValue
                          placeholder={
                            loading ? "Cargando..." : "Seleccione una plantilla"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <span>{template.name || template.description}</span>
                              {!template.isActive && (
                                <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </>
              )}

              <FormField
                label="Título del proceso"
                htmlFor="title"
                required
                error={touched.title ? formErrors.title : undefined}
                hint="Ej: Evaluación Docente 2025-1"
              >
                <Input
                  id="title"
                  value={processTitle}
                  onChange={(e) => {
                    setProcessTitle(e.target.value);
                    if (e.target.value.trim().length >= 5) {
                      setFormErrors(prev => ({ ...prev, title: undefined }));
                    }
                  }}
                  onBlur={() => handleBlur('title')}
                  placeholder="Ingrese un título descriptivo"
                  className={cn(
                    touched.title && formErrors.title && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Año" htmlFor="year" required>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger id="year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Mes" htmlFor="month" required>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger id="month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField
                label="Fecha de Término"
                htmlFor="dueAt"
                hint="Esta fecha se aplicará como límite para el proceso y todos sus pasos."
              >
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dueAt"
                    type="date"
                    value={dueAt ? format(dueAt, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setDueAt(undefined);
                      } else {
                        setDueAt(new Date(e.target.value + "T12:00:00"));
                      }
                    }}
                    className="pl-9"
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </FormField>
            </div>

            {/* Right Column - Template Preview */}
            <div>
              {loading ? (
                <Card>
                  <CardContent className="pt-6">
                    <LoadingSpinner size="lg" text="Cargando plantillas..." className="py-12" />
                  </CardContent>
                </Card>
              ) : selectedTemplateId && selectedTemplate ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Vista previa de plantilla
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Nombre</div>
                      <div className="text-sm font-medium mt-1">
                        {selectedTemplate.name || selectedTemplate.description}
                      </div>
                    </div>
                    {selectedTemplate.description && (
                      <div>
                        <div className="text-sm text-muted-foreground">Descripción</div>
                        <div className="text-sm mt-1">{selectedTemplate.description}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-muted-foreground">Estado</div>
                      <Badge
                        className={cn(
                          "mt-1",
                          selectedTemplate.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {selectedTemplate.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    {selectedTemplate.steps && selectedTemplate.steps.length > 0 && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Pasos ({selectedTemplate.steps.length})
                        </div>
                        <div className="space-y-1.5">
                          {selectedTemplate.steps.slice(0, 5).map((step, index) => (
                            <div key={step.id} className="flex items-center gap-2 text-xs">
                              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                {index + 1}
                              </span>
                              <span className="truncate">{step.name}</span>
                            </div>
                          ))}
                          {selectedTemplate.steps.length > 5 && (
                            <p className="text-xs text-muted-foreground pl-7">
                              +{selectedTemplate.steps.length - 5} pasos más
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Los pasos del proceso se crearán automáticamente según la
                      configuración de esta plantilla.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground py-12">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium mb-1">Sin plantilla seleccionada</p>
                      <p className="text-sm">
                        Seleccione un tipo de proceso y una plantilla para ver la información
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={submitting || loading || !!loadError}
            className="min-w-[140px]"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Proceso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}