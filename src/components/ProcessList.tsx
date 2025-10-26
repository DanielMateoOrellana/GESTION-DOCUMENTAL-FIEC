import { useState } from 'react';
import { ProcessInstance, User } from '../types';
import { 
  mockProcessInstances, 
  mockProcessTypes,
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
import { Search, Filter, Plus, Eye } from 'lucide-react';

interface ProcessListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function ProcessList({ currentUser, onViewChange }: ProcessListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredProcesses = mockProcessInstances.filter(process => {
    const matchesSearch = process.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = filterYear === 'all' || process.year.toString() === filterYear;
    const matchesState = filterState === 'all' || process.state === filterState;
    const matchesType = filterType === 'all' || process.process_type_id.toString() === filterType;
    
    return matchesSearch && matchesYear && matchesState && matchesType;
  });

  const statusLabels: Record<string, string> = {
    'DRAFT': 'Borrador',
    'IN_PROGRESS': 'En Progreso',
    'PENDING_APPROVAL': 'Pendiente',
    'APPROVED': 'Aprobado',
    'REJECTED': 'Rechazado',
    'CLOSED': 'Cerrado'
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'CLOSED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const years = Array.from(new Set(mockProcessInstances.map(p => p.year))).sort((a, b) => b - a);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Procesos</h1>
          <p className="text-muted-foreground">
            Administra y monitorea todos los procesos institucionales
          </p>
        </div>
        <Button onClick={() => onViewChange('dashboard', { action: 'new' })}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proceso
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Procesos ({filteredProcesses.length})</CardTitle>
          <CardDescription>Lista completa de procesos institucionales</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Proceso</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Año/Mes</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map(process => {
                const processType = getProcessTypeById(process.process_type_id);
                const responsible = getUserById(process.responsible_user_id);
                const progress = getProgressForProcess(process.id);

                return (
                  <TableRow key={process.id} className="hover:bg-accent/50">
                    <TableCell>{processType?.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {process.title || `${processType?.name} ${process.year}-${process.month}`}
                    </TableCell>
                    <TableCell>{process.year} / {String(process.month).padStart(2, '0')}</TableCell>
                    <TableCell>{responsible?.full_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(process.state)}>
                        {statusLabels[process.state] || process.state}
                      </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}
