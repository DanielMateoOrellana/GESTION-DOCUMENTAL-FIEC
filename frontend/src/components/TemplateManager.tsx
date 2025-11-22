import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Trash2, GripVertical, Check, X, FileText } from 'lucide-react';
import { ProcessType, ProcessTemplate, StepTemplate, User } from '../types';
import { mockProcessTypes, mockProcessTemplates, mockStepTemplates } from '../data/mockData';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { mockRoles } from '../data/mockData';

interface TemplateManagerProps {
  currentUser: User;
}

interface TemplateStep {
  id: string;
  ord: number;
  title: string;
  description: string;
  required: boolean;
  reviewer_role_id: number;
}

export function TemplateManager({ currentUser }: TemplateManagerProps) {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>(mockProcessTypes);
  const [templates, setTemplates] = useState<ProcessTemplate[]>(mockProcessTemplates);
  const [stepTemplates, setStepTemplates] = useState<StepTemplate[]>(mockStepTemplates);
  
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProcessTemplate | null>(null);
  
  // New Process Type Form
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');
  
  // New Template Form
  const [newTemplateProcessTypeId, setNewTemplateProcessTypeId] = useState<number | null>(null);
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([]);

  const handleCreateProcessType = () => {
    if (!newTypeName || !newTypeCode || !newTypeDescription) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    const newType: ProcessType = {
      id: Math.max(...processTypes.map(t => t.id)) + 1,
      code: newTypeCode.toUpperCase(),
      name: newTypeName,
      description: newTypeDescription,
      active: true,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    setProcessTypes([...processTypes, newType]);
    toast.success('Tipo de proceso creado exitosamente');
    
    // Reset form
    setNewTypeName('');
    setNewTypeCode('');
    setNewTypeDescription('');
    setIsCreatingType(false);
  };

  const handleAddStep = () => {
    const newStep: TemplateStep = {
      id: `temp-${Date.now()}`,
      ord: templateSteps.length + 1,
      title: '',
      description: '',
      required: false,
      reviewer_role_id: 5 // Default to Secretary
    };
    setTemplateSteps([...templateSteps, newStep]);
  };

  const handleUpdateStep = (id: string, field: keyof TemplateStep, value: any) => {
    setTemplateSteps(templateSteps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleRemoveStep = (id: string) => {
    setTemplateSteps(templateSteps.filter(step => step.id !== id));
    // Reorder
    setTemplateSteps(prev => prev.map((step, idx) => ({ ...step, ord: idx + 1 })));
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const index = templateSteps.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === templateSteps.length - 1) return;

    const newSteps = [...templateSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update ord
    newSteps.forEach((step, idx) => {
      step.ord = idx + 1;
    });
    
    setTemplateSteps(newSteps);
  };

  const handleSaveTemplate = (publish: boolean = false) => {
    if (!newTemplateProcessTypeId || !newTemplateDescription) {
      toast.error('Por favor complete la descripción de la plantilla');
      return;
    }

    if (templateSteps.length === 0) {
      toast.error('La plantilla debe tener al menos un paso');
      return;
    }

    // Validate at least one required step when publishing
    if (publish) {
      const hasRequiredStep = templateSteps.some(step => step.required);
      if (!hasRequiredStep) {
        toast.error('Debe haber al menos un paso obligatorio para publicar');
        return;
      }
    }

    // Validate all steps have title and description
    const invalidSteps = templateSteps.filter(step => !step.title || !step.description);
    if (invalidSteps.length > 0) {
      toast.error('Todos los pasos deben tener título y descripción');
      return;
    }

    const newTemplate: ProcessTemplate = {
      id: Math.max(...templates.map(t => t.id)) + 1,
      process_type_id: newTemplateProcessTypeId,
      description: newTemplateDescription,
      version: 1,
      is_published: publish,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    setTemplates([...templates, newTemplate]);

    // Create step templates
    const newStepTemplates: StepTemplate[] = templateSteps.map((step, index) => ({
      id: Math.max(...stepTemplates.map(s => s.id), 0) + index + 1,
      template_id: newTemplate.id,
      ord: step.ord,
      title: step.title,
      description: step.description,
      required: step.required,
      reviewer_role_id: step.reviewer_role_id,
      created_at: new Date().toISOString()
    }));

    setStepTemplates([...stepTemplates, ...newStepTemplates]);

    toast.success(
      publish 
        ? 'Plantilla creada y publicada exitosamente'
        : 'Plantilla guardada como borrador'
    );
    
    // Reset form
    setNewTemplateProcessTypeId(null);
    setNewTemplateDescription('');
    setTemplateSteps([]);
    setIsCreatingTemplate(false);
  };

  const getStepsForTemplate = (templateId: number) => {
    return stepTemplates.filter(s => s.template_id === templateId).sort((a, b) => a.ord - b.ord);
  };

  const getProcessTypeName = (id: number) => {
    return processTypes.find(t => t.id === id)?.name || 'Desconocido';
  };

  const getRoleName = (id: number) => {
    return mockRoles.find(r => r.id === id)?.name || 'Desconocido';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Plantillas de Procesos</h1>
          <p className="text-muted-foreground">
            Crear tipos de procesos y definir plantillas con pasos dinámicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreatingType(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Proceso
          </Button>
          <Button onClick={() => setIsCreatingTemplate(true)} variant="default">
            <FileText className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Process Types Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Procesos</CardTitle>
          <CardDescription>
            Tipos de procesos definidos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {processTypes.filter(t => t.active).map(type => (
              <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{type.name}</span>
                    <Badge variant="outline">{type.code}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                </div>
                <Badge variant="secondary">
                  {templates.filter(t => t.process_type_id === type.id).length} plantillas
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Procesos</CardTitle>
          <CardDescription>
            Plantillas configuradas con sus pasos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map(template => {
              const steps = getStepsForTemplate(template.id);
              const requiredCount = steps.filter(s => s.required).length;
              
              return (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {getProcessTypeName(template.process_type_id)}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={template.is_published ? "default" : "secondary"}>
                          {template.is_published ? 'Publicada' : 'Borrador'}
                        </Badge>
                        <Badge variant="outline">v{template.version}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>{steps.length} pasos</span>
                        <span>{requiredCount} obligatorios</span>
                      </div>
                      {steps.map(step => (
                        <div key={step.id} className="flex items-start gap-3 p-2 bg-secondary rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                            {step.ord}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span>{step.title}</span>
                              {step.required && (
                                <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Revisor: {getRoleName(step.reviewer_role_id)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Process Type Dialog */}
      <Dialog open={isCreatingType} onOpenChange={setIsCreatingType}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Tipo de Proceso</DialogTitle>
            <DialogDescription>
              Define un nuevo tipo de proceso con nombre y descripción
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type-name">Nombre *</Label>
              <Input
                id="type-name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Ej: Evaluación Docente"
              />
            </div>
            <div>
              <Label htmlFor="type-code">Código *</Label>
              <Input
                id="type-code"
                value={newTypeCode}
                onChange={(e) => setNewTypeCode(e.target.value.toUpperCase())}
                placeholder="Ej: EVAL_DOC"
              />
            </div>
            <div>
              <Label htmlFor="type-description">Descripción *</Label>
              <Textarea
                id="type-description"
                value={newTypeDescription}
                onChange={(e) => setNewTypeDescription(e.target.value)}
                placeholder="Describe el tipo de proceso..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingType(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProcessType}>
              Crear Tipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreatingTemplate} onOpenChange={setIsCreatingTemplate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Plantilla de Proceso</DialogTitle>
            <DialogDescription>
              Define una plantilla con pasos dinámicos y configurables
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="template-type">Tipo de Proceso *</Label>
              <Select
                value={newTemplateProcessTypeId?.toString()}
                onValueChange={(value) => setNewTemplateProcessTypeId(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {processTypes.filter(t => t.active).map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="template-description">Descripción de la Plantilla *</Label>
              <Textarea
                id="template-description"
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="Describe esta plantilla..."
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Pasos de la Plantilla</Label>
                <Button size="sm" variant="outline" onClick={handleAddStep}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Paso
                </Button>
              </div>

              <div className="space-y-3">
                {templateSteps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveStep(step.id, 'up')}
                          disabled={index === 0}
                        >
                          <GripVertical className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge>{step.ord}</Badge>
                      <Input
                        placeholder="Título del paso *"
                        value={step.title}
                        onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStep(step.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <Textarea
                      placeholder="Descripción del paso *"
                      value={step.description}
                      onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                      rows={2}
                    />

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={step.required}
                          onCheckedChange={(checked) => handleUpdateStep(step.id, 'required', checked)}
                        />
                        <Label className="text-sm">Obligatorio</Label>
                      </div>

                      <div className="flex-1">
                        <Select
                          value={step.reviewer_role_id.toString()}
                          onValueChange={(value) => handleUpdateStep(step.id, 'reviewer_role_id', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockRoles.map(role => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                Revisor: {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {templateSteps.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                    No hay pasos definidos. Haga clic en "Agregar Paso" para comenzar.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingTemplate(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={() => handleSaveTemplate(false)}>
              Guardar Borrador
            </Button>
            <Button onClick={() => handleSaveTemplate(true)}>
              Guardar y Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
