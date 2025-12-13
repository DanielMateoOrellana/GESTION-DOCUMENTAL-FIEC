// frontend/src/components/UploadDocumentModal.tsx
import { useState, type ChangeEvent, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { File, Upload, X, CheckCircle, AlertCircle, FileWarning } from 'lucide-react';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { uploadStepFile } from '../api/stepFiles';
import { Progress } from './ui/progress';
import { cn } from './ui/utils';

interface UploadDocumentModalProps {
  stepId: number;
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadDocumentModal({
  stepId,
  open,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `El archivo supera el límite de ${MAX_FILE_SIZE_MB} MB. Tamaño actual: ${formatFileSize(file.size)}`;
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Tipo de archivo no permitido. Use: ${ALLOWED_EXTENSIONS.join(', ')}`;
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'El archivo está vacío';
    }

    return null;
  }, []);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileError(null);
    setUploadStatus('validating');

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setUploadStatus('error');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();

    // Could expand this to show different icons for different file types
    return <File className="w-12 h-12 mx-auto text-primary" />;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setFileError('Por favor selecciona un archivo');
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadProgress(0);

      // Simulate progress for better UX (actual upload might be fast)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await uploadStepFile(stepId, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');

      toast.success('Archivo subido exitosamente', {
        description: selectedFile.name,
        icon: <CheckCircle className="w-4 h-4" />,
      });

      // Brief delay to show success state
      setTimeout(() => {
        onUploaded?.();
        handleClose();
      }, 1000);

    } catch (error: any) {
      console.error('[UploadDocumentModal] Error subiendo archivo', error);
      setUploadStatus('error');

      // Handle specific error messages
      const errorMessage = error.response?.data?.message || 'No se pudo subir el archivo';
      setFileError(errorMessage);
      toast.error('Error al subir archivo', {
        description: errorMessage,
      });
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setFileError(null);
    setIsDragOver(false);
    onClose();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    setFileError(null);
    setUploadStatus('idle');
  };

  const isUploading = uploadStatus === 'uploading';
  const isSuccess = uploadStatus === 'success';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cargar Documento</DialogTitle>
          <DialogDescription>
            Sube el archivo correspondiente a este paso. Se registrará la versión automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Archivo</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
                isDragOver && "border-primary bg-primary/5",
                fileError && "border-destructive bg-destructive/5",
                isSuccess && "border-green-500 bg-green-50",
                !isDragOver && !fileError && !isSuccess && "hover:border-primary hover:bg-muted/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={ALLOWED_EXTENSIONS.join(',')}
                disabled={isUploading || isSuccess}
              />
              <label htmlFor="file-upload" className={cn("cursor-pointer", (isUploading || isSuccess) && "cursor-not-allowed")}>
                {isSuccess ? (
                  <div className="space-y-2 py-2">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                    <p className="font-medium text-green-700">¡Archivo subido exitosamente!</p>
                    <p className="text-sm text-green-600">{selectedFile?.name}</p>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-2">
                    {getFileIcon()}
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Tipo desconocido'}
                      </p>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    )}
                  </div>
                ) : fileError ? (
                  <div className="space-y-2 py-2">
                    <FileWarning className="w-12 h-12 mx-auto text-destructive" />
                    <p className="text-sm text-destructive font-medium">Error de validación</p>
                    <p className="text-xs text-destructive">{fileError}</p>
                    <p className="text-xs text-muted-foreground mt-2">Haz clic para seleccionar otro archivo</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <Upload className={cn(
                      "w-12 h-12 mx-auto transition-colors",
                      isDragOver ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <p className="font-medium text-sm">
                        {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra o haz clic para seleccionar'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, Word, Excel, ZIP o imágenes (máx. {MAX_FILE_SIZE_MB} MB)
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subiendo archivo...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File Info Card */}
          {selectedFile && !fileError && !isSuccess && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Información del Archivo</Label>
              <div className="bg-secondary p-3 rounded-lg space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tamaño:</span>
                  <span className={cn(
                    "font-medium",
                    selectedFile.size > MAX_FILE_SIZE_BYTES * 0.8 && "text-yellow-600"
                  )}>
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="truncate ml-2">{selectedFile.type || 'application/octet-stream'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="text-primary font-medium">Automática (siguiente disponible)</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
            <p className="text-xs text-blue-900 dark:text-blue-100 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Nota:</strong> Al subir el archivo se registrará automáticamente el nombre original,
                tipo MIME, tamaño, número de versión y el usuario que lo subió.
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {isSuccess ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isSuccess && (
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || !!fileError}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4 animate-bounce" />
                  Subiendo...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Subir Archivo
                </span>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
