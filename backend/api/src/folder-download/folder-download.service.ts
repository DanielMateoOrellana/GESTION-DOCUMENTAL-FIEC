import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import archiver from 'archiver';
import { PassThrough } from 'stream';

type FolderType = 'category' | 'processType' | 'process' | 'step';

interface FileToZip {
    name: string;
    path: string;
    storageKey: string;
}

@Injectable()
export class FolderDownloadService {
    private readonly logger = new Logger(FolderDownloadService.name);

    constructor(
        private prisma: PrismaService,
        private r2Service: R2Service,
    ) { }

    async downloadFolder(type: FolderType, id: number): Promise<{ stream: PassThrough; filename: string }> {
        const files = await this.getFilesForFolder(type, id);
        const folderName = await this.getFolderName(type, id);

        if (files.length === 0) {
            throw new NotFoundException('No hay archivos para descargar en esta carpeta');
        }

        this.logger.log(`Generando ZIP para ${type} ${id} con ${files.length} archivos`);

        const passThrough = new PassThrough();
        const archive = archiver('zip', { zlib: { level: 5 } });

        archive.on('error', (err) => {
            this.logger.error('Error creando ZIP:', err);
            passThrough.destroy(err);
        });

        archive.pipe(passThrough);

        // Agregar archivos al ZIP de forma asíncrona
        this.addFilesToArchive(archive, files).then(() => {
            archive.finalize();
        }).catch((err) => {
            this.logger.error('Error agregando archivos:', err);
            archive.abort();
            passThrough.destroy(err);
        });

        const sanitizedName = folderName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s_-]/g, '').substring(0, 50);
        const filename = `${sanitizedName}.zip`;

        return { stream: passThrough, filename };
    }

    private async addFilesToArchive(archive: archiver.Archiver, files: FileToZip[]): Promise<void> {
        for (const file of files) {
            try {
                const buffer = await this.r2Service.getBuffer(file.storageKey);
                archive.append(buffer, { name: `${file.path}/${file.name}` });
            } catch (error) {
                this.logger.warn(`No se pudo agregar archivo ${file.name}: ${error.message}`);
            }
        }
    }

    private async getFilesForFolder(type: FolderType, id: number): Promise<FileToZip[]> {
        const files: FileToZip[] = [];

        switch (type) {
            case 'category': {
                // Obtener todos los archivos de todos los procesos de esta categoría
                const category = await this.prisma.processCategory.findUnique({
                    where: { id },
                    include: {
                        processTypes: {
                            include: {
                                processInstances: {
                                    include: {
                                        steps: {
                                            include: {
                                                files: true,
                                                templateStep: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                });

                if (!category) throw new NotFoundException('Categoría no encontrada');

                for (const pType of category.processTypes) {
                    for (const process of pType.processInstances) {
                        for (const step of process.steps) {
                            for (const file of step.files) {
                                files.push({
                                    name: file.originalName,
                                    path: `${pType.name}/${process.title}/${step.templateStep?.name || step.title}`,
                                    storageKey: file.storageKey,
                                });
                            }
                        }
                    }
                }
                break;
            }

            case 'processType': {
                // Obtener todos los archivos de todos los procesos de este tipo
                const processType = await this.prisma.processType.findUnique({
                    where: { id },
                    include: {
                        processInstances: {
                            include: {
                                steps: {
                                    include: {
                                        files: true,
                                        templateStep: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!processType) throw new NotFoundException('Tipo de proceso no encontrado');

                for (const process of processType.processInstances) {
                    for (const step of process.steps) {
                        for (const file of step.files) {
                            files.push({
                                name: file.originalName,
                                path: `${process.title}/${step.templateStep?.name || step.title}`,
                                storageKey: file.storageKey,
                            });
                        }
                    }
                }
                break;
            }

            case 'process': {
                // Obtener todos los archivos de este proceso
                const process = await this.prisma.processInstance.findUnique({
                    where: { id },
                    include: {
                        steps: {
                            include: {
                                files: true,
                                templateStep: true,
                            },
                        },
                    },
                });

                if (!process) throw new NotFoundException('Proceso no encontrado');

                for (const step of process.steps) {
                    for (const file of step.files) {
                        files.push({
                            name: file.originalName,
                            path: step.templateStep?.name || step.title,
                            storageKey: file.storageKey,
                        });
                    }
                }
                break;
            }

            case 'step': {
                // Obtener todos los archivos de este paso
                const step = await this.prisma.stepInstance.findUnique({
                    where: { id },
                    include: {
                        files: true,
                    },
                });

                if (!step) throw new NotFoundException('Paso no encontrado');

                for (const file of step.files) {
                    files.push({
                        name: file.originalName,
                        path: '',
                        storageKey: file.storageKey,
                    });
                }
                break;
            }
        }

        return files;
    }

    private async getFolderName(type: FolderType, id: number): Promise<string> {
        switch (type) {
            case 'category': {
                const cat = await this.prisma.processCategory.findUnique({ where: { id } });
                return cat?.name || `Categoria_${id}`;
            }
            case 'processType': {
                const pt = await this.prisma.processType.findUnique({ where: { id } });
                return pt?.name || `TipoProceso_${id}`;
            }
            case 'process': {
                const p = await this.prisma.processInstance.findUnique({ where: { id } });
                return p?.title || `Proceso_${id}`;
            }
            case 'step': {
                const s = await this.prisma.stepInstance.findUnique({ where: { id } });
                return s?.title || `Paso_${id}`;
            }
        }
    }

    async countFilesInFolder(type: FolderType, id: number): Promise<number> {
        const files = await this.getFilesForFolder(type, id);
        return files.length;
    }
}
