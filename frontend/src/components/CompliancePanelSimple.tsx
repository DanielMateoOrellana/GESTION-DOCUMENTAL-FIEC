import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { FileDown, Search } from 'lucide-react';
import { User } from '../types';
import { toast } from 'sonner';
import {
  fetchProcessInstances,
  type ProcessInstance,
  type EstadoProceso
} from '../api/processInstances';
import { fetchProcessTypes, type ProcessType } from '../api/processTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CompliancePanelSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function CompliancePanelSimple({ currentUser, onViewChange }: CompliancePanelSimpleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesses, setSelectedProcesses] = useState<number[]>([]);
  const [instances, setInstances] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);

  const years = Array.from(
    new Set(
      instances
        .map((p) => p.year)
        .filter((y): y is number => typeof y === "number")
    )
  ).sort((a, b) => b - a);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [data, types] = await Promise.all([
          fetchProcessInstances(),
          fetchProcessTypes(),
        ]);
        setInstances(data);
        setProcessTypes(types);
      } catch (error) {
        console.error('Error cargando procesos', error);
        toast.error('Error al cargar la información de cumplimiento');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrado
  const filteredData = instances.filter((process) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const title = process.title?.toLowerCase() || '';
    const typeName = process.processType?.name?.toLowerCase() || '';
    const responsibleName = process.responsibleUser?.fullName?.toLowerCase() || '';

    return (
      (title.includes(searchLower) ||
        typeName.includes(searchLower) ||
        responsibleName.includes(searchLower)) &&
      (filterYear === "all" || process.year?.toString() === filterYear) &&
      (filterState === "all" || process.estado === filterState) &&
      (filterType === "all" || process.processTypeId?.toString() === filterType)
    );
  });

  const handleSelectProcess = (processId: number) => {
    setSelectedProcesses(prev =>
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProcesses.length === filteredData.length) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(filteredData.map(p => p.id));
    }
  };

  const handleProcessClick = (processId: number) => {
    onViewChange('process-detail', { processId });
  };

  const getStateBadge = (state: EstadoProceso) => {
    if (state === 'COMPLETADO') {
      return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
  };

  const handleExportSelected = () => {
    if (selectedProcesses.length === 0) {
      toast.error('Seleccione al menos un proceso');
      return;
    }
    toast.success(`Exportando ${selectedProcesses.length} proceso(s)`);
  };

  // Estadísticas calculadas sobre la data real
  const totalProcesses = instances.length;
  // Se considera completado si el estado del processo es 'COMPLETADO'
  const completedProcesses = instances.filter(p => p.estado === 'COMPLETADO').length;
  const pendingProcesses = instances.filter(p => p.estado === 'PENDIENTE').length;
  const overallCompliance = totalProcesses > 0 ? Math.round((completedProcesses / totalProcesses) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Panel de cumplimiento</h1>
          <p className="text-muted-foreground">Seguimiento de cumplimiento de procesos</p>
        </div>
        <Button onClick={() => toast.success('Exportando a Excel/CSV')}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar a Excel/CSV
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{loading ? '...' : totalProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Total procesos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">{loading ? '...' : completedProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-yellow-600">{loading ? '...' : pendingProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{loading ? '...' : overallCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Cumplimiento general</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar procesos..."
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
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {processTypes.map((type) => (
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
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Botón de exportar seleccionados */}
      {selectedProcesses.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleExportSelected}>
            Exportar seleccionados ({selectedProcesses.length})
          </Button>
        </div>
      )}

      {/* Tabla de procesos */}
      <Card>
        <CardHeader>
          <CardTitle>Procesos ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProcesses.length === filteredData.length && filteredData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
                <TableHead>Año</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando datos...
                  </TableCell>
                </TableRow>
              ) : filteredData.map((process) => {
                // Calcular progreso individual
                const steps = process.steps || [];
                const completedSteps = steps.filter(s => s.estado === 'COMPLETADO').length;
                const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

                return (
                  <TableRow
                    key={process.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, input')) return;
                      handleProcessClick(process.id);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedProcesses.includes(process.id)}
                        onCheckedChange={() => handleSelectProcess(process.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {process.title || process.processType?.name || `Proceso ${process.id}`}
                    </TableCell>
                    <TableCell>{process.processType?.name || '-'}</TableCell>
                    <TableCell>{process.responsibleUser?.fullName || '—'}</TableCell>
                    <TableCell>{getStateBadge(process.estado)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{process.year || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!loading && filteredData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay procesos para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
