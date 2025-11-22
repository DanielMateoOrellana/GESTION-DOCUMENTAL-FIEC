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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Search, Plus, Eye, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CreateProcessModal } from './CreateProcessModal';

interface ProcessListSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

// Mock tags (las que ya existen)
const mockTags = [
  { id: 1, name: 'Urgente', color: '#EF4444' },
  { id: 2, name: 'Prioritario', color: '#F59E0B' },
  { id: 3, name: 'Revisado', color: '#10B981' },
];

export function ProcessListSimple({ currentUser, onViewChange }: ProcessListSimpleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [processTags, setProcessTags] = useState<Record<number, number[]>>({});
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [isCreateProcessModalOpen, setIsCreateProcessModalOpen] = useState(false);
  const [allTags, setAllTags] = useState(mockTags);
  const [newTagName, setNewTagName] = useState('');

  const filteredProcesses = mockProcessInstances.filter(process => {
    const matchesSearch = process.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || process.year.toString() === filterYear;
    const matchesState = filterState === 'all' || process.state === filterState;
    const matchesType = filterType === 'all' || process.process_type_id.toString() === filterType;
    
    return matchesSearch && matchesYear && matchesState && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredProcesses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProcesses.map(p => p.id));
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error('Seleccione al menos un proceso');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} proceso(s)`);
  };

  const toggleTag = (processId: number, tagId: number) => {
    const current = processTags[processId] || [];
    if (current.includes(tagId)) {
      setProcessTags({
        ...processTags,
        [processId]: current.filter(t => t !== tagId)
      });
    } else {
      setProcessTags({
        ...processTags,
        [processId]: [...current, tagId]
      });
    }
  };

  const handleCreateTag = (processId: number) => {
    if (!newTagName.trim()) {
      toast.error('Escriba un nombre para la etiqueta');
      return;
    }

    // Verificar si ya existe una etiqueta con ese nombre
    const existingTag = allTags.find(t => t.name.toLowerCase() === newTagName.trim().toLowerCase());
    
    if (existingTag) {
      // Si existe, simplemente agregarla al proceso
      toggleTag(processId, existingTag.id);
      setNewTagName('');
      toast.info('Etiqueta existente agregada');
    } else {
      // Crear nueva etiqueta con color aleatorio
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newTag = {
        id: allTags.length + 1,
        name: newTagName.trim(),
        color: randomColor
      };
      
      setAllTags([...allTags, newTag]);
      setProcessTags({
        ...processTags,
        [processId]: [...(processTags[processId] || []), newTag.id]
      });
      setNewTagName('');
      toast.success(`Etiqueta "${newTag.name}" creada`);
    }
  };

  const getSimplifiedState = (state: string) => {
    if (state === 'APPROVED' || state === 'CLOSED') {
      return { label: 'Completado', color: 'bg-green-100 text-green-800' };
    }
    return { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Procesos</h1>
          <p className="text-muted-foreground">Gestión de procesos institucionales</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              Exportar seleccionados ({selectedItems.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateProcessModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo proceso
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proceso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {mockProcessTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Procesos */}
      <Card>
        <CardHeader>
          <CardTitle>Procesos ({filteredProcesses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === filteredProcesses.length && filteredProcesses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Etiquetas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map(process => {
                const processType = getProcessTypeById(process.process_type_id);
                const responsible = getUserById(process.responsible_user_id);
                const state = getSimplifiedState(process.state);
                const tags = processTags[process.id] || [];

                return (
                  <TableRow key={process.id}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(process.id)}
                        onCheckedChange={() => handleSelectItem(process.id)}
                      />
                    </TableCell>
                    <TableCell>{processType?.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {process.title || `${processType?.name} ${process.year}`}
                    </TableCell>
                    <TableCell>{process.year}</TableCell>
                    <TableCell>{responsible?.full_name}</TableCell>
                    <TableCell>
                      <Badge className={state.color}>{state.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {editingTags === process.id ? (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {allTags.map(tag => (
                              <Badge
                                key={tag.id}
                                style={{
                                  backgroundColor: tags.includes(tag.id) ? tag.color : '#e5e7eb',
                                  color: tags.includes(tag.id) ? '#fff' : '#6b7280',
                                  cursor: 'pointer'
                                }}
                                onClick={() => toggleTag(process.id, tag.id)}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Input
                              placeholder="Nueva etiqueta..."
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateTag(process.id);
                                }
                              }}
                              className="h-7 text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateTag(process.id)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTags(null);
                                setNewTagName('');
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex flex-wrap gap-1 cursor-pointer"
                          onClick={() => setEditingTags(process.id)}
                        >
                          {tags.length > 0 ? (
                            tags.map(tagId => {
                              const tag = allTags.find(t => t.id === tagId);
                              return tag ? (
                                <Badge
                                  key={tag.id}
                                  style={{ backgroundColor: tag.color, color: '#fff' }}
                                >
                                  {tag.name}
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">+ Agregar</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewChange('process-detail', { processId: process.id })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProcesses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron procesos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear un nuevo proceso */}
      <CreateProcessModal
        open={isCreateProcessModalOpen}
        onClose={() => setIsCreateProcessModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}