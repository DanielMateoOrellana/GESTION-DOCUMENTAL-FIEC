import { useState } from 'react';
import { ProcessType, User } from '../types';
import { mockProcessTypes, mockProcessTemplates, mockProcessInstances } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Checkbox } from './ui/checkbox';

interface ProcessTypesListProps {
  currentUser: User;
  onViewChange: (view: string, data?: any) => void;
}

export function ProcessTypesList({ currentUser, onViewChange }: ProcessTypesListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');

  const handleCreateProcessType = () => {
    if (!newTypeName || !newTypeCategory || !newTypeDescription) {
      toast.error('Complete todos los campos');
      return;
    }

    const newType: ProcessType = {
      id: Math.max(...mockProcessTypes.map(t => t.id)) + 1,
      code: newTypeName.toUpperCase().replace(/\s+/g, '_'),
      name: newTypeName,
      description: newTypeDescription,
      active: true,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    mockProcessTypes.push(newType);
    toast.success(`Tipo de proceso "${newTypeName}" creado`);
    
    setNewTypeName('');
    setNewTypeCategory('');
    setNewTypeDescription('');
    setShowCreateModal(false);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === mockProcessTypes.filter(t => t.active).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mockProcessTypes.filter(t => t.active).map(t => t.id));
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast.error('Seleccione al menos un tipo de proceso');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} tipo(s) de proceso`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Tipos de proceso</h1>
          <p className="text-muted-foreground">Catálogo de tipos de procesos</p>
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
          <CardTitle>Tipos de procesos ({mockProcessTypes.filter(t => t.active).length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === mockProcessTypes.filter(t => t.active).length}
                    onCheckedChange={handleSelectAll}
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
              {mockProcessTypes.filter(t => t.active).map(type => {
                const templatesCount = mockProcessTemplates.filter(t => t.process_type_id === type.id).length;
                const processesCount = mockProcessInstances.filter(p => p.process_type_id === type.id).length;
                
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(type.id)}
                        onCheckedChange={() => handleSelectItem(type.id)}
                      />
                    </TableCell>
                    <TableCell>{type.name}</TableCell>
                    <TableCell className="max-w-md truncate">{type.description}</TableCell>
                    <TableCell>Docencia</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell>{templatesCount}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear tipo de proceso</DialogTitle>
            <DialogDescription>Define un nuevo tipo de proceso</DialogDescription>
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
              <Select value={newTypeCategory} onValueChange={setNewTypeCategory}>
                <SelectTrigger id="type-category">
                  <SelectValue placeholder="Seleccione categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docencia">Docencia</SelectItem>
                  <SelectItem value="investigacion">Investigación</SelectItem>
                  <SelectItem value="gestion">Gestión</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-description">Descripción *</Label>
              <Textarea
                id="type-description"
                value={newTypeDescription}
                onChange={(e) => setNewTypeDescription(e.target.value)}
                placeholder="Describe el tipo de proceso"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProcessType}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}