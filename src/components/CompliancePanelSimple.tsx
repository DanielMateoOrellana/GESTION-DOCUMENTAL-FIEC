import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { FileDown, Search } from 'lucide-react';
import { User } from '../types';
import { mockProcessInstances, getProcessTypeById, getUserById, getProgressForProcess, getStepsForProcess } from '../data/mockData';
import { toast } from 'sonner@2.0.3';

interface CompliancePanelSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function CompliancePanelSimple({ currentUser, onViewChange }: CompliancePanelSimpleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcesses, setSelectedProcesses] = useState<number[]>([]);

  // Crear datos de cumplimiento
  const complianceData = mockProcessInstances.map(process => {
    const processType = getProcessTypeById(process.process_type_id);
    const responsible = getUserById(process.responsible_user_id);
    const progress = getProgressForProcess(process.id);
    
    return {
      process,
      processType,
      responsible,
      progress: progress?.progress_percent || 0
    };
  });

  const filteredData = complianceData.filter(({ process, processType, responsible }) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      process.title?.toLowerCase().includes(searchLower) ||
      processType?.name.toLowerCase().includes(searchLower) ||
      responsible?.full_name.toLowerCase().includes(searchLower)
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
      setSelectedProcesses(filteredData.map(d => d.process.id));
    }
  };

  const handleProcessClick = (processId: number) => {
    onViewChange('process-detail', { processId });
  };

  const getStateBadge = (state: string) => {
    const simpleState = state === 'APPROVED' || state === 'CLOSED' ? 'Completado' : 'Pendiente';
    const color = simpleState === 'Completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    return <Badge className={color}>{simpleState}</Badge>;
  };

  const handleExportSelected = () => {
    if (selectedProcesses.length === 0) {
      toast.error('Seleccione al menos un proceso');
      return;
    }
    toast.success(`Exportando ${selectedProcesses.length} proceso(s)`);
  };

  const totalProcesses = mockProcessInstances.length;
  const completedProcesses = mockProcessInstances.filter(p => p.state === 'APPROVED' || p.state === 'CLOSED').length;
  const pendingProcesses = totalProcesses - completedProcesses;
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
            <div className="text-2xl">{totalProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Total procesos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-green-600">{completedProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl text-yellow-600">{pendingProcesses}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl">{overallCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Cumplimiento general</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar procesos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
              {filteredData.map(({ process, processType, responsible, progress }) => (
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
                  <TableCell>{process.title || processType?.name}</TableCell>
                  <TableCell>{processType?.name}</TableCell>
                  <TableCell>{responsible?.full_name}</TableCell>
                  <TableCell>{getStateBadge(process.state)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{process.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay procesos para mostrar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
