import { useState, useEffect } from 'react';
// import { ProcessInstance, User, ProcessType, ProcessTemplate, StepTemplate } from '../types'; // OLD TYPES
import { 
  fetchProcessInstances, 
  createProcessInstance,
  ProcessInstance 
} from '../api/processInstances';
import { 
  fetchProcessTypes, 
  ProcessType 
} from '../api/processTypes';
import { 
  fetchProcessTemplates, 
  ProcessTemplate 
} from '../api/processTemplates';
import { AuthUser } from '../api/auth';
import { User as UserType } from '../types'; // Keep for prop type compatibility if needed, but ideally switch to AuthUser
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { ProcessTemplateSelector } from './ProcessTemplateSelector';
import { Search, Filter, Plus, Eye, X, FileText, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { createProcessType } from '../api/processTypes';
import { createProcessTemplate } from '../api/processTemplates';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const AVAILABLE_ROLES = ["PROFESOR", "SECRETARIA", "DECANO", "GESTOR", "ADMIN"];

// removed mockRoles

interface ProcessListProps {
  currentUser: AuthUser;
  onViewChange: (view: string, data?: any) => void;
}

interface TemplateStep {
  id: string;
  order: number;
  name: string;
  description: string;
  isMandatory: boolean;
  responsibleRole: string;
}

// Mock tags for filtering (Still mock for now as backend doesn't seem to have tags yet)
// Tags feature temporarily disabled until backend implementation
const availableTags: {id: number, name: string, color: string}[] = [];

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
  // Data State
  const [processes, setProcesses] = useState<ProcessInstance[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterResponsible, setFilterResponsible] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showNewProcessTypeModal, setShowNewProcessTypeModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // To force re-render
  
  // New Filters for separate tabs
  const [typeSearch, setTypeSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateTypeFilter, setTemplateTypeFilter] = useState('all');
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [procData, typesData, templData] = await Promise.all([
          fetchProcessInstances(),
          fetchProcessTypes(),
          fetchProcessTemplates()
        ]);
        setProcesses(procData);
        setProcessTypes(typesData);
        setTemplates(templData);
      } catch (error) {
        toast.error('Error al cargar datos');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);
  
  // New Process Type Form
  const [newProcessTypeName, setNewProcessTypeName] = useState('');
  const [newProcessTypeCode, setNewProcessTypeCode] = useState('');
  const [newProcessTypeDescription, setNewProcessTypeDescription] = useState('');
  
  // New Template Form - Phase 1: Basic Info
  const [templatePhase, setTemplatePhase] = useState<1 | 2>(1);
  const [newTemplateProcessTypeId, setNewTemplateProcessTypeId] = useState<number | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [templateSteps, setTemplateSteps] = useState<TemplateStep[]>([]);

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const yearStr = process.year ? process.year.toString() : '';
    const matchesYear = filterYear === 'all' || yearStr === filterYear;
    
    const monthStr = process.month ? process.month.toString() : '';
    const matchesMonth = filterMonth === 'all' || monthStr === filterMonth;
    
    // Mapping state: Backend uses PENDIENTE/COMPLETADO. Frontend filters might need adjustment.
    // For now, simple check.
    const matchesState = filterState === 'all' || process.estado === filterState;
    
    const matchesType = filterType === 'all' || process.processTypeId.toString() === filterType;
    
    const matchesResponsible = filterResponsible === 'all' || (process.responsibleUserId && process.responsibleUserId.toString() === filterResponsible);
    
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

  const years = Array.from(new Set(processes.map(p => p.year).filter(y => y !== null) as number[])).sort((a, b) => b - a);

  const handleCreateProcess = async (processTypeId: number, templateId: number) => {
    try {
      const processType = processTypes.find(pt => pt.id === processTypeId);
      const template = templates.find(t => t.id === templateId);
      
      const title = `${processType?.name || 'Proceso'} - ${template?.name || 'Nuevo'}`;
      
      await createProcessInstance({
        processTypeId,
        templateId,
        title,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      });

      setRefreshKey((prev: number) => prev + 1);
      toast.success("Proceso creado exitosamente");
      setShowNewProcessModal(false);
    } catch (error) {
      console.error('Error creating process:', error);
      toast.error("Error al crear el proceso");
    }
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
  // Helper function to get tags for a process (mock data removed)
  const getProcessTags = (processId: number): { id: number; name: string; color: string }[] => {
    return [];
  };

  const handleAddStep = () => {
    const newStep: TemplateStep = {
      id: `temp-${Date.now()}`,
      order: templateSteps.length + 1,
      name: '',
      description: '',
      isMandatory: true,
      responsibleRole: 'PROFESOR'
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
    setTemplateSteps(filtered.map((step, idx) => ({ ...step, order: idx + 1 })));
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const index = templateSteps.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === templateSteps.length - 1) return;

    const newSteps = [...templateSteps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update order
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });
    
    setTemplateSteps(newSteps);
  };

  const handleNextPhase = () => {
    if (!newTemplateProcessTypeId || !newTemplateName || !newTemplateDescription) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }
    setTemplatePhase(2);
  };

  const handleSaveTemplate = async (publish: boolean = false) => {
    if (!newTemplateName) {
        toast.error('La plantilla debe tener un nombre');
        return;
    }
    if (templateSteps.length === 0) {
      toast.error('La plantilla debe tener al menos un paso');
      return;
    }

    // Validate all steps have name and description
    const invalidSteps = templateSteps.filter(step => !step.name || !step.description);
    if (invalidSteps.length > 0) {
      toast.error('Todos los pasos deben tener título y descripción');
      return;
    }

    // Validate at least one mandatory step when publishing
    if (publish) {
      const hasMandatoryStep = templateSteps.some(step => step.isMandatory);
      if (!hasMandatoryStep) {
        toast.error('Debe haber al menos un paso obligatorio para publicar');
        return;
      }
    }

    try {
      await createProcessTemplate({
        name: newTemplateName,
        processTypeId: newTemplateProcessTypeId!,
        description: newTemplateDescription,
        isActive: publish,
        steps: templateSteps.map(s => ({
          name: s.name,
          order: s.order,
          description: s.description,
          responsibleRole: s.responsibleRole,
          isMandatory: s.isMandatory
        }))
      });

      const processType = processTypes.find(pt => pt.id === newTemplateProcessTypeId);
      
      toast.success(
        publish 
          ? `Plantilla para "${processType?.name}" creada y activada exitosamente`
          : `Plantilla para "${processType?.name}" guardada exitosamente`
      );
      
      // Reset form
      setTemplatePhase(1);
      setNewTemplateProcessTypeId(null);
      setNewTemplateName('');
      setNewTemplateDescription('');
      setTemplateSteps([]);
      setShowNewTemplateModal(false);
      setRefreshKey((prev: number) => prev + 1);

    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Error al crear la plantilla');
    }
  };

  const handleCloseTemplateModal = () => {
    setTemplatePhase(1);
    setNewTemplateProcessTypeId(null);
    setNewTemplateName('');
    setNewTemplateDescription('');
    setTemplateSteps([]);
    setShowNewTemplateModal(false);
  };




  const filteredProcessTypes = processTypes.filter(type => 
    type.name.toLowerCase().includes(typeSearch.toLowerCase()) ||
    type.description.toLowerCase().includes(typeSearch.toLowerCase())
  );

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(templateSearch.toLowerCase()) || 
                         template.description.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesType = templateTypeFilter === 'all' || template.processTypeId.toString() === templateTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateProcessType = async () => {
    if (!newProcessTypeName || !newProcessTypeCode || !newProcessTypeDescription) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    try {
      await createProcessType({
        name: newProcessTypeName,
        description: newProcessTypeDescription,
        categoryId: 1, // Default category for now
        isActive: true
      });

      toast.success(`Tipo de proceso "${newProcessTypeName}" creado exitosamente`);
      
      // Reset form
      setNewProcessTypeName('');
      setNewProcessTypeCode('');
      setNewProcessTypeDescription('');
      setShowNewProcessTypeModal(false);
      setRefreshKey((prev: number) => prev + 1); // Force re-render

    } catch (error) {
      console.error('Failed to create process type:', error);
      toast.error('Error al crear el tipo de proceso');
    }
  };

  const handleCloseProcessTypeModal = () => {
    setNewProcessTypeName('');
    setNewProcessTypeCode('');
    setNewProcessTypeDescription('');
    setShowNewProcessTypeModal(false);
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
          <Button variant="outline" onClick={() => setShowNewProcessTypeModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tipo de Proceso
          </Button>
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


            <Tabs defaultValue="processes" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="processes">Mis Procesos</TabsTrigger>
          <TabsTrigger value="types">Tipos de Proceso</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="processes">
          {/* Filters for Processes */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar proceso..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterMonth} onValueChange={setFilterMonth}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {MONTHS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {Object.keys(statusLabels).map(key => (
                        <SelectItem key={key} value={key}>{statusLabels[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de Proceso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {processTypes.filter(t => t.isActive).map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Array.from(new Set(processes.map(p => p.responsibleUser).filter(u => u != null))).map(user => (
                        <SelectItem key={user!.id} value={user!.id.toString()}>{user!.fullName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" onClick={handleClearFilters} title="Limpiar filtros">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processes Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredProcesses.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                   <p>No se encontraron procesos</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Plantilla</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Progreso</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProcesses.map((process) => {
                      const completedSteps = process.steps?.filter(s => s.estado === 'COMPLETADO').length || 0;
                      const totalSteps = process.steps?.length || 0;
                      const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                      const processTags = getProcessTags(process.id);
                      const responsible = process.responsibleUser; // Now using included relation

                      return (
                        <TableRow key={process.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{process.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(process.year || 0, process.month || 0)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{process.processType?.name || 'Unknown'}</TableCell>
                          <TableCell>{process.template?.name || 'Custom'}</TableCell>
                          <TableCell>{new Date(process.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{responsible?.fullName || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(process.estado)}>
                              {statusLabels[process.estado] || process.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">—</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <Progress value={progressPercent} className="h-2 flex-1" />
                              <span className="text-xs text-muted-foreground w-10 text-right">
                                {progressPercent}%
                              </span>
                            </div>
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
        </TabsContent>

        <TabsContent value="types">
          <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tipo de proceso..."
                            className="pl-8"
                            value={typeSearch}
                            onChange={(e) => setTypeSearch(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Procesos ({filteredProcessTypes.length})</CardTitle>
              <CardDescription>Catálogo de tipos de procesos definidos</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Estadísticas</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProcessTypes.map(type => {
                        const templatesCount = templates.filter(t => t.processTypeId === type.id).length;
                        const processesCount = processes.filter(p => p.processTypeId === type.id).length;
                        return (
                            <TableRow key={type.id}>
                                <TableCell>#{type.id}</TableCell>
                                <TableCell className="font-medium">{type.name}</TableCell>
                                <TableCell>{type.description}</TableCell>
                                <TableCell>
                                    <Badge variant={type.isActive ? 'default' : 'secondary'}>
                                        {type.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{templatesCount} plantillas</span>
                                        <span>{processesCount} procesos</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    {filteredProcessTypes.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                No se encontraron tipos de proceso
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar plantilla..."
                            className="pl-8"
                            value={templateSearch}
                            onChange={(e) => setTemplateSearch(e.target.value)}
                        />
                    </div>
                    {/* Backend Data Filter: Process Types */}
                    <Select value={templateTypeFilter} onValueChange={setTemplateTypeFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filtrar por Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Tipos</SelectItem>
                             {processTypes.map(type => (
                                <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                              ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plantillas de Procesos ({filteredTemplates.length})</CardTitle>
                  <CardDescription>Plantillas configuradas para crear procesos</CardDescription>
                </div>
                <Button onClick={() => setShowNewTemplateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo de Proceso</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Pasos</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTemplates.map(template => {
                         const processType = template.processType || processTypes.find(pt => pt.id === template.processTypeId);
                         const steps = template.steps || [];
                         const requiredCount = steps.filter(s => s.isMandatory).length;

                        return (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">{template.name || 'Sin nombre'}</TableCell>
                                <TableCell>{processType?.name || 'Desconocido'}</TableCell>
                                <TableCell className="max-w-[300px] truncate" title={template.description}>{template.description}</TableCell>
                                <TableCell>
                                     <Badge variant={template.isActive ? "default" : "secondary"}>
                                        {template.isActive ? 'Activa' : 'Inactiva'}
                                      </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {steps.length} pasos ({requiredCount} obligatorios)
                                    </div>
                                </TableCell>
                                <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        )
                    })}
                     {filteredTemplates.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                No se encontraron plantillas.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                      {processTypes.filter(t => t.isActive).map(type => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="template-name">Nombre de la Plantilla *</Label>
                  <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Ej. Solicitud de Vacaciones 2024"
                  />
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
                        <Badge>{step.order}</Badge>
                        <Input
                          placeholder="Título del paso *"
                          value={step.name}
                          onChange={(e) => handleUpdateStep(step.id, 'name', e.target.value)}
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
                            checked={step.isMandatory}
                            onCheckedChange={(checked) => handleUpdateStep(step.id, 'isMandatory', checked)}
                          />
                          <Label className="text-sm">Obligatorio</Label>
                        </div>

                        <div className="flex-1">
                            <Select
                              value={step.responsibleRole}
                              onValueChange={(value) => handleUpdateStep(step.id, 'responsibleRole', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_ROLES.map(role => (
                                  <SelectItem key={role} value={role}>
                                    Revisor: {role}
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

      {/* New Process Type Dialog */}
      <Dialog open={showNewProcessTypeModal} onOpenChange={handleCloseProcessTypeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Tipo de Proceso</DialogTitle>
            <DialogDescription>
              Define los detalles del nuevo tipo de proceso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="process-type-name">Nombre del Tipo de Proceso *</Label>
              <Input
                id="process-type-name"
                value={newProcessTypeName}
                onChange={(e) => setNewProcessTypeName(e.target.value)}
                placeholder="Nombre del tipo de proceso..."
              />
            </div>

            <div>
              <Label htmlFor="process-type-code">Código del Tipo de Proceso *</Label>
              <Input
                id="process-type-code"
                value={newProcessTypeCode}
                onChange={(e) => setNewProcessTypeCode(e.target.value)}
                placeholder="Código del tipo de proceso..."
              />
            </div>

            <div>
              <Label htmlFor="process-type-description">Descripción del Tipo de Proceso *</Label>
              <Textarea
                id="process-type-description"
                value={newProcessTypeDescription}
                onChange={(e) => setNewProcessTypeDescription(e.target.value)}
                placeholder="Describe este tipo de proceso..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseProcessTypeModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProcessType}>
              Crear Tipo de Proceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}