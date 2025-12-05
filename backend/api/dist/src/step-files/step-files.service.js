"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepFilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StepFilesService = class StepFilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upload(stepId, file, userId) {
        const last = await this.prisma.stepFile.findFirst({
            where: { stepId },
            orderBy: { version: 'desc' },
        });
        const version = (last?.version ?? 0) + 1;
        const created = await this.prisma.stepFile.create({
            data: {
                stepId,
                originalName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
                version,
                content: new Uint8Array(file.buffer),
                uploadedById: userId,
            },
        });
        const { content, ...rest } = created;
        return rest;
    }
    async listByStep(stepId) {
        return this.prisma.stepFile.findMany({
            where: { stepId },
            orderBy: { version: 'desc' },
            select: {
                id: true,
                stepId: true,
                originalName: true,
                mimeType: true,
                sizeBytes: true,
                version: true,
                uploadedAt: true,
                uploadedById: true,
            },
        });
    }
    async getFile(stepId, fileId) {
        const file = await this.prisma.stepFile.findFirst({
            where: { id: fileId, stepId },
        });
        if (!file) {
            throw new common_1.NotFoundException('Archivo no encontrado');
        }
        return file;
    }
};
exports.StepFilesService = StepFilesService;
exports.StepFilesService = StepFilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StepFilesService);
//# sourceMappingURL=step-files.service.js.map