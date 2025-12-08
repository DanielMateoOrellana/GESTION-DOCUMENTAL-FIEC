import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Plus, Edit, Eye } from 'lucide-react';
import type { User } from '../types';
import { toast } from 'sonner';
import { CreateTemplateModal } from './CreateTemplateModal';
import { EditTemplateModal } from './EditTemplateModal';

import {
  fetchProcessTemplates,
  type ProcessTemplate,
} from '../api/processTemplates';
import { fetchProcessTypes, type ProcessType } from '../api/processTypes';

interface TemplateManagerSimpleProps {
  currentUser: User;
}

export function TemplateManagerSimple({ currentUser }: TemplateManagerSimpleProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, typesData] = await Promise.all([
        fetchProcessTemplates(),
        fetchProcessTypes()
      ]);
      setTemplates(templatesData);
      setProcessTypes(typesData);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTemplates = templates.filter((template) => {
    const matchesType =
      filterType === 'all' ||
      template.processTypeId.toString() === filterType;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && template.isActive) ||
      (filterStatus === 'obsolete' && !template.isActive);

    return matchesType && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredTemplates.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTemplates.map((t) => t.id));
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
      toast.error('Seleccione al menos una plantilla');
      return;
    }
    toast.success(`Exportando ${selectedItems.length} plantilla(s)`);
  };

  const getStepCount = (templateId: number) => {
    const tpl = templates.find((t) => t.id === templateId);
    return tpl?.steps?.length ?? 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Plantillas</h1>
          <p className="text-muted-foreground">
            Gestión de plantillas de procesos
          </p>
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
                {processTypes.map((type) => (
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
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Cargando plantillas...
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedItems.length === filteredTemplates.length &&
                          filteredTemplates.length > 0
                        }
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
                  {filteredTemplates.map((template) => {
                    const stepCount = getStepCount(template.id);
                    const processTypeName =
                      template.processType?.name ?? 'Sin tipo';

                    return (
                      <TableRow key={template.id}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.includes(template.id)}
                            onCheckedChange={() =>
                              handleSelectItem(template.id)
                            }
                          />
                        </TableCell>

                        {/* Nombre real de la plantilla */}
                        <TableCell>{template.name}</TableCell>

                        <TableCell className="max-w-md truncate">
                          {template.description}
                        </TableCell>

                        {/* Tipo de proceso desde backend */}
                        <TableCell>{processTypeName}</TableCell>

                        <TableCell>
                          <Badge
                            className={
                              template.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {template.isActive ? 'Activa' : 'Obsoleta'}
                          </Badge>
                        </TableCell>

                        <TableCell>{stepCount}</TableCell>

                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTemplateId(template.id);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredTemplates.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No se encontraron plantillas</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Creación de Plantilla */}
      <CreateTemplateModal
        open={isCreateModalOpen}
        onClose={async () => {
          setIsCreateModalOpen(false);
          await loadData();
        }}
      />

      {/* Modal de Edición de Plantilla */}
      <EditTemplateModal
        open={isEditModalOpen}
        templateId={editingTemplateId}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTemplateId(null);
        }}
        onTemplateUpdated={loadData}
      />
    </div>
  );
}
