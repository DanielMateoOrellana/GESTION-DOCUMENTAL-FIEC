import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Tag, ProcessTag, ProcessInstance, User } from '../types';
import { mockProcessInstances } from '../data/mockData';
import { TagIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TagManagerProps {
  currentUser: User;
  processId?: number;
  onTagsUpdated?: () => void;
}

// Mock tags
const mockTags: Tag[] = [
  { id: 1, name: 'Urgente', color: '#EF4444', created_by: 1, created_at: '2025-01-15T08:00:00Z' },
  { id: 2, name: 'Prioritario', color: '#F59E0B', created_by: 1, created_at: '2025-01-15T08:00:00Z' },
  { id: 3, name: 'Revisado', color: '#10B981', created_by: 1, created_at: '2025-01-15T08:00:00Z' },
  { id: 4, name: 'En Espera', color: '#6B7280', created_by: 2, created_at: '2025-02-10T10:00:00Z' },
  { id: 5, name: 'Completado', color: '#3B82F6', created_by: 1, created_at: '2025-03-05T14:00:00Z' }
];

const mockProcessTags: ProcessTag[] = [
  { process_instance_id: 1, tag_id: 1, created_at: '2025-10-01T08:00:00Z' },
  { process_instance_id: 1, tag_id: 2, created_at: '2025-10-01T08:00:00Z' },
  { process_instance_id: 2, tag_id: 3, created_at: '2025-09-25T08:00:00Z' },
  { process_instance_id: 3, tag_id: 5, created_at: '2025-08-01T08:00:00Z' }
];

const TAG_VALIDATION = {
  minLength: 2,
  maxLength: 20,
  pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/ // Only letters, numbers, and spaces
};

export function TagManager({ currentUser, processId, onTagsUpdated }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [processTags, setProcessTags] = useState<ProcessTag[]>(mockProcessTags);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [isManagingProcessTags, setIsManagingProcessTags] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(processId || null);

  const getTagsForProcess = (procId: number): Tag[] => {
    const tagIds = processTags.filter(pt => pt.process_instance_id === procId).map(pt => pt.tag_id);
    return tags.filter(t => tagIds.includes(t.id));
  };

  const validateTagName = (name: string): { valid: boolean; error?: string } => {
    if (!name || name.trim().length < TAG_VALIDATION.minLength) {
      return { 
        valid: false, 
        error: `La etiqueta debe tener al menos ${TAG_VALIDATION.minLength} caracteres` 
      };
    }

    if (name.trim().length > TAG_VALIDATION.maxLength) {
      return { 
        valid: false, 
        error: `La etiqueta no puede exceder ${TAG_VALIDATION.maxLength} caracteres` 
      };
    }

    if (!TAG_VALIDATION.pattern.test(name.trim())) {
      return { 
        valid: false, 
        error: 'La etiqueta solo puede contener letras, números y espacios' 
      };
    }

    // Check if tag already exists
    if (tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
      return { 
        valid: false, 
        error: 'Ya existe una etiqueta con este nombre' 
      };
    }

    return { valid: true };
  };

  const handleCreateTag = () => {
    const trimmedName = newTagName.trim();
    const validation = validateTagName(trimmedName);

    if (!validation.valid) {
      toast.error(validation.error || 'Error de validación');
      return;
    }

    const newTag: Tag = {
      id: Math.max(...tags.map(t => t.id), 0) + 1,
      name: trimmedName,
      color: newTagColor,
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    setTags([...tags, newTag]);
    toast.success('Etiqueta creada exitosamente');
    
    // Reset form
    setNewTagName('');
    setNewTagColor('#3B82F6');
    setIsCreatingTag(false);
  };

  const handleAddTagToProcess = (tagId: number) => {
    if (!selectedProcessId) return;

    // Check if tag is already assigned
    const exists = processTags.some(
      pt => pt.process_instance_id === selectedProcessId && pt.tag_id === tagId
    );

    if (exists) {
      toast.error('Esta etiqueta ya está asignada al proceso');
      return;
    }

    const newProcessTag: ProcessTag = {
      process_instance_id: selectedProcessId,
      tag_id: tagId,
      created_at: new Date().toISOString()
    };

    setProcessTags([...processTags, newProcessTag]);
    toast.success('Etiqueta asignada al proceso');
    
    if (onTagsUpdated) {
      onTagsUpdated();
    }
  };

  const handleRemoveTagFromProcess = (tagId: number) => {
    if (!selectedProcessId) return;

    setProcessTags(
      processTags.filter(
        pt => !(pt.process_instance_id === selectedProcessId && pt.tag_id === tagId)
      )
    );
    toast.success('Etiqueta removida del proceso');
    
    if (onTagsUpdated) {
      onTagsUpdated();
    }
  };

  const getProcessById = (id: number) => {
    return mockProcessInstances.find(p => p.id === id);
  };

  const selectedProcess = selectedProcessId ? getProcessById(selectedProcessId) : null;
  const assignedTags = selectedProcessId ? getTagsForProcess(selectedProcessId) : [];
  const availableTags = tags.filter(t => !assignedTags.find(at => at.id === t.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <TagIcon className="w-5 h-5" />
            Gestión de Etiquetas
          </h1>
          <p className="text-muted-foreground">
            Cree y asigne etiquetas para mejorar la clasificación de procesos
          </p>
        </div>
        <Button onClick={() => setIsCreatingTag(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Etiqueta
        </Button>
      </div>

      {/* All Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Etiquetas del Sistema</CardTitle>
          <CardDescription>
            Todas las etiquetas disponibles para asignar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                style={{ backgroundColor: tag.color, color: '#fff' }}
                className="cursor-pointer hover:opacity-80"
                onClick={() => {
                  setSelectedProcessId(null);
                  setIsManagingProcessTags(true);
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay etiquetas creadas. Cree la primera etiqueta.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processes with Tags */}
      {!processId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procesos Etiquetados</CardTitle>
            <CardDescription>
              Procesos que tienen etiquetas asignadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProcessInstances
                .filter(p => getTagsForProcess(p.id).length > 0)
                .map(process => {
                  const procTags = getTagsForProcess(process.id);
                  return (
                    <div
                      key={process.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary"
                    >
                      <div>
                        <div>{process.title || `Proceso #${process.id}`}</div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {procTags.map(tag => (
                            <Badge
                              key={tag.id}
                              style={{ backgroundColor: tag.color, color: '#fff' }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProcessId(process.id);
                          setIsManagingProcessTags(true);
                        }}
                      >
                        Gestionar
                      </Button>
                    </div>
                  );
                })}
              {mockProcessInstances.filter(p => getTagsForProcess(p.id).length > 0).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No hay procesos con etiquetas asignadas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Tag Dialog */}
      <Dialog open={isCreatingTag} onOpenChange={setIsCreatingTag}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Etiqueta</DialogTitle>
            <DialogDescription>
              Define una nueva etiqueta para clasificar procesos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Nombre de la Etiqueta *</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Ej: Urgente"
                maxLength={TAG_VALIDATION.maxLength}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {TAG_VALIDATION.minLength}-{TAG_VALIDATION.maxLength} caracteres. Solo letras, números y espacios.
              </p>
            </div>

            <div>
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="tag-color"
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Badge style={{ backgroundColor: newTagColor, color: '#fff' }}>
                  {newTagName || 'Vista Previa'}
                </Badge>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingTag(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTag}>
              Crear Etiqueta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Process Tags Dialog */}
      <Dialog open={isManagingProcessTags} onOpenChange={setIsManagingProcessTags}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestionar Etiquetas del Proceso</DialogTitle>
            <DialogDescription>
              {selectedProcess 
                ? `${selectedProcess.title || `Proceso #${selectedProcess.id}`}`
                : 'Seleccione un proceso'}
            </DialogDescription>
          </DialogHeader>

          {!selectedProcessId ? (
            <div className="space-y-3">
              <Label>Seleccione un Proceso</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {mockProcessInstances.filter(p => !p.archived).map(process => (
                  <div
                    key={process.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary cursor-pointer"
                    onClick={() => setSelectedProcessId(process.id)}
                  >
                    <div>
                      <div>{process.title || `Proceso #${process.id}`}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getTagsForProcess(process.id).map(tag => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color, color: '#fff' }}
                            className="text-xs"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Assigned Tags */}
              <div>
                <Label>Etiquetas Asignadas</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg min-h-[60px]">
                  {assignedTags.length > 0 ? (
                    assignedTags.map(tag => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color, color: '#fff' }}
                        className="flex items-center gap-1"
                      >
                        {tag.name}
                        <X
                          className="w-3 h-3 cursor-pointer hover:opacity-70"
                          onClick={() => handleRemoveTagFromProcess(tag.id)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay etiquetas asignadas
                    </p>
                  )}
                </div>
              </div>

              {/* Available Tags */}
              <div>
                <Label>Etiquetas Disponibles</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-lg min-h-[60px]">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color, color: '#fff' }}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleAddTagToProcess(tag.id)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Todas las etiquetas han sido asignadas
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsManagingProcessTags(false);
                setSelectedProcessId(processId || null);
              }}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
