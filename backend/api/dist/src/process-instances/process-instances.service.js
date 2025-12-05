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
exports.ProcessInstancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProcessInstancesService = class ProcessInstancesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const template = await this.prisma.processTemplate.findUnique({
            where: { id: dto.templateId },
            include: { steps: { orderBy: { order: 'asc' } } },
        });
        if (!template) {
            throw new common_1.NotFoundException(`La plantilla #${dto.templateId} no existe`);
        }
        if (template.processTypeId !== dto.processTypeId) {
            throw new common_1.NotFoundException(`La plantilla #${dto.templateId} no pertenece al tipo de proceso #${dto.processTypeId}`);
        }
        return this.prisma.processInstance.create({
            data: {
                title: dto.title,
                estado: client_1.EstadoProceso.PENDIENTE,
                processTypeId: dto.processTypeId,
                templateId: dto.templateId,
                comment: dto.comment ?? null,
                responsibleUserId: userId,
                year: dto.year ?? null,
                month: dto.month ?? null,
                steps: {
                    create: template.steps.map((s) => ({
                        title: s.name,
                        estado: client_1.EstadoPaso.PENDIENTE,
                        templateStepId: s.id,
                    })),
                },
            },
            include: {
                processType: true,
                template: true,
                steps: {
                    orderBy: { id: 'asc' },
                },
            },
        });
    }
    findAll() {
        return this.prisma.processInstance.findMany({
            include: {
                processType: true,
                template: true,
                steps: true,
            },
            orderBy: { id: 'desc' },
        });
    }
    async findOne(id) {
        const instance = await this.prisma.processInstance.findUnique({
            where: { id },
            include: {
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
            throw new common_1.NotFoundException(`Instancia de proceso #${id} no encontrada`);
        }
        return instance;
    }
};
exports.ProcessInstancesService = ProcessInstancesService;
exports.ProcessInstancesService = ProcessInstancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessInstancesService);
//# sourceMappingURL=process-instances.service.js.map