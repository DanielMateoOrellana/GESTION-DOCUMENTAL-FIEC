import { User } from '../types';
import { mockProcessInstances, mockAuditLog } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface ReportsPanelProps {
  currentUser: User;
}

export function ReportsPanel({ currentUser }: ReportsPanelProps) {
  const [selectedYear, setSelectedYear] = useState('2025');

  // Process statistics by month
  const processByMonth = mockProcessInstances
    .filter(p => p.year.toString() === selectedYear)
    .reduce((acc, p) => {
      const month = p.month;
      if (!acc[month]) {
        acc[month] = { month, total: 0, completed: 0, inProgress: 0 };
      }
      acc[month].total++;
      if (p.state === 'CLOSED' || p.state === 'APPROVED') {
        acc[month].completed++;
      } else {
        acc[month].inProgress++;
      }
      return acc;
    }, {} as Record<number, any>);

  const monthlyData = Object.values(processByMonth).sort((a: any, b: any) => a.month - b.month);

  // Process statistics by type
  const processByType = mockProcessInstances.reduce((acc, p) => {
    const typeId = p.process_type_id;
    if (!acc[typeId]) {
      acc[typeId] = { name: `Tipo ${typeId}`, count: 0 };
    }
    acc[typeId].count++;
    return acc;
  }, {} as Record<number, any>);

  const typeData = Object.values(processByType);

  // Recent audit log
  const recentAudit = mockAuditLog.slice(0, 10);

  const exportReport = (type: string) => {
    console.log(`Exportando reporte: ${type}`);
    alert(`Generando reporte de ${type}. El archivo se descargará automáticamente.`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">
            Análisis y exportación de datos del sistema
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Procesos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockProcessInstances.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos los años</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {mockProcessInstances.filter(p => p.state === 'CLOSED' || p.state === 'APPROVED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Procesos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {mockProcessInstances.filter(p => p.state === 'IN_PROGRESS').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Activos actualmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Auditoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mockAuditLog.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registros de auditoría</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Procesos por Mes - {selectedYear}</CardTitle>
            <CardDescription>Distribución mensual de procesos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(value) => `Mes ${value}`} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Mes ${value}`}
                  formatter={(value: any) => [value, '']}
                />
                <Legend />
                <Bar dataKey="completed" name="Completados" fill="#28A745" />
                <Bar dataKey="inProgress" name="En Progreso" fill="#FFC107" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Procesos</CardTitle>
            <CardDescription>Evolución temporal</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(value) => `M${value}`} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => `Mes ${value}`}
                  formatter={(value: any) => [value, '']}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total" stroke="#004C97" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" name="Completados" stroke="#28A745" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exportaciones Disponibles</CardTitle>
              <CardDescription>Descarga reportes en diferentes formatos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h4>Reporte de Procesos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Lista completa de procesos con sus estados y responsables
              </p>
              <Button onClick={() => exportReport('procesos')} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h4>Auditoría del Sistema</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Registro completo de acciones realizadas en el sistema
              </p>
              <Button onClick={() => exportReport('auditoria')} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4>Estadísticas Generales</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Resumen ejecutivo con gráficos y métricas clave
              </p>
              <Button onClick={() => exportReport('estadisticas')} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Auditoría Reciente</CardTitle>
          <CardDescription>Últimas acciones registradas en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAudit.map(log => (
                <TableRow key={log.id}>
                  <TableCell>Usuario #{log.user_id}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-secondary px-2 py-1 rounded">{log.action}</code>
                  </TableCell>
                  <TableCell>{log.entity_type}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(log.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
