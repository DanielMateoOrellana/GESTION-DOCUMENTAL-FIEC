// frontend/src/components/ProcessInstanceCreator.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User } from '../types';
import { toast } from 'sonner@2.0.3';
import { Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  createProcessInstance,
  type ProcessInstance as ApiProcessInstance,
} from '../api/processInstances';
import {
  mockProcessTypes,
  mockProcessTemplates,
  mockStepTemplates,
} from '../data/mockData';

interface ProcessInstanceCreatorProps {
  currentUser: User;
  onInstanceCreated?: (instance: ApiProcessInstance) => void;
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function ProcessInstanceCreator({
  currentUser,
  onInstanceCreated,
}: ProcessInstanceCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProcessTypeId, setSelectedProcessTypeId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const availableTemplates = selectedProcessTypeId
    ? mockProcessTemplates.filter(
        (t) => t.process_type_id === selectedProcessTypeId && t.is_published,
      )
    : [];

  const handleCreateInstance = async () => {
    if (!selectedProcessTypeId || !selectedTemplateId || !selectedYear || !selectedMonth) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const instance = await createProcessInstance({
        processTypeId: selectedProcessTypeId,
        templateId: selectedTemplateId,
        title:
          title || `Proceso ${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
        comment: comment || undefined,
        year: selectedYear,
        month: selectedMonth,
      });

      toast.success(
        `Instancia creada exitosamente. ${(instance.steps?.length ?? 0)} pasos creados en estado "PENDIENTE"`,
      );

      onInstanceCreated?.(instance);

      // Reset
      setSelectedProcessTypeId(null);
      setSelectedTemplateId(null);
      setSelectedYear(CURRENT_YEAR);
      setSelectedMonth(new Date().getMonth() + 1);
      setTitle('');
      setComment('');
      setIsCreating(false);
    } catch (err) {
      console.error('[ProcessInstanceCreator] Error creando instancia', err);
      toast.error('No se pudo crear la instancia. Revisa el backend o el body enviado.');
    } finally {
      setLoading(false);
    }
  };

  const getProcessTypeName = (id: number) => {
    return mockProcessTypes.find((t) => t.id === id)?.name || '';
  };

  return (
    <div>
      <Button onClick={() => setIsCreating(true)} className="w-full">
        <Calendar className="w-4 h-4 mr-2" />
        Crear Nueva Instancia de Proceso
      </Button>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Instancia de Proceso</DialogTitle>
            <DialogDescription>
              Instanciar un proceso desde una plantilla publicada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de proceso */}
            <div>
              <Label htmlFor="process-type">Tipo de Proceso *</Label>
              <Select
                value={selectedProcessTypeId?.toString()}
                onValueChange={(value) => {
                  setSelectedProcessTypeId(parseInt(value));
                  setSelectedTemplateId(null);
                }}
              >
                <SelectTrigger id="process-type">
                  <SelectValue placeholder="Seleccione un tipo de proceso" />
                </SelectTrigger>
                <SelectContent>
                  {mockProcessTypes
                    .filter((t) => t.active)
                    .map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plantilla */}
            {selectedProcessTypeId && (
              <div>
                <Label htmlFor="template">Plantilla *</Label>
                <Select
                  value={selectedTemplateId?.toString()}
                  onValueChange={(value) => setSelectedTemplateId(parseInt(value))}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Seleccione una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map((template) => {
                      const steps = mockStepTemplates.filter(
                        (st) => st.template_id === template.id,
                      );
                      return (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.description} (v{template.version}) -{' '}
                          {steps.length} pasos
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {availableTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    No hay plantillas publicadas para este tipo de proceso
                  </p>
                )}
              </div>
            )}

            {/* Año / Mes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Año *</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="month">Mes *</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Título opcional */}
            <div>
              <Label htmlFor="title">Título (Opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Evaluación Docente Semestre 2025-2"
              />
            </div>

            {/* Comentario opcional */}
            <div>
              <Label htmlFor="comment">Comentarios (Opcional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregue comentarios adicionales..."
                rows={3}
              />
            </div>

            {/* Vista previa */}
            {selectedProcessTypeId && selectedTemplateId && (
              <Card className="bg-secondary">
                <CardHeader>
                  <CardTitle className="text-sm">Vista Previa</CardTitle>
                  <CardDescription className="text-xs">
                    El proceso se creará en estado <strong>"PENDIENTE"</strong> y
                    todos los pasos también estarán en{" "}
                    <strong>"PENDIENTE"</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{getProcessTypeName(selectedProcessTypeId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periodo:</span>
                    <span>
                      {
                        MONTHS.find((m) => m.value === selectedMonth)
                          ?.label
                      }{" "}
                      {selectedYear}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsable:</span>
                    <span>{currentUser.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pasos a crear:</span>
                    <Badge>
                      {
                        mockStepTemplates.filter(
                          (st) => st.template_id === selectedTemplateId,
                        ).length
                      }{" "}
                      pasos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreating(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateInstance} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Instancia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
