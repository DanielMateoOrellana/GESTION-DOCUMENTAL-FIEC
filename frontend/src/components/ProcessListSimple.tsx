import { useEffect, useState } from "react";
import { User } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Search, Plus, Loader2, FolderOpen, FileUp, Download, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { CreateProcessModal } from "./CreateProcessModal";
import { ImportProcessModal } from "./ImportProcessModal";
import { Progress } from "./ui/progress";

import {
  fetchProcessInstances,
  exportBulkProcesses,
  deleteProcessInstance,
  type ProcessInstance as ApiProcessInstance,
  type EstadoProceso,
} from "../api/processInstances";
import { fetchProcessTypes, type ProcessType } from "../api/processTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ProcessListSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function ProcessListSimple({
  currentUser,
  onViewChange,
}: ProcessListSimpleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isCreateProcessModalOpen, setIsCreateProcessModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [instances, setInstances] = useState<ApiProcessInstance[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<ApiProcessInstance | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Años dinámicos según lo que viene del backend
  const years = Array.from(
    new Set(
      instances
        .map((p) => p.year)
        .filter((y): y is number => typeof y === "number")
    )
  ).sort((a, b) => b - a);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, types] = await Promise.all([
        fetchProcessInstances(),
        fetchProcessTypes(),
      ]);
      setInstances(data);
      setProcessTypes(types);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los procesos");
      toast.error("Error cargando procesos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProcesses = instances.filter((process) => {
    const matchesSearch = (process.title ?? "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesYear =
      filterYear === "all" ||
      (process.year !== null &&
        process.year !== undefined &&
        process.year.toString() === filterYear);

    const matchesState =
      filterState === "all" ||
      (filterState === "pending" && process.estado === "PENDIENTE") ||
      (filterState === "completed" && process.estado === "COMPLETADO");

    const matchesType =
      filterType === "all" ||
      (process.processTypeId !== null &&
        process.processTypeId !== undefined &&
        process.processTypeId.toString() === filterType);

    return matchesSearch && matchesYear && matchesState && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredProcesses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProcesses.map((p) => p.id));
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleExport = async () => {
    if (selectedItems.length === 0) {
      toast.error("Seleccione al menos un proceso");
      return;
    }

    try {
      setExporting(true);
      const blob = await exportBulkProcesses(selectedItems);

      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `Expedientes_${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${selectedItems.length} expediente(s) exportados exitosamente`);
      setSelectedItems([]); // Limpiar selección después de exportar
    } catch (e: any) {
      console.error("Error exportando expedientes", e);
      const message = e.response?.data?.message || "Error al exportar los expedientes";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const getSimplifiedState = (estado: EstadoProceso) => {
    if (estado === "COMPLETADO") {
      return { label: "Completado", color: "bg-green-100 text-green-800" };
    }
    return { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" };
  };

  const getProcessTypeName = (id?: number | null) => {
    if (id == null) return "—";
    return processTypes.find((t) => t.id === id)?.name ?? `Tipo #${id}`;
  };

  const hasActiveFilters = filterYear !== "all" || filterState !== "all" || filterType !== "all";

  const clearFilters = () => {
    setFilterYear("all");
    setFilterState("all");
    setFilterType("all");
    setSearchTerm("");
  };

  const openDeleteDialog = (process: ApiProcessInstance, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click
    setProcessToDelete(process);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!processToDelete) return;

    try {
      setDeleting(true);
      await deleteProcessInstance(processToDelete.id);

      // Actualizar estado local
      setInstances((prev) => prev.filter((p) => p.id !== processToDelete.id));
      setSelectedItems((prev) => prev.filter((id) => id !== processToDelete.id));

      toast.success(`Proceso "${processToDelete.title || `#${processToDelete.id}`}" eliminado`);
      setDeleteDialogOpen(false);
      setProcessToDelete(null);
    } catch (e: any) {
      console.error('Error eliminando proceso:', e);
      const message = e.response?.data?.message || 'Error al eliminar el proceso';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Procesos</h1>
          <p className="text-muted-foreground">
            Gestión de procesos institucionales
          </p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? "Exportando..." : `Exportar (${selectedItems.length})`}
            </Button>
          )}
          {/* Solo mostrar botones de creación si NO es LECTOR */}
          {currentUser.role !== 'LECTOR' && (
            <>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <FileUp className="w-4 h-4 mr-2" />
                Importar Expediente
              </Button>
              <Button onClick={() => setIsCreateProcessModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo proceso
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filtros</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
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
              <SelectTrigger className={filterYear !== "all" ? "border-primary" : ""}>
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
              <SelectTrigger className={filterType !== "all" ? "border-primary" : ""}>
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
              <SelectTrigger className={filterState !== "all" ? "border-primary" : ""}>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando procesos...
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {/* Tabla de Procesos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Procesos
            <Badge variant="secondary">{filteredProcesses.length}</Badge>
            {hasActiveFilters && (
              <span className="text-sm font-normal text-muted-foreground">
                (filtrado de {instances.length} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedItems.length === filteredProcesses.length &&
                      filteredProcesses.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => {
                const state = getSimplifiedState(process.estado);

                const responsibleLabel =
                  process.responsibleUser?.fullName ||
                  (process.responsibleUserId != null
                    ? `Usuario #${process.responsibleUserId}`
                    : "Sin asignar");

                const minSteps = process.steps || [];
                const completedSteps = minSteps.filter(s => s.estado === 'COMPLETADO').length;
                const totalSteps = minSteps.length;
                const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <TableRow
                    key={process.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewChange("process-detail", { processId: process.id })}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(process.id)}
                        onCheckedChange={() => handleSelectItem(process.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {getProcessTypeName(process.processTypeId)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {process.title ||
                        (process.processTypeId
                          ? `${getProcessTypeName(process.processTypeId)} ${process.year ?? ""}`
                          : `Proceso ${process.id}`)}
                    </TableCell>
                    <TableCell>
                      {process.year ?? new Date(process.createdAt).getFullYear()}
                    </TableCell>
                    <TableCell>{responsibleLabel}</TableCell>
                    <TableCell>
                      <Badge className={state.color}>{state.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={progressPercent} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {completedSteps} de {totalSteps} completados
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProcesses.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No se encontraron procesos</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para crear un nuevo proceso */}
      <CreateProcessModal
        open={isCreateProcessModalOpen}
        onClose={() => setIsCreateProcessModalOpen(false)}
        currentUser={currentUser}
        onProcessCreated={(instance) => {
          // Actualizar lista cuando se crea un nuevo proceso
          setInstances((prev) => [...prev, instance]);
        }}
      />

      {/* Modal para importar expediente desde ZIP */}
      <ImportProcessModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(result) => {
          // Agregar el proceso importado a la lista
          setInstances((prev) => [result.process, ...prev]);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el proceso{' '}
              <strong>"{processToDelete?.title || `#${processToDelete?.id}`}"</strong>?
              <br />
              <br />
              Esta acción eliminará permanentemente todos los archivos asociados
              y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
