import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Edit, Eye } from 'lucide-react';
import { ProcessTemplate, User } from '../types';
import { mockProcessTemplates, mockStepTemplates, mockProcessTypes, getProcessTypeById } from '../data/mockData';
import { toast } from 'sonner@2.0.3';
import { CreateTemplateModal } from './CreateTemplateModal';

interface TemplateManagerSimpleProps {
  currentUser: User;
}

export function TemplateManagerSimple({ currentUser }: TemplateManagerSimpleProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredTemplates = mockProcessTemplates.filter(template => {
    const matchesType = filterType === 'all' || template.process_type_id.toString() === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && template.is_active) ||
      (filterStatus === 'obsolete' && !template.is_active);
    return matchesType && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredTemplates.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTemplates.map(t => t.id));
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
      toast.error('Seleccione al menos una plantilla');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} plantilla(s)`);
  };

  const getStepCount = (templateId: number) => {
    return mockStepTemplates.filter(s => s.template_id === templateId).length;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Plantillas</h1>
          <p className="text-muted-foreground">Gestión de plantillas de procesos</p>
        </div>
        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              Exportar seleccionados ({selectedItems.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva plantilla
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de proceso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {mockProcessTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="obsolete">Obsoleta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Plantillas */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas ({filteredTemplates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.length === filteredTemplates.length && filteredTemplates.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo de proceso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pasos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map(template => {
                const processType = getProcessTypeById(template.process_type_id);
                const stepCount = getStepCount(template.id);

                return (
                  <TableRow key={template.id}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(template.id)}
                        onCheckedChange={() => handleSelectItem(template.id)}
                      />
                    </TableCell>
                    <TableCell>{processType?.name} - Plantilla</TableCell>
                    <TableCell className="max-w-md truncate">{template.description}</TableCell>
                    <TableCell>{processType?.name}</TableCell>
                    <TableCell>
                      <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {template.is_active ? 'Activa' : 'Obsoleta'}
                      </Badge>
                    </TableCell>
                    <TableCell>{stepCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron plantillas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Creación de Plantilla */}
      <CreateTemplateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}