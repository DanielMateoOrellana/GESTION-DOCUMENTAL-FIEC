import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AuditLog, User } from '../types';
import { mockAuditLog, mockUsers } from '../data/mockData';
import { FileText, Download, Filter, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AuditLogViewerProps {
  currentUser: User;
}

// Extended mock audit log with more entries and IP addresses
const extendedAuditLog: AuditLog[] = [
  ...mockAuditLog,
  {
    id: 4,
    user_id: 1,
    action: 'CREATE_PROCESS',
    entity_type: 'process_instance',
    entity_id: 5,
    details: 'Created process: Evaluación Docente Semestre 2025-1',
    created_at: '2025-06-01T08:00:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 5,
    user_id: 2,
    action: 'APPROVE_STEP',
    entity_type: 'step_instance',
    entity_id: 4,
    details: 'Approved step: Elaboración de Informe',
    created_at: '2025-10-02T15:30:00Z',
    ip_address: '192.168.1.15'
  },
  {
    id: 6,
    user_id: 1,
    action: 'CLOSE_PROCESS',
    entity_type: 'process_instance',
    entity_id: 3,
    details: 'Closed process with 100% completion',
    created_at: '2025-09-30T16:45:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 7,
    user_id: 3,
    action: 'EXPORT_DATA',
    entity_type: 'export_log',
    entity_id: 1,
    details: 'Exported process data to CSV (filters: year=2025, month=9)',
    created_at: '2025-10-05T10:20:00Z',
    ip_address: '192.168.1.20'
  },
  {
    id: 8,
    user_id: 2,
    action: 'OBSERVE_STEP',
    entity_type: 'step_instance',
    entity_id: 2,
    details: 'Observed step with comment: Falta documentación complementaria',
    created_at: '2025-10-16T14:30:00Z',
    ip_address: '192.168.1.15'
  },
  {
    id: 9,
    user_id: 1,
    action: 'CREATE_USER',
    entity_type: 'user',
    entity_id: 4,
    details: 'Created new user: Dr. Pedro López',
    created_at: '2025-10-18T09:00:00Z',
    ip_address: '192.168.1.10'
  },
  {
    id: 10,
    user_id: 1,
    action: 'ASSIGN_ROLE',
    entity_type: 'user_role',
    entity_id: 4,
    details: 'Assigned role DIRECTOR to user #4',
    created_at: '2025-10-18T09:05:00Z',
    ip_address: '192.168.1.10'
  }
];

const ACTION_TYPES = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'UPLOAD_FILE', label: 'Carga de archivo' },
  { value: 'APPROVE_STEP', label: 'Aprobación de paso' },
  { value: 'OBSERVE_STEP', label: 'Observación de paso' },
  { value: 'CREATE_PROCESS', label: 'Creación de proceso' },
  { value: 'CLOSE_PROCESS', label: 'Cierre de proceso' },
  { value: 'EXPORT_DATA', label: 'Exportación de datos' },
  { value: 'CREATE_USER', label: 'Creación de usuario' },
  { value: 'ASSIGN_ROLE', label: 'Asignación de rol' }
];

export function AuditLogViewer({ currentUser }: AuditLogViewerProps) {
  const [logs] = useState<AuditLog[]>(extendedAuditLog);
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by user
    if (filterUserId !== 'all') {
      filtered = filtered.filter(log => log.user_id === parseInt(filterUserId));
    }

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    // Filter by date range
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(log => new Date(log.created_at) >= fromDate);
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.created_at) <= toDate);
    }

    // Filter by search text (in details)
    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(log => 
        log.details?.toLowerCase().includes(search) ||
        log.action.toLowerCase().includes(search) ||
        log.entity_type.toLowerCase().includes(search)
      );
    }

    // Sort by date descending (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [logs, filterUserId, filterAction, filterDateFrom, filterDateTo, searchText]);

  const handleExportCSV = () => {
    const filterInfo = [];
    if (filterUserId !== 'all') filterInfo.push(`user_id=${filterUserId}`);
    if (filterAction !== 'all') filterInfo.push(`action=${filterAction}`);
    if (filterDateFrom) filterInfo.push(`date_from=${filterDateFrom}`);
    if (filterDateTo) filterInfo.push(`date_to=${filterDateTo}`);
    if (searchText) filterInfo.push(`search=${searchText}`);

    toast.success(`Exportando ${filteredLogs.length} registros a CSV` + 
      (filterInfo.length > 0 ? ` (Filtros: ${filterInfo.join(', ')})` : ''));
  };

  const handleExportPDF = () => {
    const filterInfo = [];
    if (filterUserId !== 'all') filterInfo.push(`user_id=${filterUserId}`);
    if (filterAction !== 'all') filterInfo.push(`action=${filterAction}`);
    if (filterDateFrom) filterInfo.push(`date_from=${filterDateFrom}`);
    if (filterDateTo) filterInfo.push(`date_to=${filterDateTo}`);
    if (searchText) filterInfo.push(`search=${searchText}`);

    toast.success(`Generando PDF con ${filteredLogs.length} registros` + 
      (filterInfo.length > 0 ? ` (Filtros: ${filterInfo.join(', ')})` : ''));
  };

  const handleClearFilters = () => {
    setFilterUserId('all');
    setFilterAction('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setSearchText('');
  };

  const getUserName = (userId: number) => {
    return mockUsers.find(u => u.id === userId)?.full_name || 'Usuario desconocido';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('APPROVE')) return 'default';
    if (action.includes('OBSERVE') || action.includes('REJECT')) return 'destructive';
    if (action.includes('UPLOAD') || action.includes('CREATE')) return 'secondary';
    if (action.includes('EXPORT')) return 'outline';
    return 'secondary';
  };

  const activeFiltersCount = [
    filterUserId !== 'all',
    filterAction !== 'all',
    filterDateFrom,
    filterDateTo,
    searchText
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Bitácora de Auditoría</h2>
          <p className="text-sm text-muted-foreground">
            Registro completo de eventos y acciones del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Filtros de Búsqueda</CardTitle>
              <CardDescription>
                Filtre los registros por fecha, usuario o tipo de acción
              </CardDescription>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpiar ({activeFiltersCount})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filter-user">Usuario</Label>
              <Select value={filterUserId} onValueChange={setFilterUserId}>
                <SelectTrigger id="filter-user">
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
              <Label htmlFor="filter-action">Acción</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger id="filter-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-date-from">Fecha Desde</Label>
              <Input
                id="filter-date-from"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="filter-date-to">Fecha Hasta</Label>
              <Input
                id="filter-date-to"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="search-text">Buscar en detalles</Label>
              <Input
                id="search-text"
                type="text"
                placeholder="Buscar..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredLogs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {new Set(logs.map(l => l.user_id)).size}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tipos de Acción</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {new Set(logs.map(l => l.action)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Auditoría</CardTitle>
          <CardDescription>
            {filteredLogs.length} registro(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4" />
              <p>No se encontraron registros con los filtros aplicados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha/Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>IP Origen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </TableCell>
                    <TableCell>{getUserName(log.user_id)}</TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{log.entity_type}</div>
                        <div className="text-muted-foreground">ID: {log.entity_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm truncate" title={log.details}>
                        {log.details || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ip_address || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
