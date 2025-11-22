import { useState } from 'react';
import { User, ProcessInstance } from '../types';
import { 
  mockProcessInstances, 
  mockProcessTypes, 
  mockUsers, 
  mockStepInstances,
  getProcessTypeById,
  getUserById
} from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { 
  Clock, 
  Search, 
  FileText,
  Calendar,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

interface TaskItem {
  id: string;
  type: 'process' | 'step';
  processId: number;
  stepId?: number;
  title: string;
  processTitle: string;
  processType: string;
  responsible: string;
  dueDate: Date;
  status: string;
  overdue: boolean;
}

export function Dashboard({ currentUser, onViewChange }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Crear lista de tareas desde procesos y pasos con fechas límite
  const createTaskList = (): TaskItem[] => {
    const tasks: TaskItem[] = [];
    const now = new Date();

    mockProcessInstances.forEach(process => {
      // Solo mostrar procesos activos (no completados/cerrados)
      if (process.state === 'CLOSED' || process.state === 'APPROVED') return;

      const processType = getProcessTypeById(process.process_type_id);
      const responsible = getUserById(process.responsible_user_id);

      // Agregar tarea de proceso si tiene fecha límite
      if (process.due_at) {
        const dueDate = new Date(process.due_at);
        tasks.push({
          id: `process-${process.id}`,
          type: 'process',
          processId: process.id,
          title: process.title || processType?.name || 'Sin título',
          processTitle: process.title || processType?.name || 'Sin título',
          processType: processType?.name || 'Sin tipo',
          responsible: responsible?.full_name || 'Sin asignar',
          dueDate,
          status: process.state,
          overdue: dueDate < now
        });
      }

      // Agregar tareas de pasos si tienen fecha límite
      const steps = mockStepInstances.filter(s => s.process_instance_id === process.id);
      steps.forEach(step => {
        if (step.due_at && step.status !== 'APPROVED' && step.status !== 'CARGADO') {
          const dueDate = new Date(step.due_at);
          tasks.push({
            id: `step-${step.id}`,
            type: 'step',
            processId: process.id,
            stepId: step.id,
            title: `${step.title} - ${process.title || processType?.name}`,
            processTitle: process.title || processType?.name || 'Sin título',
            processType: processType?.name || 'Sin tipo',
            responsible: responsible?.full_name || 'Sin asignar',
            dueDate,
            status: step.status,
            overdue: dueDate < now
          });
        }
      });
    });

    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  const allTasks = createTaskList();

  // Filtrar tareas
  const filteredTasks = allTasks.filter(task => {
    // Búsqueda de texto
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro de año
    const process = mockProcessInstances.find(p => p.id === task.processId);
    if (yearFilter !== 'all' && process?.year.toString() !== yearFilter) {
      return false;
    }

    // Filtro de tipo de proceso
    if (typeFilter !== 'all' && task.processType !== typeFilter) {
      return false;
    }

    // Filtro de estado
    const simpleStatus = task.status === 'APPROVED' || task.status === 'CLOSED' ? 'Completado' : 'Pendiente';
    if (statusFilter !== 'all' && simpleStatus !== statusFilter) {
      return false;
    }

    // Filtro de responsable
    if (responsibleFilter !== 'all' && task.responsible !== responsibleFilter) {
      return false;
    }

    return true;
  });

  // Agrupar tareas por proximidad temporal
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

  const groupedTasks = {
    overdue: filteredTasks.filter(t => t.overdue),
    today: filteredTasks.filter(t => !t.overdue && t.dueDate >= today && t.dueDate < tomorrow),
    tomorrow: filteredTasks.filter(t => t.dueDate >= tomorrow && t.dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)),
    thisWeek: filteredTasks.filter(t => {
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
      return t.dueDate >= tomorrowEnd && t.dueDate < thisWeekEnd;
    }),
    later: filteredTasks.filter(t => t.dueDate >= thisWeekEnd)
  };

  const handleSelectTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(t => t.id));
    }
  };

  const handleTaskClick = (task: TaskItem) => {
    onViewChange('process-detail', { processId: task.processId });
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const simpleStatus = status === 'APPROVED' || status === 'CLOSED' ? 'Completado' : 'Pendiente';
    const color = simpleStatus === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    return <Badge className={color}>{simpleStatus}</Badge>;
  };

  const renderTaskGroup = (title: string, tasks: TaskItem[], icon: React.ReactNode, colorClass: string) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className={colorClass}>{title} ({tasks.length})</h3>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={tasks.every(t => selectedTasks.includes(t.id))}
                    onCheckedChange={() => {
                      const taskIds = tasks.map(t => t.id);
                      if (tasks.every(t => selectedTasks.includes(t.id))) {
                        setSelectedTasks(prev => prev.filter(id => !taskIds.includes(id)));
                      } else {
                        setSelectedTasks(prev => [...new Set([...prev, ...taskIds])]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Tarea</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TableRow 
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, input')) return;
                    handleTaskClick(task);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={() => handleSelectTask(task.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div>{task.title}</div>
                        {task.type === 'step' && (
                          <div className="text-xs text-muted-foreground">Paso de proceso</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{task.processType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      {task.responsible}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {formatDueDate(task.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const years = ['all', ...Array.from(new Set(mockProcessInstances.map(p => p.year)))];
  const types = ['all', ...Array.from(new Set(mockProcessTypes.map(t => t.name)))];
  const responsibles = ['all', ...Array.from(new Set(mockUsers.map(u => u.full_name)))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tablero de Tareas</h1>
          <p className="text-muted-foreground">
            Vista general de procesos y pasos próximos a vencer
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {years.filter(y => y !== 'all').map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {types.filter(t => t !== 'all').map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {responsibles.filter(r => r !== 'all').map(resp => (
                  <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Acciones masivas */}
      {selectedTasks.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{selectedTasks.length} tarea(s) seleccionada(s)</span>
              <Button variant="outline" size="sm">
                Marcar como completadas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grupos de tareas */}
      <div>
        {renderTaskGroup(
          'Vencidas',
          groupedTasks.overdue,
          <AlertCircle className="w-5 h-5 text-red-600" />,
          'text-red-600'
        )}
        
        {renderTaskGroup(
          'Hoy',
          groupedTasks.today,
          <Clock className="w-5 h-5 text-orange-600" />,
          'text-orange-600'
        )}
        
        {renderTaskGroup(
          'Mañana',
          groupedTasks.tomorrow,
          <Calendar className="w-5 h-5 text-yellow-600" />,
          'text-yellow-600'
        )}
        
        {renderTaskGroup(
          'Esta semana',
          groupedTasks.thisWeek,
          <Calendar className="w-5 h-5 text-blue-600" />,
          'text-blue-600'
        )}
        
        {renderTaskGroup(
          'Próximos días',
          groupedTasks.later,
          <Calendar className="w-5 h-5 text-gray-600" />,
          'text-gray-600'
        )}

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay tareas pendientes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
