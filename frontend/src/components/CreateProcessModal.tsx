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
import { Label } from "./ui/label";
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
import { User } from "../types";
import { toast } from "sonner";
import { FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import type { ProcessType } from "../api/processTypes";
import { fetchProcessTypes } from "../api/processTypes";
import type { ProcessTemplate } from "../api/processTemplates";
import { fetchProcessTemplates } from "../api/processTemplates";
import {
  createProcessInstance,
  type CreateProcessInstanceInput,
  type ProcessInstance,
} from "../api/processInstances";

interface CreateProcessModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: User;
  onProcessCreated?: (instance: ProcessInstance) => void;
}

export function CreateProcessModal({
  open,
  onClose,
  currentUser,
  onProcessCreated,
}: CreateProcessModalProps) {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);

  const [selectedProcessTypeId, setSelectedProcessTypeId] =
    useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showObsoleteTemplates, setShowObsoleteTemplates] = useState(false);
  const [processTitle, setProcessTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [dueAt, setDueAt] = useState<Date | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [types, allTemplates] = await Promise.all([
          fetchProcessTypes(),
          fetchProcessTemplates(),
        ]);
        setProcessTypes(types);
        setTemplates(allTemplates);
      } catch (error) {
        console.error(error);
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

  const handleCreate = async () => {
    if (!selectedProcessTypeId || !selectedTemplateId || !processTitle) {
      toast.error("Complete todos los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateProcessInstanceInput = {
        processTypeId: Number(selectedProcessTypeId),
        templateId: Number(selectedTemplateId),
        title: processTitle,
        year: Number(year),
        month: Number(month),
        comment: undefined,
        dueAt: dueAt ? dueAt.toISOString() : undefined,
      };

      const newInstance = await createProcessInstance(payload);

      toast.success("Proceso creado exitosamente");

      if (onProcessCreated) {
        onProcessCreated(newInstance);
      }

      handleReset();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo crear el proceso");
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
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proceso</DialogTitle>
          <DialogDescription>
            Complete la información para crear un nuevo proceso institucional
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="processType">Tipo de proceso *</Label>
              <Select
                value={selectedProcessTypeId}
                onValueChange={(value: string) => {
                  setSelectedProcessTypeId(value);
                  setSelectedTemplateId("");
                }}
                disabled={loading}
              >
                <SelectTrigger id="processType">
                  <SelectValue
                    placeholder={loading ? "Cargando..." : "Seleccione un tipo"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {processTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                    className="text-sm cursor-pointer"
                  >
                    Mostrar plantillas inactivas
                  </Label>
                </div>

                <div>
                  <Label htmlFor="template">Plantilla *</Label>
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                    disabled={loading || availableTemplates.length === 0}
                  >
                    <SelectTrigger id="template">
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
                          {template.name || template.description}{" "}
                          {!template.isActive && "(Inactiva)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!loading && availableTemplates.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No hay plantillas disponibles para este tipo
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="title">Título del proceso *</Label>
              <Input
                id="title"
                value={processTitle}
                onChange={(e) => setProcessTitle(e.target.value)}
                placeholder="Ej: Evaluación Docente 2025-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Año *</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="month">Mes *</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Enero</SelectItem>
                    <SelectItem value="2">Febrero</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Mayo</SelectItem>
                    <SelectItem value="6">Junio</SelectItem>
                    <SelectItem value="7">Julio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Fecha de Término (Opcional)</Label>
              {/* CAMBIO PRINCIPAL: Se eliminó modal={true} y se confía en el zIndex */}
              <Input
                type="date"
                value={dueAt ? format(dueAt, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  if (!e.target.value) {
                    setDueAt(undefined);
                  } else {
                    // Set to noon to avoid timezone issues rolling back to previous day
                    setDueAt(new Date(e.target.value + "T12:00:00"));
                  }
                }}
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Esta fecha se aplicará como límite para el proceso y todos sus pasos.
              </p>
            </div>
          </div>

          {/* Right Column - Template Preview */}
          <div>
            {selectedTemplateId && selectedTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Vista previa de plantilla
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Nombre</div>
                    <div className="text-sm mt-1">
                      {selectedTemplate.name || selectedTemplate.description}
                    </div>
                  </div>
                  {selectedTemplate.description && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Descripción
                      </div>
                      <div className="text-sm mt-1">
                        {selectedTemplate.description}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <Badge
                      className={
                        selectedTemplate.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {selectedTemplate.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Los pasos del proceso se crearán automáticamente según la
                    configuración de esta plantilla.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      Seleccione una plantilla para ver la información básica
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={submitting || loading}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {submitting ? "Creando..." : "Crear Proceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}