import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface UploadDocumentModalProps {
  stepId: number;
  onClose: () => void;
}

export function UploadDocumentModal({ stepId, onClose }: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no debe superar los 10 MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setUploading(true);
    
    // Simulate file upload
    setTimeout(() => {
      const fileInfo = {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        hash: generateMockHash(),
      };

      console.log('Archivo subido:', fileInfo);
      toast.success('Archivo subido exitosamente');
      setUploading(false);
      onClose();
    }, 2000);
  };

  const generateMockHash = () => {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cargar Documento</DialogTitle>
          <DialogDescription>
            Sube el archivo correspondiente a este paso. Se generará automáticamente el hash SHA256 y la versión.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Archivo</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="w-12 h-12 mx-auto text-primary" />
                    <div>
                      <p className="text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} - {selectedFile.type || 'Tipo desconocido'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFile(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm">Haz clic para seleccionar un archivo</p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, Excel o ZIP (máx. 10 MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="space-y-2">
              <Label>Información del Archivo</Label>
              <div className="bg-secondary p-3 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span>{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamaño:</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo MIME:</span>
                  <span className="truncate ml-2">{selectedFile.type || 'application/octet-stream'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versión:</span>
                  <span>Automática (siguiente disponible)</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Nota:</strong> Al subir el archivo se generará automáticamente:
            </p>
            <ul className="text-xs text-blue-900 mt-1 ml-4 list-disc">
              <li>Hash SHA256 para verificación de integridad</li>
              <li>Número de versión incremental</li>
              <li>Registro en el log de auditoría</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Subir Archivo
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
