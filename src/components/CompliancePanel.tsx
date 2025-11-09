import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ProcessInstance, User, ProcessType } from '../types';
import { 
  mockProcessInstances, 
  mockProcessTypes, 
  mockUsers, 
  mockStepInstances,
  mockRoles,
  getProgressForProcess,
  getUserById,
  getProcessTypeById
} from '../data/mockData';
import { AlertCircle, CheckCircle, TrendingUp, Filter, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CompliancePanelProps {
  currentUser: User;
  onViewChange?: (view: string, data?: any) => void;
}

interface FilterState {
  processTypeId: number | null;
  year: number | null;
  month: number | null;
  responsibleUserId: number | null;
  roleId: number | null;
}

const MONTHS = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
];

const YEARS = [2023, 2024, 2025, 2026];

export function CompliancePanel({ currentUser, onViewChange }: CompliancePanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    processTypeId: null,
    year: null,
    month: null,
    responsibleUserId: null,
    roleId: null
  });
  const [showFilters, setShowFilters] = useState(false);

  // Calculate compliance data
  const complianceData = useMemo(() => {
    let instances = mockProcessInstances.filter(p => !p.archived);

    // Apply filters
    if (filters.processTypeId) {
      instances = instances.filter(p => p.process_type_id === filters.processTypeId);
    }
    if (filters.year) {
      instances = instances.filter(p => p.year === filters.year);
    }
    if (filters.month) {
      instances = instances.filter(p => p.month === filters.month);
    }
    if (filters.responsibleUserId) {
      instances = instances.filter(p => p.responsible_user_id === filters.responsibleUserId);
    }

    return instances.map(instance => {
      const progress = getProgressForProcess(instance.id);
      const steps = mockStepInstances.filter(s => s.process_instance_id === instance.id);
      const requiredSteps = steps.filter(s => {
        // Check if step is required from template
        return true; // In a real system, we'd check the template
      });
      const approvedSteps = steps.filter(s => s.status === 'APPROVED');
      const pendingSteps = steps.filter(s => s.status === 'PENDING');
      const processType = getProcessTypeById(instance.process_type_id);
      const responsible = getUserById(instance.responsible_user_id);

      return {
        instance,
        progress: progress?.progress_percent || 0,
        totalSteps: steps.length,
        approvedSteps: approvedSteps.length,
        pendingSteps: pendingSteps.length,
        processType,
        responsible,
        hasPendingItems: pendingSteps.length > 0
      };
    });
  }, [filters]);

  // Instances with pending items
  const instancesWithPending = useMemo(() => {
    return complianceData
      .filter(d => d.hasPendingItems && d.instance.state !== 'CLOSED')
      .sort((a, b) => {
        // Sort by progress ascending (lowest first) and due date
        if (a.progress !== b.progress) {
          return a.progress - b.progress;
        }
        // Then by due date
        const aDate = a.instance.due_at ? new Date(a.instance.due_at).getTime() : Infinity;
        const bDate = b.instance.due_at ? new Date(b.instance.due_at).getTime() : Infinity;
        return aDate - bDate;
      });
  }, [complianceData]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = complianceData.length;
    const completed = complianceData.filter(d => d.progress === 100).length;
    const inProgress = complianceData.filter(d => d.progress > 0 && d.progress < 100).length;
    const notStarted = complianceData.filter(d => d.progress === 0).length;
    const avgProgress = total > 0
      ? Math.round(complianceData.reduce((sum, d) => sum + d.progress, 0) / total)
      : 0;

    return { total, completed, inProgress, notStarted, avgProgress };
  }, [complianceData]);

  const handleExport = () => {
    toast.success('Exportando listado a CSV...');
    // In a real system, this would generate and download a CSV file
  };

  const handleClearFilters = () => {
    setFilters({
      processTypeId: null,
      year: null,
      month: null,
      responsibleUserId: null,
      roleId: null
    });
  };

  const getMonthName = (month: number) => {
    return MONTHS.find(m => m.value === month)?.label || '';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Panel de Cumplimiento</h1>
          <p className="text-muted-foreground">
            Monitoreo de avances y evidencias faltantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
            <CardDescription>
              Aplique filtros para refinar los resultados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label>Tipo de Proceso</Label>
                <Select
                  value={filters.processTypeId?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, processTypeId: value === 'all' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {mockProcessTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Año</Label>
                <Select
                  value={filters.year?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, year: value === 'all' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {YEARS.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mes</Label>
                <Select
                  value={filters.month?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, month: value === 'all' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {MONTHS.map(month => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Responsable</Label>
                <Select
                  value={filters.responsibleUserId?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, responsibleUserId: value === 'all' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Rol</Label>
                <Select
                  value={filters.roleId?.toString() || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, roleId: value === 'all' ? null : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {mockRoles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Procesos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-2xl">{stats.completed}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div className="text-2xl">{stats.inProgress}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sin Iniciar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div className="text-2xl">{stats.notStarted}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progreso Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.avgProgress}%</div>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Missing Items Panel (AED-004) */}
      <Card>
        <CardHeader>
          <CardTitle>Panel de Faltantes</CardTitle>
          <CardDescription>
            Instancias con pasos pendientes ordenadas por prioridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instancesWithPending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <p>No hay procesos con pasos pendientes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proceso</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Fecha Límite</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instancesWithPending.map(({ instance, progress, totalSteps, pendingSteps, processType, responsible }) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <div>
                        <div>{instance.title || `Proceso #${instance.id}`}</div>
                        {instance.state && (
                          <Badge variant="outline" className="mt-1">
                            {instance.state}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{processType?.name}</TableCell>
                    <TableCell>
                      {getMonthName(instance.month)} {instance.year}
                    </TableCell>
                    <TableCell>{responsible?.full_name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="flex-1" />
                          <span className="text-sm">{progress}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {pendingSteps} de {totalSteps}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(instance.due_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewChange && onViewChange('process-detail', { processId: instance.id })}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Processes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los Procesos</CardTitle>
          <CardDescription>
            Vista completa de procesos con porcentaje de cumplimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Proceso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map(({ instance, progress, totalSteps, approvedSteps, processType, responsible }) => (
                <TableRow key={instance.id}>
                  <TableCell>{instance.id}</TableCell>
                  <TableCell>{instance.title || `Proceso #${instance.id}`}</TableCell>
                  <TableCell>{processType?.name}</TableCell>
                  <TableCell>
                    {getMonthName(instance.month)} {instance.year}
                  </TableCell>
                  <TableCell>{responsible?.full_name}</TableCell>
                  <TableCell>
                    <div className="space-y-1 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-sm">{progress}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {approvedSteps} de {totalSteps} aprobados
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        instance.state === 'CLOSED' ? 'default' :
                        instance.state === 'APPROVED' ? 'default' :
                        instance.state === 'IN_PROGRESS' ? 'secondary' :
                        'outline'
                      }
                    >
                      {instance.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewChange && onViewChange('process-detail', { processId: instance.id })}
                    >
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
