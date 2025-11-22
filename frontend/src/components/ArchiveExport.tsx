import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArchiveOperation, ProcessInstance, User, ExportLog } from '../types';
import { mockProcessInstances, getUserById } from '../data/mockData';
import { Archive, Download, FileArchive, Lock, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ArchiveExportProps {
  currentUser: User;
}

const mockArchiveOperations: ArchiveOperation[] = [
  {
    id: 1,
    user_id: 1,
    date_from: '2024-01-01',
    date_to: '2024-12-31',
    total_processes: 15,
    status: 'COMPLETED',
    created_at: '2025-01-15T10:00:00Z',
    completed_at: '2025-01-15T10:05:00Z'
  }
];

const mockExportLogs: ExportLog[] = [
  {
    id: 1,
    user_id: 1,
    file_url: '/exports/procesos_2025_q3.zip',
    size_bytes: 52428800, // 50 MB
    created_at: '2025-10-01T14:30:00Z',
    filters: 'year=2025, quarter=3',
    export_type: 'ZIP'
  },
  {
    id: 2,
    user_id: 2,
    file_url: '/exports/auditoria_septiembre.pdf',
    size_bytes: 2097152, // 2 MB
    created_at: '2025-10-05T09:15:00Z',
    filters: 'month=9, year=2025',
    export_type: 'PDF'
  }
];

export function ArchiveExport({ currentUser }: ArchiveExportProps) {
  const [archiveOperations, setArchiveOperations] = useState<ArchiveOperation[]>(mockArchiveOperations);
  const [exportLogs, setExportLogs] = useState<ExportLog[]>(mockExportLogs);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Archive form
  const [archiveDateFrom, setArchiveDateFrom] = useState('');
  const [archiveDateTo, setArchiveDateTo] = useState('');
  const [archiveProgress, setArchiveProgress] = useState(0);
  const [archiving, setArchivingState] = useState(false);
  
  // Export form
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exportYear, setExportYear] = useState('2025');
  const [exportMonth, setExportMonth] = useState('');
  const [exporting, setExportingState] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleArchiveProcess = () => {
    if (!archiveDateFrom || !archiveDateTo) {
      toast.error('Por favor seleccione el rango de fechas');
      return;
    }

    const dateFrom = new Date(archiveDateFrom);
    const dateTo = new Date(archiveDateTo);

    if (dateFrom > dateTo) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    // Count processes to archive
    const processesToArchive = mockProcessInstances.filter(p => {
      if (p.archived) return false;
      const createdDate = new Date(p.created_at);
      return createdDate >= dateFrom && createdDate <= dateTo && p.state === 'CLOSED';
    });

    if (processesToArchive.length === 0) {
      toast.error('No se encontraron procesos cerrados en el rango de fechas especificado');
      return;
    }

    // Simulate archive process
    setArchivingState(true);
    setArchiveProgress(0);

    const interval = setInterval(() => {
      setArchiveProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Create archive operation record
          const newOperation: ArchiveOperation = {
            id: Math.max(...archiveOperations.map(a => a.id), 0) + 1,
            user_id: currentUser.id,
            date_from: archiveDateFrom,
            date_to: archiveDateTo,
            total_processes: processesToArchive.length,
            status: 'COMPLETED',
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          };

          setArchiveOperations([...archiveOperations, newOperation]);
          
          toast.success(
            `${processesToArchive.length} proceso(s) archivado(s) exitosamente. ` +
            `Los procesos están disponibles en modo de solo lectura.`
          );
          
          setArchivingState(false);
          setArchiveDateFrom('');
          setArchiveDateTo('');
          setIsArchiving(false);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleExportBulk = () => {
    if (!exportDateFrom || !exportDateTo) {
      toast.error('Por favor seleccione el rango de fechas para exportar');
      return;
    }

    const dateFrom = new Date(exportDateFrom);
    const dateTo = new Date(exportDateTo);

    if (dateFrom > dateTo) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    // Count processes to export
    const processesToExport = mockProcessInstances.filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= dateFrom && createdDate <= dateTo;
    });

    if (processesToExport.length === 0) {
      toast.error('No se encontraron procesos en el rango de fechas especificado');
      return;
    }

    // Simulate export process
    setExportingState(true);
    setExportProgress(0);

    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const filters = `date_from=${exportDateFrom}, date_to=${exportDateTo}`;
          const estimatedSize = processesToExport.length * 3500000; // ~3.5 MB per process (mock)
          
          // Create export log record
          const newExportLog: ExportLog = {
            id: Math.max(...exportLogs.map(e => e.id), 0) + 1,
            user_id: currentUser.id,
            file_url: `/exports/procesos_${exportDateFrom}_${exportDateTo}.zip`,
            size_bytes: estimatedSize,
            created_at: new Date().toISOString(),
            filters: filters,
            export_type: 'ZIP'
          };

          setExportLogs([...exportLogs, newExportLog]);
          
          toast.success(
            `Exportación completada: ${processesToExport.length} proceso(s) exportado(s). ` +
            `Archivo ZIP generado con estructura por proceso e índice CSV/PDF. ` +
            `Tamaño estimado: ${formatBytes(estimatedSize)}`
          );
          
          // Log to audit
          toast.info(
            `Registro en bitácora: Usuario ${currentUser.full_name}, ` +
            `Filtros: ${filters}, Tamaño: ${formatBytes(estimatedSize)}`
          );
          
          setExportingState(false);
          setExportDateFrom('');
          setExportDateTo('');
          setIsExporting(false);
          
          return 100;
        }
        return prev + 8;
      });
    }, 250);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Archivado y Exportación Masiva</h1>
          <p className="text-muted-foreground">
            Gestión de archivos históricos y exportaciones en bloque
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsArchiving(true)} variant="outline">
            <Archive className="w-4 h-4 mr-2" />
            Archivar por Periodo
          </Button>
          <Button onClick={() => setIsExporting(true)}>
            <Download className="w-4 h-4 mr-2" />
            Exportar en Bloque
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Procesos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockProcessInstances.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Archivados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-gray-600" />
              <div className="text-2xl">
                {mockProcessInstances.filter(p => p.archived).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Operaciones de Archivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{archiveOperations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Exportaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{exportLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Archive Operations History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Archivado</CardTitle>
          <CardDescription>
            Operaciones de archivado por periodo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {archiveOperations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="w-12 h-12 mx-auto mb-4" />
              <p>No hay operaciones de archivado registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Procesos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archiveOperations.map(operation => (
                  <TableRow key={operation.id}>
                    <TableCell>{operation.id}</TableCell>
                    <TableCell>{getUserById(operation.user_id)?.full_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(operation.date_from).toLocaleDateString('es-ES')}</div>
                        <div className="text-muted-foreground">
                          hasta {new Date(operation.date_to).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{operation.total_processes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          operation.status === 'COMPLETED' ? 'default' :
                          operation.status === 'IN_PROGRESS' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {operation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(operation.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Exportaciones</CardTitle>
          <CardDescription>
            Exportaciones masivas realizadas con trazabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exportLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="w-12 h-12 mx-auto mb-4" />
              <p>No hay exportaciones registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Filtros</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Archivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exportLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{getUserById(log.user_id)?.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.export_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {log.filters || '-'}
                    </TableCell>
                    <TableCell>{formatBytes(log.size_bytes)}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Archive Dialog */}
      <Dialog open={isArchiving} onOpenChange={setIsArchiving}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archivar Procesos por Periodo</DialogTitle>
            <DialogDescription>
              Los procesos archivados se mantendrán en modo de solo lectura
            </DialogDescription>
          </DialogHeader>

          {!archiving ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="archive-from">Fecha Desde *</Label>
                <Input
                  id="archive-from"
                  type="date"
                  value={archiveDateFrom}
                  onChange={(e) => setArchiveDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="archive-to">Fecha Hasta *</Label>
                <Input
                  id="archive-to"
                  type="date"
                  value={archiveDateTo}
                  onChange={(e) => setArchiveDateTo(e.target.value)}
                />
              </div>

              <Card className="bg-secondary">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Sobre el Archivado</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Solo se archivarán procesos en estado "CLOSED"</li>
                        <li>• Los procesos archivados se mantendrán en modo de solo lectura</li>
                        <li>• Esta operación se registrará en la bitácora de auditoría</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <FileArchive className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                <p className="mb-4">Archivando procesos...</p>
                <Progress value={archiveProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">{archiveProgress}%</p>
              </div>
            </div>
          )}

          {!archiving && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsArchiving(false)}>
                Cancelar
              </Button>
              <Button onClick={handleArchiveProcess}>
                <Archive className="w-4 h-4 mr-2" />
                Iniciar Archivado
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportación Masiva</DialogTitle>
            <DialogDescription>
              Generar archivo ZIP con estructura por proceso e índice
            </DialogDescription>
          </DialogHeader>

          {!exporting ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-from">Fecha Desde *</Label>
                <Input
                  id="export-from"
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="export-to">Fecha Hasta *</Label>
                <Input
                  id="export-to"
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                />
              </div>

              <Card className="bg-secondary">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Contenido de la Exportación</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Estructura organizada por proceso</li>
                        <li>• Índice en formato CSV y PDF</li>
                        <li>• Todos los documentos y evidencias</li>
                        <li>• Metadatos y trazabilidad completa</li>
                        <li>• Registro automático en bitácora</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Download className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
                <p className="mb-4">Generando exportación...</p>
                <Progress value={exportProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">{exportProgress}%</p>
              </div>
            </div>
          )}

          {!exporting && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExporting(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExportBulk}>
                <Download className="w-4 h-4 mr-2" />
                Iniciar Exportación
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
