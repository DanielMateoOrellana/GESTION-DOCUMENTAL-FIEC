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
import { Search, Plus, Eye, X } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { CreateProcessModal } from "./CreateProcessModal";
import { Progress } from "./ui/progress";

import {
  fetchProcessInstances,
  type ProcessInstance as ApiProcessInstance,
  type EstadoProceso,
} from "../api/processInstances";
import { fetchProcessTypes, type ProcessType } from "../api/processTypes";

interface ProcessListSimpleProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

// Mock tags (las que ya existen)
const mockTags = [
  { id: 1, name: "Urgente", color: "#EF4444" },
  { id: 2, name: "Prioritario", color: "#F59E0B" },
  { id: 3, name: "Revisado", color: "#10B981" },
];

export function ProcessListSimple({
  currentUser,
  onViewChange,
}: ProcessListSimpleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterState, setFilterState] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [processTags, setProcessTags] = useState<Record<number, number[]>>({});
  const [editingTags, setEditingTags] = useState<number | null>(null);
  const [isCreateProcessModalOpen, setIsCreateProcessModalOpen] =
    useState(false);
  const [allTags, setAllTags] = useState(mockTags);
  const [newTagName, setNewTagName] = useState("");

  const [instances, setInstances] = useState<ApiProcessInstance[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
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

  useEffect(() => {
    const load = async () => {
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
        setError("No se pudieron cargar los procesos o tipos de proceso");
        toast.error("Error cargando procesos");
      } finally {
        setLoading(false);
      }
    };

    load();
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

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error("Seleccione al menos un proceso");
      return;
    }
    toast.success(`Exportando ${selectedItems.length} proceso(s)`);
  };

  const toggleTag = (processId: number, tagId: number) => {
    const current = processTags[processId] || [];
    if (current.includes(tagId)) {
      setProcessTags({
        ...processTags,
        [processId]: current.filter((t) => t !== tagId),
      });
    } else {
      setProcessTags({
        ...processTags,
        [processId]: [...current, tagId],
      });
    }
  };

  const handleCreateTag = (processId: number) => {
    if (!newTagName.trim()) {
      toast.error("Escriba un nombre para la etiqueta");
      return;
    }

    const existingTag = allTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (existingTag) {
      toggleTag(processId, existingTag.id);
      setNewTagName("");
      toast.info("Etiqueta existente agregada");
    } else {
      const colors = [
        "#EF4444",
        "#F59E0B",
        "#10B981",
        "#3B82F6",
        "#8B5CF6",
        "#EC4899",
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newTag = {
        id: allTags.length + 1,
        name: newTagName.trim(),
        color: randomColor,
      };

      setAllTags([...allTags, newTag]);
      setProcessTags({
        ...processTags,
        [processId]: [...(processTags[processId] || []), newTag.id],
      });
      setNewTagName("");
      toast.success(`Etiqueta "${newTag.name}" creada`);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Procesos</h1>
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
          <Button onClick={() => setIsCreateProcessModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo proceso
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
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
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {loading && (
            <p className="mt-3 text-sm text-muted-foreground">
              Cargando procesos...
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {/* Tabla de Procesos */}
      <Card>
        <CardHeader>
          <CardTitle>Procesos ({filteredProcesses.length})</CardTitle>
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
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => {
                const state = getSimplifiedState(process.estado);
                const tags = processTags[process.id] || [];

                const responsibleLabel =
                  process.responsibleUserId === currentUser.id
                    ? currentUser.full_name
                    : process.responsibleUserId != null
                    ? `Usuario #${process.responsibleUserId}`
                    : "—";

                 const minSteps = process.steps || [];
                 const completedSteps = minSteps.filter(s => s.estado === 'COMPLETADO').length;
                 const totalSteps = minSteps.length;
                 const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return (
                  <TableRow key={process.id}>
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
                          ? `${getProcessTypeName(process.processTypeId)} ${
                              process.year ?? ""
                            }`
                          : `Proceso ${process.id}`)}
                    </TableCell>
                    <TableCell>
                      {process.year ??
                        new Date(process.createdAt).getFullYear()}
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
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {allTags.map((tag) => (
                              <Badge
                                key={tag.id}
                                style={{
                                  backgroundColor: tags.includes(tag.id)
                                    ? tag.color
                                    : "#e5e7eb",
                                  color: tags.includes(tag.id)
                                    ? "#fff"
                                    : "#6b7280",
                                  cursor: "pointer",
                                }}
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
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateTag(process.id)}
                            >
                              <Plus className="w-3 h-3" />
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
                          className="flex flex-wrap gap-1 cursor-pointer"
                          onClick={() => setEditingTags(process.id)}
                        >
                          {tags.length > 0 ? (
                            tags.map((tagId) => {
                              const tag = allTags.find((t) => t.id === tagId);
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
                            <span className="text-xs text-muted-foreground">
                              + Agregar
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onViewChange("process-detail", {
                            processId: process.id,
                          })
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProcesses.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron procesos</p>
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
    </div>
  );
}
