import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProcessType, ProcessTemplate, User, ProcessInstance, StepInstance } from '../types';
import { mockProcessTypes, mockProcessTemplates, mockStepTemplates, mockUsers } from '../data/mockData';
import { toast } from 'sonner@2.0.3';
import { Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProcessInstanceCreatorProps {
  currentUser: User;
  onInstanceCreated?: (instance: ProcessInstance) => void;
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
  { value: 12, label: 'Diciembre' }
];

const CURRENT_YEAR = 2025;
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function ProcessInstanceCreator({ currentUser, onInstanceCreated }: ProcessInstanceCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedProcessTypeId, setSelectedProcessTypeId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [responsibleUserId, setResponsibleUserId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const availableTemplates = selectedProcessTypeId
    ? mockProcessTemplates.filter(t => t.process_type_id === selectedProcessTypeId && t.is_published)
    : [];

  const handleCreateInstance = () => {
    if (!selectedProcessTypeId || !selectedTemplateId || !selectedYear || !selectedMonth || !responsibleUserId) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    // Create the process instance
    const newInstance: ProcessInstance = {
      id: Math.floor(Math.random() * 10000), // Mock ID
      process_type_id: selectedProcessTypeId,
      template_id: selectedTemplateId,
      year: selectedYear,
      month: selectedMonth,
      state: 'IN_PROGRESS',
      responsible_user_id: responsibleUserId,
      title: title || undefined,
      comment: comment || undefined,
      archived: false,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: [],
      metadata: {
        created_via: 'ProcessInstanceCreator'
      }
    };

    // Get step templates for this template
    const stepTemplates = mockStepTemplates.filter(st => st.template_id === selectedTemplateId);
    
    // Create step instances - all start as PENDING
    const newStepInstances: StepInstance[] = stepTemplates.map(st => ({
      id: Math.floor(Math.random() * 10000), // Mock ID
      process_instance_id: newInstance.id,
      step_template_id: st.id,
      title: st.title,
      status: 'PENDING', // All steps start as PENDING per AED-002
      reviewer_role_id: st.reviewer_role_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    toast.success(
      `Instancia creada exitosamente. ${newStepInstances.length} pasos creados en estado "Pendiente"`
    );

    // Call callback if provided
    if (onInstanceCreated) {
      onInstanceCreated(newInstance);
    }

    // Reset form
    setSelectedProcessTypeId(null);
    setSelectedTemplateId(null);
    setSelectedYear(CURRENT_YEAR);
    setSelectedMonth(10);
    setResponsibleUserId(null);
    setTitle('');
    setComment('');
    setIsCreating(false);
  };

  const getProcessTypeName = (id: number) => {
    return mockProcessTypes.find(t => t.id === id)?.name || '';
  };

  const getUserName = (id: number) => {
    return mockUsers.find(u => u.id === id)?.full_name || '';
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
            {/* Process Type Selection */}
            <div>
              <Label htmlFor="process-type">Tipo de Proceso *</Label>
              <Select
                value={selectedProcessTypeId?.toString()}
                onValueChange={(value) => {
                  setSelectedProcessTypeId(parseInt(value));
                  setSelectedTemplateId(null); // Reset template when type changes
                }}
              >
                <SelectTrigger id="process-type">
                  <SelectValue placeholder="Seleccione un tipo de proceso" />
                </SelectTrigger>
                <SelectContent>
                  {mockProcessTypes.filter(t => t.active).map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template Selection */}
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
                    {availableTemplates.map(template => {
                      const steps = mockStepTemplates.filter(st => st.template_id === template.id);
                      return (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.description} (v{template.version}) - {steps.length} pasos
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

            {/* Year and Month */}
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
                    {YEARS.map(year => (
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
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Responsible User */}
            <div>
              <Label htmlFor="responsible">Responsable *</Label>
              <Select
                value={responsibleUserId?.toString()}
                onValueChange={(value) => setResponsibleUserId(parseInt(value))}
              >
                <SelectTrigger id="responsible">
                  <SelectValue placeholder="Seleccione un responsable" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.filter(u => u.is_active).map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional Title */}
            <div>
              <Label htmlFor="title">Título (Opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Evaluación Docente Semestre 2025-2"
              />
            </div>

            {/* Optional Comment */}
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

            {/* Preview */}
            {selectedProcessTypeId && selectedTemplateId && selectedYear && selectedMonth && responsibleUserId && (
              <Card className="bg-secondary">
                <CardHeader>
                  <CardTitle className="text-sm">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{getProcessTypeName(selectedProcessTypeId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periodo:</span>
                    <span>{MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsable:</span>
                    <span>{getUserName(responsibleUserId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pasos a crear:</span>
                    <Badge>
                      {mockStepTemplates.filter(st => st.template_id === selectedTemplateId).length} pasos
                    </Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Todos los pasos se crearán en estado "Pendiente" y podrán ser filtrados y buscados por los metadatos especificados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInstance}>
              Crear Instancia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
