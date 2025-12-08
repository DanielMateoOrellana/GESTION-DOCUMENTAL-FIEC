import { useEffect, useMemo, useState } from 'react';
import { User } from '../types';
import {
  mockProcessTemplates,
  mockProcessInstances,
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
import { Label } from './ui/label';
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
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

interface ProcessTypesListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function ProcessTypesList({
  currentUser,
  onViewChange,
}: ProcessTypesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState(''); // id de categoría como string
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
  const [loading, setLoading] = useState(false);

  // Cargar categorías y tipos desde el backend
  useEffect(() => {
    const load = async () => {
      try {
        const [cats, types] = await Promise.all([
          fetchProcessCategories(),
          fetchProcessTypes(),
        ]);

        setCategories(cats);
        setProcessTypes(types);
      } catch (e) {
        console.error('[ProcessTypesList] Error cargando datos:', e);
        toast.error('Error cargando datos de tipos de proceso');
      }
    };

    load();
  }, []);

  // Normalizar processTypes a array seguro
  const safeProcessTypes: ApiProcessType[] = useMemo(() => {
    if (!Array.isArray(processTypes)) {
      console.error(
        '[ProcessTypesList] processTypes no es un array. Valor actual:',
        processTypes,
      );
      return [];
    }
    return processTypes;
  }, [processTypes]);

  const activeTypes = useMemo(
    () => safeProcessTypes.filter((t) => t.isActive),
    [safeProcessTypes],
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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error('Seleccione al menos un tipo de proceso');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} tipo(s) de proceso`);
  };

  const handleCreateProcessType = async () => {
    if (!newTypeName || !newTypeCategory || !newTypeDescription) {
      toast.error('Complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: newTypeName,
        description: newTypeDescription,
        categoryId: Number(newTypeCategory),
        isActive: true,
      };

      const created = await createProcessType(payload);

      setProcessTypes((prev: any) => {
        if (!Array.isArray(prev)) {
          return [created];
        }
        return [created, ...prev];
      });

      toast.success(`Tipo de proceso "${newTypeName}" creado`);
      setNewTypeName('');
      setNewTypeCategory('');
      setNewTypeDescription('');
      setShowCreateModal(false);
    } catch (e) {
      console.error('[ProcessTypesList] Error creando tipo de proceso:', e);
      toast.error('No se pudo crear el tipo de proceso');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProcessType = async () => {
    if (!editingType || !editTypeName || !editTypeCategory || !editTypeDescription) {
      toast.error('Complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: editTypeName,
        description: editTypeDescription,
        categoryId: Number(editTypeCategory),
        isActive: editTypeActive,
      };

      const updated = await updateProcessType(editingType.id, payload);

      setProcessTypes((prev: any) => {
        if (!Array.isArray(prev)) return [updated];
        return prev.map((p) => p.id === updated.id ? updated : p);
      });

      toast.success(`Tipo de proceso "${editTypeName}" actualizado`);
      setShowEditModal(false);
      setEditingType(null);
    } catch (e) {
      console.error('[ProcessTypesList] Error actualizando tipo de proceso:', e);
      toast.error('No se pudo actualizar el tipo de proceso');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (type: ApiProcessType) => {
    setEditingType(type);
    setEditTypeName(type.name);
    setEditTypeDescription(type.description);
    setEditTypeCategory(type.categoryId.toString());
    setEditTypeActive(type.isActive);
    setShowEditModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Tipos de proceso</h1>
          <p className="text-muted-foreground">
            Catálogo de tipos de procesos
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
                  (t) => t.process_type_id === type.id,
                ).length;
                const processesCount = mockProcessInstances.filter(
                  (p) => p.process_type_id === type.id,
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
                    <TableCell>{type.name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {type.description}
                    </TableCell>
                    <TableCell>
                      {type.category?.name ?? 'Sin categoría'}
                    </TableCell>
                    <TableCell>
                      {type.isActive ? 'Activo' : 'Inactivo'}
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

              {activeTypes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No hay tipos de proceso activos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear tipo de proceso</DialogTitle>
            <DialogDescription>
              Define un nuevo tipo de proceso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type-name">Nombre *</Label>
              <Input
                id="type-name"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="Evaluación Docente"
              />
            </div>
            <div>
              <Label htmlFor="type-category">Categoría *</Label>
              <Select
                value={newTypeCategory}
                onValueChange={setNewTypeCategory}
              >
                <SelectTrigger id="type-category">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-description">Descripción *</Label>
              <Textarea
                id="type-description"
                value={newTypeDescription}
                onChange={(e) =>
                  setNewTypeDescription(e.target.value)
                }
                placeholder="Describe el tipo de proceso"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateProcessType} disabled={loading}>
              {loading ? 'Guardando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>

      {/* Modal de Edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tipo de proceso</DialogTitle>
            <DialogDescription>
              Modifica los datos del tipo de proceso
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type-name">Nombre *</Label>
              <Input
                id="edit-type-name"
                value={editTypeName}
                onChange={(e) => setEditTypeName(e.target.value)}
                placeholder="Evaluación Docente"
              />
            </div>
            <div>
              <Label htmlFor="edit-type-category">Categoría *</Label>
              <Select
                value={editTypeCategory}
                onValueChange={setEditTypeCategory}
              >
                <SelectTrigger id="edit-type-category">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-type-description">Descripción *</Label>
              <Textarea
                id="edit-type-description"
                value={editTypeDescription}
                onChange={(e) =>
                  setEditTypeDescription(e.target.value)
                }
                placeholder="Describe el tipo de proceso"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-active"
                checked={editTypeActive}
                onCheckedChange={(c: boolean | "indeterminate") => setEditTypeActive(!!c)}
              />
              <Label htmlFor="edit-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateProcessType} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
