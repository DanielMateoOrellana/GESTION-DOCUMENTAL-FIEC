import { useState } from 'react';
import { ProcessInstance, User } from '../types';
import { 
  mockProcessInstances, 
  mockProcessTypes,
  mockUsers,
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
import { Search, Filter, Plus, Eye, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProcessListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Procesos</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los procesos institucionales
          </p>
        </div>
        <Button onClick={() => setShowNewProcessModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proceso
        </Button>
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

      <ProcessTemplateSelector
        open={showNewProcessModal}
        onClose={() => setShowNewProcessModal(false)}
        onCreateProcess={handleCreateProcess}
      />
    </div>
  );
}