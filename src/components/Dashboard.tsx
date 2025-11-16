import { ProcessInstance, User, Notification } from "../types";
import {
  getProcessTypeById,
  getUserById,
  getProgressForProcess,
  mockProcessInstances,
  mockNotifications,
} from "../data/mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ProcessInstanceCreator } from "./ProcessInstanceCreator";
import {
  FolderKanban,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function Dashboard({
  currentUser,
  onViewChange,
}: DashboardProps) {
  const activeProcesses = mockProcessInstances.filter(
    (p) =>
      p.state !== "CLOSED" &&
      p.responsible_user_id === currentUser.id,
  );

  const unreadNotifications = mockNotifications.filter(
    (n) => n.user_id === currentUser.id && !n.is_read,
  );

  const processStats = {
    total: activeProcesses.length,
    inProgress: activeProcesses.filter(
      (p) => p.state === "IN_PROGRESS",
    ).length,
    pending: activeProcesses.filter(
      (p) => p.state === "PENDING_APPROVAL",
    ).length,
    draft: activeProcesses.filter((p) => p.state === "DRAFT")
      .length,
  };

  const chartData = mockProcessInstances
    .filter((p) => p.responsible_user_id === currentUser.id)
    .reduce(
      (acc, p) => {
        const status = p.state;
        const existing = acc.find(
          (item) => item.name === status,
        );
        if (existing) {
          existing.value++;
        } else {
          acc.push({ name: status, value: 1 });
        }
        return acc;
      },
      [] as { name: string; value: number }[],
    );

  const COLORS = [
    "#002E5D",
    "#0072CE",
    "#00A8E8",
    "#64748b",
    "#10b981",
  ];

  const statusLabels: Record<string, string> = {
    DRAFT: "Borrador",
    IN_PROGRESS: "En Progreso",
    PENDING_APPROVAL: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    CLOSED: "Cerrado",
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>
            Bienvenido, {currentUser.full_name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Dashboard - Sistema de Gestión Documental FIEC
          </p>
        </div>
        <Button
          onClick={() =>
            onViewChange("processes", { action: "new" })
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proceso
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Procesos Activos
            </CardTitle>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{processStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Procesos asignados a ti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              En Progreso
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {processStats.inProgress}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Procesos en desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Pendientes
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {processStats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren aprobación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">
              Notificaciones
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {unreadNotifications.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Notificaciones sin leer
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Procesos</CardTitle>
            <CardDescription>Por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${statusLabels[name] || name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Processes List */}
        <Card>
          <CardHeader>
            <CardTitle>Procesos Activos</CardTitle>
            <CardDescription>
              Procesos que requieren tu atención
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProcesses.slice(0, 4).map((process) => {
              const processType = getProcessTypeById(
                process.process_type_id,
              );
              const progress = getProgressForProcess(
                process.id,
              );

              return (
                <div
                  key={process.id}
                  className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0 cursor-pointer hover:bg-accent/50 -mx-4 px-4 py-2 rounded-lg transition-colors"
                  onClick={() =>
                    onViewChange("process-detail", {
                      processId: process.id,
                    })
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {process.title || processType?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {process.year} - Mes {process.month}
                        </span>
                      </div>
                    </div>
                    <Badge
                      className={getStatusColor(process.state)}
                    >
                      {statusLabels[process.state] ||
                        process.state}
                    </Badge>
                  </div>
                  {progress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Progreso
                        </span>
                        <span>
                          {progress.progress_percent}%
                        </span>
                      </div>
                      <Progress
                        value={progress.progress_percent}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {activeProcesses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tienes procesos activos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}