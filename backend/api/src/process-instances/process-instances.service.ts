import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessInstanceDto } from './dto/create-process-instance.dto';
import { EstadoProceso, EstadoPaso } from '@prisma/client';
import { AuditLogService, AuditActions, EntityTypes } from '../audit-log/audit-log.service';

@Injectable()
export class ProcessInstancesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) { }

  async create(dto: CreateProcessInstanceDto, userId: number) {
    // 1) Buscar la plantilla con sus pasos
    const template = await this.prisma.processTemplate.findUnique({
      where: { id: dto.templateId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!template) {
      throw new NotFoundException(`La plantilla #${dto.templateId} no existe`);
    }

    // 2) Validar que la plantilla pertenezca al tipo de proceso enviado
    if (template.processTypeId !== dto.processTypeId) {
      throw new NotFoundException(
        `La plantilla #${dto.templateId} no pertenece al tipo de proceso #${dto.processTypeId}`,
      );
    }

    // 3) Crear la instancia de proceso + sus pasos
    const instance = await this.prisma.processInstance.create({
      data: {
        title: dto.title,
        estado: EstadoProceso.PENDIENTE,
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        comment: dto.comment ?? null,
        createdById: userId, // Quién creó el proceso
        responsibleUserId: userId, // Responsable inicial = creador
        year: dto.year ?? null,
        month: dto.month ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        steps: {
          create: template.steps.map((s) => ({
            title: s.name,
            estado: EstadoPaso.PENDIENTE,
            templateStepId: s.id,
            dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          })),
        },
      },
      include: {
        processType: true,
        template: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        steps: {
          orderBy: { id: 'asc' },
        },
      },
    });

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_INSTANCE,
      entityId: instance.id,
      description: `Proceso "${instance.title || `Proceso #${instance.id}`}" creado`,
      details: {
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        year: dto.year,
        stepsCount: template.steps.length,
      },
      userId,
    });

    return instance;
  }

  findAll() {
    return this.prisma.processInstance.findMany({
      include: {
        processType: true,
        template: true,
        steps: {
          orderBy: { id: 'asc' }
        },
        responsibleUser: true,
        // tags removido de aquí
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const instance = await this.prisma.processInstance.findUnique({
      where: { id },
      include: {
        responsibleUser: true,
        processType: true,
        template: {
          include: { processType: true },
        },
        steps: {
          include: {
            templateStep: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException(
        `Instancia de proceso #${id} no encontrada`,
      );
    }

    return instance;
  }

  /**
   * Genera un archivo ZIP con todos los archivos del expediente.
   * Estructura: NombreProceso/NombrePaso/NombreArchivo
   */
  async generateZip(id: number, res: any): Promise<void> {
    // Importar archiver dinámicamente para evitar problemas de ESM
    const archiver = await import('archiver');

    // Obtener el proceso con sus pasos y archivos
    const instance = await this.prisma.processInstance.findUnique({
      where: { id },
      include: {
        processType: true,
        template: true,
        steps: {
          include: {
            files: true,
            templateStep: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!instance) {
      throw new NotFoundException(`Proceso #${id} no encontrado`);
    }

    // Sanitizar nombre para evitar errores de ruta
    const sanitizeName = (name: string): string => {
      return name
        .replace(/[<>:"/\\|?*]/g, '_')  // Caracteres inválidos en Windows
        .replace(/\s+/g, '_')            // Espacios por guiones bajos
        .substring(0, 100);               // Limitar longitud
    };

    const processName = sanitizeName(
      instance.title || instance.template?.name || `Proceso_${instance.id}`
    );

    // Crear el archivo ZIP
    const archive = archiver.default('zip', {
      zlib: { level: 9 }, // Máxima compresión
    });

    // Manejar errores del archivo
    archive.on('error', (err: Error) => {
      throw err;
    });

    // Pipe el archivo al response
    archive.pipe(res);

    // Variable para contar archivos añadidos
    let filesAdded = 0;

    // Agregar archivos al ZIP
    for (const step of instance.steps) {
      const stepName = sanitizeName(
        step.templateStep?.name || step.title || `Paso_${step.id}`
      );

      for (const file of step.files) {
        const fileName = sanitizeName(file.originalName);
        const filePath = `${processName}/${stepName}/${fileName}`;

        // Añadir el buffer del archivo al ZIP
        archive.append(Buffer.from(file.content), { name: filePath });
        filesAdded++;
      }
    }

    // Si no hay archivos, añadir un archivo README
    if (filesAdded === 0) {
      const readmeContent = `Expediente: ${instance.title || `Proceso #${instance.id}`}\n\nEste expediente no contiene archivos adjuntos.`;
      archive.append(readmeContent, { name: `${processName}/README.txt` });
    }

    // Finalizar el archivo
    await archive.finalize();
  }

  /**
   * Importa un proceso desde un archivo ZIP.
   * Estructura esperada: NombreProceso/NombrePaso/Archivo.ext
   */
  async importZip(
    file: Express.Multer.File,
    dto: {
      processTypeId: number;
      templateId: number;
      title?: string;
      year?: number;
    },
    userId: number,
  ) {
    // Importar adm-zip dinámicamente
    const AdmZip = (await import('adm-zip')).default;

    // Leer el archivo ZIP desde el buffer
    const zip = new AdmZip(file.buffer);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      throw new NotFoundException('El archivo ZIP está vacío');
    }

    // Buscar la plantilla con sus pasos
    const template = await this.prisma.processTemplate.findUnique({
      where: { id: dto.templateId },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!template) {
      throw new NotFoundException(`La plantilla #${dto.templateId} no existe`);
    }

    if (template.processTypeId !== dto.processTypeId) {
      throw new NotFoundException(
        `La plantilla #${dto.templateId} no pertenece al tipo de proceso #${dto.processTypeId}`,
      );
    }

    // Detectar el nombre de la carpeta raíz del ZIP para usarlo como título
    let rootFolderName: string | null = null;
    for (const entry of entries) {
      const parts = entry.entryName.split('/').filter((p) => p.length > 0);
      if (parts.length > 0) {
        rootFolderName = parts[0];
        break;
      }
    }

    // Título del proceso: usar el proporcionado, o el nombre de la carpeta raíz, o genérico
    const processTitle =
      dto.title ||
      rootFolderName?.replace(/_/g, ' ') ||
      `Importación ${new Date().toLocaleDateString('es-ES')}`;

    // Crear la instancia de proceso
    const instance = await this.prisma.processInstance.create({
      data: {
        title: processTitle,
        estado: EstadoProceso.PENDIENTE,
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        createdById: userId,
        responsibleUserId: userId,
        year: dto.year ?? new Date().getFullYear(),
        month: null,
        steps: {
          create: template.steps.map((s) => ({
            title: s.name,
            estado: EstadoPaso.PENDIENTE,
            templateStepId: s.id,
          })),
        },
      },
      include: {
        processType: true,
        template: true,
        steps: {
          include: { templateStep: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    // Función para normalizar nombres (para comparación)
    const normalizeName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[<>:"/\\|?*_\-]/g, '') // Quitar caracteres especiales
        .replace(/\s+/g, '')              // Quitar espacios
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
    };

    // Mapear los pasos creados por nombre normalizado
    const stepsByNormalizedName = new Map<string, typeof instance.steps[0]>();
    for (const step of instance.steps) {
      const normalizedTitle = normalizeName(step.title);
      stepsByNormalizedName.set(normalizedTitle, step);

      // También mapear por el nombre del paso de la plantilla
      if (step.templateStep?.name) {
        const normalizedTemplateName = normalizeName(step.templateStep.name);
        stepsByNormalizedName.set(normalizedTemplateName, step);
      }
    }

    // Estadísticas de importación
    let filesImported = 0;
    let filesSkipped = 0;

    // Procesar cada archivo del ZIP
    for (const entry of entries) {
      // Ignorar directorios
      if (entry.isDirectory) continue;

      const parts = entry.entryName.split('/').filter((p) => p.length > 0);

      // Necesitamos al menos: carpeta_raiz/carpeta_paso/archivo
      if (parts.length < 3) {
        filesSkipped++;
        continue;
      }

      // Estructura: parts[0]=NombreProceso, parts[1]=NombrePaso, parts[2...]=NombreArchivo
      const stepFolderName = parts[1];
      const fileName = parts.slice(2).join('/'); // En caso de subcarpetas adicionales

      // Buscar el paso correspondiente
      const normalizedStepFolder = normalizeName(stepFolderName);
      const matchedStep = stepsByNormalizedName.get(normalizedStepFolder);

      if (!matchedStep) {
        // No se encontró coincidencia, intentar búsqueda más flexible
        let foundStep: typeof instance.steps[0] | undefined = undefined;

        for (const step of instance.steps) {
          const stepNormalized = normalizeName(step.title);
          const folderNormalized = normalizedStepFolder;

          // Verificar si uno contiene al otro
          if (stepNormalized.includes(folderNormalized) || folderNormalized.includes(stepNormalized)) {
            foundStep = step;
            break;
          }
        }

        if (!foundStep) {
          filesSkipped++;
          continue;
        }

        // Guardar el archivo en el paso encontrado
        const fileContent = entry.getData();
        await this.prisma.stepFile.create({
          data: {
            stepId: foundStep.id,
            originalName: fileName || entry.name,
            mimeType: this.getMimeType(fileName || entry.name),
            sizeBytes: fileContent.length,
            version: 1,
            content: Uint8Array.from(fileContent),
            uploadedById: userId,
          },
        });
        filesImported++;
      } else {
        // Guardar el archivo en el paso coincidente
        const fileContent = entry.getData();
        await this.prisma.stepFile.create({
          data: {
            stepId: matchedStep.id,
            originalName: fileName || entry.name,
            mimeType: this.getMimeType(fileName || entry.name),
            sizeBytes: fileContent.length,
            version: 1,
            content: Uint8Array.from(fileContent),
            uploadedById: userId,
          },
        });
        filesImported++;
      }
    }

    // Registrar en bitácora
    await this.auditLog.log({
      action: AuditActions.CREATE,
      entityType: EntityTypes.PROCESS_INSTANCE,
      entityId: instance.id,
      description: `Proceso "${instance.title}" importado desde ZIP`,
      details: {
        processTypeId: dto.processTypeId,
        templateId: dto.templateId,
        filesImported,
        filesSkipped,
        source: 'ZIP Import',
      },
      userId,
    });

    // Retornar el proceso creado con estadísticas
    return {
      process: instance,
      stats: {
        filesImported,
        filesSkipped,
        stepsCreated: instance.steps.length,
      },
    };
  }

  /**
   * Determina el tipo MIME basado en la extensión del archivo
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      txt: 'text/plain',
      csv: 'text/csv',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}