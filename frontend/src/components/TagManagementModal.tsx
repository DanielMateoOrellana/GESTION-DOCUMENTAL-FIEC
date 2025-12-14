import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
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
import { Plus, Edit, Trash2, Tag as TagIcon, Loader2, Search, AlertTriangle, Settings } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "./ui/form-field";
import { EmptyState } from "./ui/empty-state";
import { TableSkeleton } from "./ui/loading-spinner";
import {
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    type Tag,
} from "../api/tags";

interface TagManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTagsUpdated?: () => void;
}

// Colores predeterminados para etiquetas
const TAG_COLORS = [
    { name: "Rojo", value: "#EF4444" },
    { name: "Naranja", value: "#F59E0B" },
    { name: "Amarillo", value: "#EAB308" },
    { name: "Verde", value: "#10B981" },
    { name: "Azul", value: "#3B82F6" },
    { name: "Índigo", value: "#6366F1" },
    { name: "Violeta", value: "#8B5CF6" },
    { name: "Rosa", value: "#EC4899" },
    { name: "Cian", value: "#06B6D4" },
    { name: "Lima", value: "#84CC16" },
    { name: "Gris", value: "#6B7280" },
];

export function TagManagementModal({ open, onOpenChange, onTagsUpdated }: TagManagementModalProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [formName, setFormName] = useState("");
    const [formColor, setFormColor] = useState("#3B82F6");
    const [formErrors, setFormErrors] = useState<{ name?: string }>({});

    const loadTags = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchTags();
            setTags(data);
        } catch (e) {
            console.error(e);
            setError("No se pudieron cargar las etiquetas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadTags();
        }
    }, [open]);

    const filteredTags = tags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validateForm = (): boolean => {
        const errors: { name?: string } = {};

        if (!formName.trim()) {
            errors.name = "El nombre es requerido";
        } else if (formName.trim().length < 2) {
            errors.name = "El nombre debe tener al menos 2 caracteres";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormName("");
        setFormColor("#3B82F6");
        setFormErrors({});
        setSelectedTag(null);
        setIsCreating(false);
    };

    const handleOpenCreate = () => {
        resetForm();
        setIsCreating(true);
        setIsEditModalOpen(true);
    };

    const handleOpenEdit = (tag: Tag) => {
        setSelectedTag(tag);
        setFormName(tag.name);
        setFormColor(tag.color);
        setFormErrors({});
        setIsCreating(false);
        setIsEditModalOpen(true);
    };

    const handleOpenDelete = (tag: Tag) => {
        setSelectedTag(tag);
        setIsDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSubmitting(true);

            if (isCreating) {
                const newTag = await createTag({
                    name: formName.trim(),
                    color: formColor,
                });
                setTags((prev) => [...prev, newTag]);
                toast.success(`Etiqueta "${newTag.name}" creada`);
            } else if (selectedTag) {
                const updatedTag = await updateTag(selectedTag.id, {
                    name: formName.trim(),
                    color: formColor,
                });
                setTags((prev) =>
                    prev.map((t) => (t.id === updatedTag.id ? updatedTag : t))
                );
                toast.success(`Etiqueta "${updatedTag.name}" actualizada`);
            }

            setIsEditModalOpen(false);
            resetForm();
            onTagsUpdated?.();
        } catch (e: any) {
            console.error(e);
            const errorMsg = e.response?.data?.message || `Error al ${isCreating ? 'crear' : 'actualizar'} etiqueta`;
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTag) return;

        try {
            setSubmitting(true);
            await deleteTag(selectedTag.id);
            setTags((prev) => prev.filter((t) => t.id !== selectedTag.id));
            setIsDeleteDialogOpen(false);
            toast.success(`Etiqueta "${selectedTag.name}" eliminada`);
            setSelectedTag(null);
            onTagsUpdated?.();
        } catch (e: any) {
            console.error(e);
            const errorMsg = e.response?.data?.message || "Error al eliminar etiqueta";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Gestor de Etiquetas
                        </DialogTitle>
                        <DialogDescription>
                            Administra las etiquetas disponibles para clasificar procesos
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto space-y-4">
                        {/* Buscador y botón crear */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar etiquetas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button onClick={handleOpenCreate} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva
                            </Button>
                        </div>

                        {/* Lista de etiquetas */}
                        {loading ? (
                            <TableSkeleton rows={4} columns={4} />
                        ) : error ? (
                            <EmptyState
                                icon={AlertTriangle}
                                title="Error al cargar"
                                description={error}
                                action={
                                    <Button variant="outline" size="sm" onClick={loadTags}>
                                        Reintentar
                                    </Button>
                                }
                            />
                        ) : filteredTags.length === 0 ? (
                            <EmptyState
                                icon={TagIcon}
                                title={searchTerm ? "Sin resultados" : "No hay etiquetas"}
                                description={
                                    searchTerm
                                        ? "No se encontraron etiquetas con ese nombre"
                                        : "Crea la primera etiqueta para clasificar tus procesos"
                                }
                                action={
                                    !searchTerm && (
                                        <Button onClick={handleOpenCreate} size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Crear etiqueta
                                        </Button>
                                    )
                                }
                            />
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[60px]">Color</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="w-[100px]">Procesos</TableHead>
                                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTags.map((tag) => (
                                            <TableRow key={tag.id}>
                                                <TableCell>
                                                    <div
                                                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                                        style={{ backgroundColor: tag.color }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        style={{
                                                            backgroundColor: tag.color,
                                                            color: "#fff",
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {tag._count?.processInstances ?? 0}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(tag)}
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleOpenDelete(tag)}
                                                            title="Eliminar"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Crear/Editar Etiqueta */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="w-full max-w-[300px]">
                    <DialogHeader>
                        <DialogTitle>{isCreating ? "Crear Etiqueta" : "Editar Etiqueta"}</DialogTitle>
                        <DialogDescription>
                            {isCreating ? "Ingresa los datos de la nueva etiqueta" : "Modifica los datos de la etiqueta"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <FormField
                            label="Nombre"
                            htmlFor="tag-name"
                            required
                            error={formErrors.name}
                        >
                            <Input
                                id="tag-name"
                                value={formName}
                                onChange={(e) => {
                                    setFormName(e.target.value);
                                    if (e.target.value.trim().length >= 2) {
                                        setFormErrors({});
                                    }
                                }}
                                placeholder="Ej: Urgente, Revisado"
                                className={formErrors.name ? "border-destructive" : ""}
                            />
                        </FormField>

                        <FormField label="Color" htmlFor="tag-color" required>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="tag-color"
                                        type="color"
                                        value={formColor}
                                        onChange={(e) => setFormColor(e.target.value)}
                                        className="w-16 h-8 p-1 cursor-pointer"
                                    />
                                    <Badge style={{ backgroundColor: formColor, color: "#fff" }}>
                                        {formName || "Vista previa"}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {TAG_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormColor(color.value)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${formColor === color.value
                                                ? "border-primary ring-2 ring-primary ring-offset-2"
                                                : "border-white shadow-sm"
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </FormField>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isCreating ? "Creando..." : "Guardando..."}
                                </>
                            ) : (
                                isCreating ? "Crear etiqueta" : "Guardar cambios"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación eliminar */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedTag && (
                                <>
                                    Estás a punto de eliminar la etiqueta{" "}
                                    <Badge
                                        style={{
                                            backgroundColor: selectedTag.color,
                                            color: "#fff",
                                        }}
                                    >
                                        {selectedTag.name}
                                    </Badge>
                                    . Esta acción no se puede deshacer y la etiqueta se removerá de
                                    todos los procesos que la tengan asignada.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={submitting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}