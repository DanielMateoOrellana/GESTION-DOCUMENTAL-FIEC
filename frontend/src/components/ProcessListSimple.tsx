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
import { Search, Plus, X, Tag as TagIcon, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { CreateProcessModal } from "./CreateProcessModal";
import { TagManagementModal } from "./TagManagementModal";
import { Progress } from "./ui/progress";

import {
  fetchProcessInstances,
  type ProcessInstance as ApiProcessInstance,
  type EstadoProceso,
} from "../api/processInstances";
import { fetchProcessTypes, type ProcessType } from "../api/processTypes";
import {
  fetchTags,
  createTag,
  assignTagToProcess,
  removeTagFromProcess,
  type Tag,
} from "../api/tags";

interface ProcessListSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

// Colores predeterminados para nuevas etiquetas
const TAG_COLORS = [
  "#EF4444", // red
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

export function ProcessListSimple({
  currentUser,
  onViewChange,
}: ProcessListSimpleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [isCreateProcessModalOpen, setIsCreateProcessModalOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [savingTag, setSavingTag] = useState(false);

  const [instances, setInstances] = useState<ApiProcessInstance[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [data, types, tags] = await Promise.all([
        fetchProcessInstances(),
        fetchProcessTypes(),
        fetchTags(),
      ]);
      setInstances(data);
      setProcessTypes(types);
      setAllTags(tags);
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

  // Obtener etiquetas de un proceso desde los datos incluidos
  const getProcessTagIds = (process: ApiProcessInstance): number[] => {
    return process.tags?.map((t) => t.tagId) || [];
  };

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

    const matchesTag =
      filterTag === "all" ||
      getProcessTagIds(process).includes(Number(filterTag));

    return matchesSearch && matchesYear && matchesState && matchesType && matchesTag;
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

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error("Seleccione al menos un proceso");
      return;
    }
    toast.success(`Exportando ${selectedItems.length} proceso(s)`);
  };

  const toggleTag = async (processId: number, tagId: number) => {
    const process = instances.find((p) => p.id === processId);
    if (!process) return;

    const currentTagIds = getProcessTagIds(process);
    const isAssigned = currentTagIds.includes(tagId);

    try {
      if (isAssigned) {
        await removeTagFromProcess(processId, tagId);
        // Actualizar el estado local
        setInstances((prev) =>
          prev.map((p) =>
            p.id === processId
              ? { ...p, tags: p.tags?.filter((t) => t.tagId !== tagId) }
              : p
          )
        );
        toast.success("Etiqueta removida");
      } else {
        const assignment = await assignTagToProcess(processId, tagId);
        // Actualizar el estado local
        setInstances((prev) =>
          prev.map((p) =>
            p.id === processId
              ? {
                ...p,
                tags: [
                  ...(p.tags || []),
                  {
                    id: assignment.id,
                    processInstanceId: processId,
                    tagId: tagId,
                    tag: allTags.find((t) => t.id === tagId)!,
                    assignedAt: new Date().toISOString(),
                  },
                ],
              }
              : p
          )
        );
        toast.success("Etiqueta asignada");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al modificar etiqueta");
    }
  };

  const handleCreateTag = async (processId: number) => {
    if (!newTagName.trim()) {
      toast.error("Escriba un nombre para la etiqueta");
      return;
    }

    // Verificar si ya existe
    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (existingTag) {
      // Ya existe, solo asignarla
      await toggleTag(processId, existingTag.id);
      setNewTagName("");
      return;
    }

    // Crear nueva etiqueta
    try {
      setSavingTag(true);
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

      const newTag = await createTag({
        name: newTagName.trim(),
        color: randomColor,
      });

      // Agregar a la lista de todas las etiquetas
      setAllTags((prev) => [...prev, newTag]);

      // Asignar al proceso
      const assignment = await assignTagToProcess(processId, newTag.id);

      // Actualizar el proceso con la nueva etiqueta
      setInstances((prev) =>
        prev.map((p) =>
          p.id === processId
            ? {
              ...p,
              tags: [
                ...(p.tags || []),
                {
                  id: assignment.id,
                  processInstanceId: processId,
                  tagId: newTag.id,
                  tag: newTag,
                  assignedAt: new Date().toISOString(),
                },
              ],
            }
            : p
        )
      );

      setNewTagName("");
      toast.success(`Etiqueta "${newTag.name}" creada y asignada`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al crear etiqueta");
    } finally {
      setSavingTag(false);
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

  const hasActiveFilters = filterYear !== "all" || filterState !== "all" || filterType !== "all" || filterTag !== "all";

  const clearFilters = () => {
    setFilterYear("all");
    setFilterState("all");
    setFilterType("all");
    setFilterTag("all");
    setSearchTerm("");
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
            <Button variant="outline" onClick={handleExport}>
              Exportar seleccionados ({selectedItems.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsTagManagerOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Gestor de Etiquetas
          </Button>
          <Button onClick={() => setIsCreateProcessModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo proceso
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            {/* Filtro por Etiquetas */}
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className={filterTag !== "all" ? "border-primary" : ""}>
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  <SelectValue placeholder="Etiqueta" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las etiquetas</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
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
                <TableHead>Etiquetas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => {
                const state = getSimplifiedState(process.estado);
                const processTagIds = getProcessTagIds(process);

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
                    <TableCell>
                      {editingTags === process.id ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {allTags.map((tag) => (
                              <Badge
                                key={tag.id}
                                style={{
                                  backgroundColor: processTagIds.includes(tag.id)
                                    ? tag.color
                                    : "#e5e7eb",
                                  color: processTagIds.includes(tag.id)
                                    ? "#fff"
                                    : "#6b7280",
                                  cursor: "pointer",
                                }}
                                className="transition-all hover:opacity-80"
                                onClick={() => toggleTag(process.id, tag.id)}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <Input
                              placeholder="Nueva etiqueta..."
                              value={newTagName}
                              onChange={(e) => setNewTagName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCreateTag(process.id);
                                }
                              }}
                              className="h-7 text-xs"
                              disabled={savingTag}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateTag(process.id)}
                              disabled={savingTag}
                            >
                              {savingTag ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTags(null);
                                setNewTagName("");
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex flex-wrap gap-1 cursor-pointer min-h-[24px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTags(process.id);
                          }}
                        >
                          {processTagIds.length > 0 ? (
                            processTagIds.slice(0, 3).map((tagId) => {
                              const tag = allTags.find((t) => t.id === tagId) ||
                                process.tags?.find(t => t.tagId === tagId)?.tag;
                              return tag ? (
                                <Badge
                                  key={tag.id}
                                  style={{
                                    backgroundColor: tag.color,
                                    color: "#fff",
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground hover:text-foreground">
                              + Agregar
                            </span>
                          )}
                          {processTagIds.length > 3 && (
                            <Badge variant="secondary">
                              +{processTagIds.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProcesses.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <TagIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
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

      {/* Modal para gestionar etiquetas */}
      <TagManagementModal
        open={isTagManagerOpen}
        onOpenChange={setIsTagManagerOpen}
        onTagsUpdated={loadData}
      />
    </div>
  );
}
