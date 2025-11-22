import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ProcessType, ProcessTemplate, StepTemplate } from '../types';
import { mockProcessTypes, mockProcessTemplates, mockStepTemplates } from '../data/mockData';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProcessTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onCreateProcess: (processTypeId: number, templateId: number) => void;
}

export function ProcessTemplateSelector({ open, onClose, onCreateProcess }: ProcessTemplateSelectorProps) {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const processTypes = mockProcessTypes.filter(pt => pt.active);

  const getTemplatesForType = (typeId: number): ProcessTemplate[] => {
    return mockProcessTemplates.filter(t => t.process_type_id === typeId && t.is_published);
  };

  const getStepsForTemplate = (templateId: number): StepTemplate[] => {
    return mockStepTemplates
      .filter(s => s.template_id === templateId)
      .sort((a, b) => a.ord - b.ord);
  };

  const selectedType = selectedTypeId ? processTypes.find(pt => pt.id === selectedTypeId) : null;
  const availableTemplates = selectedTypeId ? getTemplatesForType(selectedTypeId) : [];
  const selectedTemplate = selectedTemplateId 
    ? mockProcessTemplates.find(t => t.id === selectedTemplateId) 
    : availableTemplates[0];
  const templateSteps = selectedTemplate ? getStepsForTemplate(selectedTemplate.id) : [];

  const handleTypeSelect = (typeId: number) => {
    setSelectedTypeId(typeId);
    const templates = getTemplatesForType(typeId);
    setSelectedTemplateId(templates.length > 0 ? templates[0].id : null);
  };

  const handleCreateProcess = () => {
    if (!selectedTypeId || !selectedTemplate) {
      toast.error('Por favor seleccione un tipo de proceso y una plantilla');
      return;
    }

    onCreateProcess(selectedTypeId, selectedTemplate.id);
  };

  const handleClose = () => {
    setSelectedTypeId(null);
    setSelectedTemplateId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proceso</DialogTitle>
          <DialogDescription>
            Seleccione el tipo de proceso y la plantilla que desea utilizar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Process Type */}
          <div>
            <h3 className="mb-3">Paso 1: Seleccione el Tipo de Proceso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processTypes.map(type => {
                const templates = getTemplatesForType(type.id);
                const isSelected = selectedTypeId === type.id;
                
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{type.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {type.description}
                          </CardDescription>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline">
                          {templates.length} {templates.length === 1 ? 'plantilla' : 'plantillas'}
                        </Badge>
                        <Badge variant="secondary">{type.code}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Template (if multiple available) */}
          {selectedType && availableTemplates.length > 0 && (
            <div>
              <h3 className="mb-3">Paso 2: Seleccione la Plantilla</h3>
              {availableTemplates.length > 1 ? (
                <Select
                  value={selectedTemplateId?.toString() || availableTemplates[0]?.id.toString()}
                  onValueChange={(value) => setSelectedTemplateId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.description} (v{template.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{selectedTemplate?.description}</CardTitle>
                    <CardDescription>Versión {selectedTemplate?.version}</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Preview Template Steps */}
          {selectedTemplate && templateSteps.length > 0 && (
            <div>
              <h3 className="mb-3">Paso 3: Vista Previa de los Pasos</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Pasos del Proceso ({templateSteps.length} pasos)
                  </CardTitle>
                  <CardDescription>
                    Estos son los pasos que se crearán para el nuevo proceso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templateSteps.map((step, index) => (
                      <div 
                        key={step.id}
                        className="flex items-start gap-3 p-3 bg-secondary rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                          {step.ord}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{step.title}</span>
                            {step.required && (
                              <Badge variant="destructive" className="text-xs">
                                Obligatorio
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedType && availableTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>No hay plantillas publicadas disponibles para este tipo de proceso</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateProcess}
            disabled={!selectedTypeId || !selectedTemplate}
          >
            Crear Proceso
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
