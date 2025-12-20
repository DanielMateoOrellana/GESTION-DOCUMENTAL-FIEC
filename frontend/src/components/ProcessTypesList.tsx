import { useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import {
  mockProcessTemplates,
} from '../data/mockData';

import {
  fetchProcessCategories,
  ProcessCategory,
} from '../api/processCategories';
import {
  fetchProcessTypes,
  createProcessType,
  updateProcessType,
  ProcessType as ApiProcessType,
} from '../api/processTypes';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Plus, Edit, AlertTriangle, FolderTree, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';
import { FormField } from './ui/form-field';
import { EmptyState } from './ui/empty-state';
import { LoadingSpinner, TableSkeleton } from './ui/loading-spinner';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';

interface ProcessTypesListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

interface FormErrors {
  name?: string;
  category?: string;
  description?: string;
}

export function ProcessTypesList({
  currentUser,
  onViewChange,
}: ProcessTypesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');

  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState<ApiProcessType | null>(null);
  const [editTypeName, setEditTypeName] = useState('');
  const [editTypeCategory, setEditTypeCategory] = useState('');
  const [editTypeDescription, setEditTypeDescription] = useState('');
  const [editTypeActive, setEditTypeActive] = useState(true);

  const [categories, setCategories] = useState<ProcessCategory[]>([]);
  const [processTypes, setProcessTypes] = useState<ApiProcessType[] | any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form validation
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cargar categorías y tipos desde el backend
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cats, types] = await Promise.all([
        fetchProcessCategories(),
        fetchProcessTypes(),
      ]);
      setCategories(cats);
      setProcessTypes(types);
    } catch (e) {
      console.error('[ProcessTypesList] Error cargando datos:', e);
      setError('No se pudieron cargar los tipos de proceso. Por favor, intente nuevamente.');
      toast.error('Error cargando datos de tipos de proceso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Normalizar processTypes a array seguro
  const safeProcessTypes: ApiProcessType[] = useMemo(() => {
    if (!Array.isArray(processTypes)) {
      console.error('[ProcessTypesList] processTypes no es un array:', processTypes);
      return [];
    }
    return processTypes;
  }, [processTypes]);

  const activeTypes = useMemo(
    () => safeProcessTypes.filter((t) => t.isActive),
    [safeProcessTypes]
  );

  const allActiveSelected =
    activeTypes.length > 0 &&
    selectedItems.length === activeTypes.length;

  const handleSelectAll = () => {
    const activeIds = activeTypes.map((t) => t.id);
    if (selectedItems.length === activeIds.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(activeIds);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error('Seleccione al menos un tipo de proceso');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} tipo(s) de proceso`);
  };

  const validateCreateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!newTypeName.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (newTypeName.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!newTypeCategory) {
      errors.category = 'Seleccione una categoría';
    }

    if (!newTypeDescription.trim()) {
      errors.description = 'La descripción es requerida';
    } else if (newTypeDescription.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const errors: FormErrors = {};

    if (!editTypeName.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (editTypeName.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!editTypeCategory) {
      errors.category = 'Seleccione una categoría';
    }

    if (!editTypeDescription.trim()) {
      errors.description = 'La descripción es requerida';
    } else if (editTypeDescription.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProcessType = async () => {
    if (!validateCreateForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: newTypeName.trim(),
        description: newTypeDescription.trim(),
        categoryId: Number(newTypeCategory),
        isActive: true,
      };

      const created = await createProcessType(payload);

      setProcessTypes((prev: any) => {
        if (!Array.isArray(prev)) return [created];
        return [created, ...prev];
      });

      toast.success(`Tipo de proceso "${newTypeName}" creado`, {
        icon: <CheckCircle className="w-4 h-4" />,
      });
      resetCreateForm();
      setShowCreateModal(false);
    } catch (e: any) {
      console.error('[ProcessTypesList] Error creando tipo de proceso:', e);
      const errorMsg = e.response?.data?.message || 'No se pudo crear el tipo de proceso';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProcessType = async () => {
    if (!editingType) return;

    if (!validateEditForm()) {
      toast.error('Por favor corrija los errores en el formulario');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: editTypeName.trim(),
        description: editTypeDescription.trim(),
        categoryId: Number(editTypeCategory),
        isActive: editTypeActive,
      };

      const updated = await updateProcessType(editingType.id, payload);

      setProcessTypes((prev: any) => {
        if (!Array.isArray(prev)) return [updated];
        return prev.map((p) => (p.id === updated.id ? updated : p));
      });

      toast.success(`Tipo de proceso "${editTypeName}" actualizado`, {
        icon: <CheckCircle className="w-4 h-4" />,
      });
      setShowEditModal(false);
      setEditingType(null);
      resetEditForm();
    } catch (e: any) {
      console.error('[ProcessTypesList] Error actualizando tipo de proceso:', e);
      const errorMsg = e.response?.data?.message || 'No se pudo actualizar el tipo de proceso';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (type: ApiProcessType) => {
    setEditingType(type);
    setEditTypeName(type.name);
    setEditTypeDescription(type.description);
    setEditTypeCategory(type.categoryId.toString());
    setEditTypeActive(type.isActive);
    setEditErrors({});
    setShowEditModal(true);
  };

  const resetCreateForm = () => {
    setNewTypeName('');
    setNewTypeCategory('');
    setNewTypeDescription('');
    setCreateErrors({});
    setTouched({});
  };

  const resetEditForm = () => {
    setEditTypeName('');
    setEditTypeCategory('');
    setEditTypeDescription('');
    setEditTypeActive(true);
    setEditErrors({});
  };

  const handleCloseCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(false);
  };

  const handleCloseEditModal = () => {
    resetEditForm();
    setEditingType(null);
    setShowEditModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tipos de proceso</h1>
          <p className="text-muted-foreground">
            Catálogo de tipos de procesos institucionales
          </p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              Exportar seleccionados ({selectedItems.length})
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo tipo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de procesos ({activeTypes.length})</CardTitle>
          <CardDescription>
            Gestiona los tipos de proceso disponibles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : error ? (
            <EmptyState
              icon={AlertTriangle}
              title="Error al cargar datos"
              description={error}
              action={
                <Button variant="outline" onClick={loadData}>
                  Reintentar
                </Button>
              }
            />
          ) : activeTypes.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No hay tipos de proceso"
              description="Crea el primer tipo de proceso para comenzar a organizar tus procesos institucionales."
              action={
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear tipo de proceso
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allActiveSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plantillas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTypes.map((type) => {
                  const templatesCount = mockProcessTemplates.filter(
                    (t) => t.process_type_id === type.id
                  ).length;

                  return (
                    <TableRow key={type.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(type.id)}
                          onCheckedChange={() => handleSelectItem(type.id)}
                          aria-label={`Seleccionar ${type.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {type.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {type.category?.name ?? 'Sin categoría'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          type.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}>
                          {type.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{templatesCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(type)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseCreateModal}>
        {/* Ajuste de ancho aquí */}
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear tipo de proceso</DialogTitle>
            <DialogDescription>
              Define un nuevo tipo de proceso. Los campos marcados con * son requeridos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              label="Nombre"
              htmlFor="type-name"
              required
              error={createErrors.name}
            >
              <Input
                id="type-name"
                value={newTypeName}
                onChange={(e) => {
                  setNewTypeName(e.target.value);
                  if (e.target.value.trim().length >= 3) {
                    setCreateErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Evaluación Docente"
                className={cn(createErrors.name && "border-destructive")}
              />
            </FormField>

            <FormField
              label="Categoría"
              htmlFor="type-category"
              required
              error={createErrors.category}
            >
              <Select
                value={newTypeCategory}
                onValueChange={(val: string) => {
                  setNewTypeCategory(val);
                  setCreateErrors(prev => ({ ...prev, category: undefined }));
                }}
              >
                <SelectTrigger
                  id="type-category"
                  className={cn(createErrors.category && "border-destructive")}
                >
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No hay categorías disponibles
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Descripción"
              htmlFor="type-description"
              required
              error={createErrors.description}
              hint="Mínimo 10 caracteres"
            >
              <Textarea
                id="type-description"
                value={newTypeDescription}
                onChange={(e) => {
                  setNewTypeDescription(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setCreateErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe el tipo de proceso y su propósito..."
                rows={3}
                className={cn(createErrors.description && "border-destructive")}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProcessType} disabled={submitting}>
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creando...
                </>
              ) : (
                'Crear'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={showEditModal} onOpenChange={handleCloseEditModal}>
        {/* Ajuste de ancho aquí */}
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar tipo de proceso</DialogTitle>
            <DialogDescription>
              Modifica los datos del tipo de proceso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FormField
              label="Nombre"
              htmlFor="edit-type-name"
              required
              error={editErrors.name}
            >
              <Input
                id="edit-type-name"
                value={editTypeName}
                onChange={(e) => {
                  setEditTypeName(e.target.value);
                  if (e.target.value.trim().length >= 3) {
                    setEditErrors(prev => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="Evaluación Docente"
                className={cn(editErrors.name && "border-destructive")}
              />
            </FormField>

            <FormField
              label="Categoría"
              htmlFor="edit-type-category"
              required
              error={editErrors.category}
            >
              <Select
                value={editTypeCategory}
                onValueChange={(val: string) => {
                  setEditTypeCategory(val);
                  setEditErrors(prev => ({ ...prev, category: undefined }));
                }}
              >
                <SelectTrigger
                  id="edit-type-category"
                  className={cn(editErrors.category && "border-destructive")}
                >
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Descripción"
              htmlFor="edit-type-description"
              required
              error={editErrors.description}
            >
              <Textarea
                id="edit-type-description"
                value={editTypeDescription}
                onChange={(e) => {
                  setEditTypeDescription(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setEditErrors(prev => ({ ...prev, description: undefined }));
                  }
                }}
                placeholder="Describe el tipo de proceso"
                rows={3}
                className={cn(editErrors.description && "border-destructive")}
              />
            </FormField>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="edit-active"
                checked={editTypeActive}
                onCheckedChange={(c: boolean | "indeterminate") => setEditTypeActive(!!c)}
              />
              <label
                htmlFor="edit-active"
                className="text-sm font-medium cursor-pointer"
              >
                Tipo de proceso activo
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProcessType} disabled={submitting}>
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}