import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User } from '../types';
import { mockProcessTypes, mockProcessTemplates, mockStepTemplates, mockUsers } from '../data/mockData';
import { toast } from 'sonner@2.0.3';
import { FileText, CheckCircle } from 'lucide-react';

interface CreateProcessModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: User;
}

export function CreateProcessModal({ open, onClose, currentUser }: CreateProcessModalProps) {
  const [selectedProcessTypeId, setSelectedProcessTypeId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showObsoleteTemplates, setShowObsoleteTemplates] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [responsibleUserId, setResponsibleUserId] = useState(currentUser.id.toString());

  // Filtrar plantillas según el tipo de proceso seleccionado
  const availableTemplates = mockProcessTemplates.filter(t => {
    if (!selectedProcessTypeId) return false;
    const matchesType = t.process_type_id.toString() === selectedProcessTypeId;
    const matchesActive = showObsoleteTemplates || t.is_active;
    return matchesType && matchesActive;
  });

  // Obtener pasos de la plantilla seleccionada para vista previa
  const selectedTemplate = mockProcessTemplates.find(t => t.id.toString() === selectedTemplateId);
  const templateSteps = selectedTemplateId 
    ? mockStepTemplates.filter(s => s.template_id && s.template_id.toString() === selectedTemplateId)
    : [];

  const handleCreate = () => {
    if (!selectedProcessTypeId || !selectedTemplateId || !processTitle) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    toast.success('Proceso creado exitosamente');
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedProcessTypeId('');
    setSelectedTemplateId('');
    setProcessTitle('');
    setYear(new Date().getFullYear().toString());
    setMonth((new Date().getMonth() + 1).toString());
    setResponsibleUserId(currentUser.id.toString());
    setShowObsoleteTemplates(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              <Select value={selectedProcessTypeId} onValueChange={(value) => {
                setSelectedProcessTypeId(value);
                setSelectedTemplateId(''); // Reset template when type changes
              }}>
                <SelectTrigger id="processType">
                  <SelectValue placeholder="Seleccione un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {mockProcessTypes.map(type => (
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
                    onCheckedChange={(checked) => setShowObsoleteTemplates(checked as boolean)}
                  />
                  <Label htmlFor="showObsolete" className="text-sm cursor-pointer">
                    Mostrar plantillas obsoletas
                  </Label>
                </div>

                <div>
                  <Label htmlFor="template">Plantilla *</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Seleccione una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.description} {!template.is_active && '(Obsoleta)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableTemplates.length === 0 && (
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

            <div>
              <Label htmlFor="responsible">Responsable *</Label>
              <Select value={responsibleUserId} onValueChange={setResponsibleUserId}>
                <SelectTrigger id="responsible">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column - Template Preview */}
          <div>
            {selectedTemplateId && selectedTemplate ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vista previa de plantilla</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Descripción</div>
                    <div className="text-sm mt-1">{selectedTemplate.description}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Estado</div>
                    <Badge className={selectedTemplate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedTemplate.is_active ? 'Activa' : 'Obsoleta'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Pasos ({templateSteps.length})
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {templateSteps
                        .sort((a, b) => a.ord - b.ord)
                        .map((step) => (
                          <div key={step.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                              {step.ord}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm">{step.title}</div>
                              {step.description && (
                                <div className="text-xs text-muted-foreground">{step.description}</div>
                              )}
                              {step.required && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Requerido
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Seleccione una plantilla para ver los pasos</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => {
            handleReset();
            onClose();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleCreate}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Crear Proceso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}