import { useState } from 'react';
import { ProcessInstance, User, ProcessType, ProcessTemplate, StepTemplate } from '../types';
import { 
  mockProcessInstances, 
  mockProcessTypes,
  mockUsers,
  mockProcessTemplates,
  mockStepTemplates,
  getProcessTypeById,
  getUserById,
  getProgressForProcess
} from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { ProcessTemplateSelector } from './ProcessTemplateSelector';
import { Search, Filter, Plus, Eye, X, FileText, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { mockRoles } from '../data/mockData';

interface ProcessListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

interface TemplateStep {
  id: string;
  ord: number;
  title: string;
  description: string;
  required: boolean;
  reviewer_role_id: number;
}

// Mock tags for filtering
const mockTags = [
  { id: 1, name: 'Urgente', color: '#EF4444' },
  { id: 2, name: 'Prioritario', color: '#F59E0B' },
  { id: 3, name: 'Revisado', color: '#10B981' },
  { id: 4, name: 'En Espera', color: '#6B7280' },
  { id: 5, name: 'Completado', color: '#3B82F6' }
];

const MONTHS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

export function ProcessList({ currentUser, onViewChange }: ProcessListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // To force re-render
  
  // New Template Form - Phase 1: Basic Info
  const [templatePhase, setTemplatePhase] = useState<1 | 2>(1);
  const [newTemplateProcessTypeId, setNewTemplateProcessTypeId] = useState<number | null>(null);
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([]);

  const filteredProcesses = mockProcessInstances.filter(process => {
    const matchesSearch = process.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || process.year.toString() === filterYear;
    const matchesMonth = filterMonth === 'all' || process.month.toString() === filterMonth;
    const matchesState = filterState === 'all' || process.state === filterState;
    const matchesType = filterType === 'all' || process.process_type_id.toString() === filterType;
    const matchesResponsible = filterResponsible === 'all' || process.responsible_user_id.toString() === filterResponsible;
    
    // Tag filtering (mock - in real app would check process_tags table)
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tagId => {
      // Mock: processes 1 and 2 have tags
      if (process.id === 1) return [1, 2].includes(tagId);
      if (process.id === 2) return [3].includes(tagId);
      if (process.id === 3) return [5].includes(tagId);
      return false;
    });
    
    return matchesSearch && matchesYear && matchesMonth && matchesState && matchesType && matchesResponsible && matchesTags;
  });

  const statusLabels: Record<string, string> = {
    'DRAFT': 'Borrador',
    'IN_PROGRESS': 'En Progreso',
    'PENDING_APPROVAL': 'Pendiente',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado',
    'CLOSED': 'Cerrado',
    'ARCHIVED': 'Archivado'
  };

  const getStatusColor = (status: string) => {
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

  const years = Array.from(new Set(mockProcessInstances.map(p => p.year))).sort((a, b) => b - a);

  const handleCreateProcess = (processTypeId: number, templateId: number) => {
    // Create new process and redirect to detail
    const newProcessId = Math.max(...mockProcessInstances.map(p => p.id)) + 1;
    const processType = getProcessTypeById(processTypeId);
    
    toast.success(`Proceso "${processType?.name}" creado exitosamente`);
    setShowNewProcessModal(false);
    
    // Redirect to process detail
    setTimeout(() => {
      onViewChange('process-detail', { processId: 1 }); // Using mock process for demo
    }, 500);
  };

  const handleToggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterYear('all');
    setFilterMonth('all');
    setFilterState('all');
    setFilterType('all');
    setFilterResponsible('all');
    setSelectedTags([]);
  };

  const activeFiltersCount = [
    searchTerm,
    filterYear !== 'all',
    filterMonth !== 'all',
    filterState !== 'all',
    filterType !== 'all',
    filterResponsible !== 'all',
    selectedTags.length > 0
  ].filter(Boolean).length;

  const formatDate = (year: number, month: number) => {
    const monthName = MONTHS.find(m => m.value === month.toString())?.label || month.toString();
    return `${monthName} ${year}`;
  };

  // Helper function to get tags for a process (mock data)
  const getProcessTags = (processId: number) => {
    if (processId === 1) return [mockTags[0], mockTags[1]]; // Urgente, Prioritario
    if (processId === 2) return [mockTags[2]]; // Revisado
    if (processId === 3) return [mockTags[4]]; // Completado
    if (processId === 4) return [mockTags[3]]; // En Espera
    return [];
  };

  const handleAddStep = () => {
    const newStep: TemplateStep = {
      id: `temp-${Date.now()}`,
      ord: templateSteps.length + 1,
      title: '',
      description: '',
      required: false,
      reviewer_role_id: 2 // Default to Secretaría
    };
    setTemplateSteps([...templateSteps, newStep]);
  };

  const handleUpdateStep = (id: string, field: keyof TemplateStep, value: any) => {
    setTemplateSteps(templateSteps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const handleRemoveStep = (id: string) => {
    const filtered = templateSteps.filter(step => step.id !== id);
    // Reorder
    setTemplateSteps(filtered.map((step, idx) => ({ ...step, ord: idx + 1 })));
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

  const handleNextPhase = () => {
    if (!newTemplateProcessTypeId || !newTemplateDescription) {
      toast.error('Por favor complete el tipo de proceso y descripción');
      return;
    }
    setTemplatePhase(2);
  };

  const handleSaveTemplate = (publish: boolean = false) => {
    if (templateSteps.length === 0) {
      toast.error('La plantilla debe tener al menos un paso');
      return;
    }

    // Validate all steps have title and description
    const invalidSteps = templateSteps.filter(step => !step.title || !step.description);
    if (invalidSteps.length > 0) {
      toast.error('Todos los pasos deben tener título y descripción');
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

    const newTemplate: ProcessTemplate = {
      id: Math.max(...mockProcessTemplates.map(t => t.id)) + 1,
      process_type_id: newTemplateProcessTypeId!,
      description: newTemplateDescription,
      version: 1,
      is_published: publish,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    mockProcessTemplates.push(newTemplate);

    // Create step templates
    const newStepTemplates: StepTemplate[] = templateSteps.map((step, index) => ({
      id: Math.max(...mockStepTemplates.map(s => s.id), 0) + index + 1,
      template_id: newTemplate.id,
      ord: step.ord,
      title: step.title,
      description: step.description,
      required: step.required,
      reviewer_role_id: step.reviewer_role_id,
      created_at: new Date().toISOString()
    }));

    mockStepTemplates.push(...newStepTemplates);

    const processType = mockProcessTypes.find(pt => pt.id === newTemplateProcessTypeId);
    
    toast.success(
      publish 
        ? `Plantilla "${processType?.name}" creada y publicada exitosamente`
        : `Plantilla "${processType?.name}" guardada como borrador`
    );
    
    // Reset form
    setTemplatePhase(1);
    setNewTemplateProcessTypeId(null);
    setNewTemplateDescription('');
    setTemplateSteps([]);
    setShowNewTemplateModal(false);
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const handleCloseTemplateModal = () => {
    setTemplatePhase(1);
    setNewTemplateProcessTypeId(null);
    setNewTemplateDescription('');
    setTemplateSteps([]);
    setShowNewTemplateModal(false);
  };

  const getRoleName = (id: number) => {
    return mockRoles.find(r => r.id === id)?.name || 'Desconocido';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Procesos</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los procesos institucionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNewTemplateModal(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
          <Button onClick={() => setShowNewProcessModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proceso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros de Búsqueda</CardTitle>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpiar Filtros ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* First row: Search, Year, Month, Type, State, Responsible */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar procesos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los años</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los meses</SelectItem>
                  {MONTHS.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Proceso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {mockProcessTypes.map(type => (
                    <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pendiente</SelectItem>
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                  <SelectItem value="ARCHIVED">Archivado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                <SelectTrigger>
                  <SelectValue placeholder="Responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los responsables</SelectItem>
                  {mockUsers.filter(u => u.is_active).map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Second row: Tags filter */}
            <div>
              <div className="text-sm mb-2 text-muted-foreground">Filtrar por Etiquetas:</div>
              <div className="flex flex-wrap gap-2">
                {mockTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <Badge
                      key={tag.id}
                      style={{ 
                        backgroundColor: isSelected ? tag.color : 'transparent',
                        color: isSelected ? '#fff' : tag.color,
                        borderColor: tag.color,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      className="cursor-pointer hover:opacity-80 flex items-center gap-1"
                      onClick={() => handleToggleTag(tag.id)}
                    >
                      {tag.name}
                      {isSelected && (
                        <X 
                          className="w-3 h-3" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTag(tag.id);
                          }}
                        />
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Selected tags display */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Mostrando procesos con {selectedTags.length} etiqueta(s) seleccionada(s)</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procesos ({filteredProcesses.length})</CardTitle>
          <CardDescription>
            {filteredProcesses.length === mockProcessInstances.length 
              ? 'Lista completa de procesos institucionales'
              : `${filteredProcesses.length} de ${mockProcessInstances.length} procesos mostrados`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProcesses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4" />
              <p>No se encontraron procesos con los filtros aplicados</p>
              <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Proceso</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Etiquetas</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map(process => {
                  const processType = getProcessTypeById(process.process_type_id);
                  const responsible = getUserById(process.responsible_user_id);
                  const progress = getProgressForProcess(process.id);
                  const processTags = getProcessTags(process.id);

                  return (
                    <TableRow key={process.id} className="hover:bg-accent/50">
                      <TableCell>{processType?.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {process.title || `${processType?.name} ${process.year}-${process.month}`}
                      </TableCell>
                      <TableCell>{formatDate(process.year, process.month)}</TableCell>
                      <TableCell>{responsible?.full_name}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(process.state)}>
                          {statusLabels[process.state] || process.state}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {processTags.length > 0 ? (
                            processTags.map(tag => (
                              <Badge
                                key={tag.id}
                                style={{
                                  backgroundColor: tag.color,
                                  color: '#fff'
                                }}
                                className="text-xs"
                              >
                                {tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {progress && (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={progress.progress_percent} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {progress.progress_percent}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewChange('process-detail', { processId: process.id })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Procesos ({mockProcessTemplates.length})</CardTitle>
          <CardDescription>
            Plantillas configuradas disponibles para crear procesos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProcessTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p>No hay plantillas creadas</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowNewTemplateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Plantilla
                </Button>
              </div>
            ) : (
              mockProcessTemplates.map(template => {
                const processType = mockProcessTypes.find(pt => pt.id === template.process_type_id);
                const steps = mockStepTemplates.filter(s => s.template_id === template.id).sort((a, b) => a.ord - b.ord);
                const requiredCount = steps.filter(s => s.required).length;
                
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {processType?.name || 'Tipo Desconocido'}
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
                          <span>Creada {new Date(template.created_at).toLocaleDateString()}</span>
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
              })
            )}
          </div>
        </CardContent>
      </Card>

      <ProcessTemplateSelector
        key={refreshKey}
        open={showNewProcessModal}
        onClose={() => setShowNewProcessModal(false)}
        onCreateProcess={handleCreateProcess}
      />

      {/* New Template Dialog */}
      <Dialog open={showNewTemplateModal} onOpenChange={handleCloseTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Plantilla</DialogTitle>
            <DialogDescription>
              {templatePhase === 1 
                ? 'Define el tipo de proceso y descripción de la plantilla'
                : 'Configura los pasos de la plantilla'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {templatePhase === 1 && (
              <>
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
                      {mockProcessTypes.filter(t => t.active).map(type => (
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
              </>
            )}

            {templatePhase === 2 && (
              <>
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
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTemplateModal}>
              Cancelar
            </Button>
            {templatePhase === 1 ? (
              <Button onClick={handleNextPhase}>
                Siguiente: Configurar Pasos
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setTemplatePhase(1)}>
                  Atrás
                </Button>
                <Button variant="secondary" onClick={() => handleSaveTemplate(false)}>
                  Guardar Borrador
                </Button>
                <Button onClick={() => handleSaveTemplate(true)}>
                  Guardar y Publicar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}