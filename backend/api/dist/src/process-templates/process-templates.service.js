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
exports.ProcessTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProcessTemplatesService = class ProcessTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        return this.prisma.processTemplate.create({
            data: {
                name: dto.name,
                description: dto.description,
                isActive: dto.isActive ?? true,
                processType: {
                    connect: { id: dto.processTypeId },
                },
                steps: dto.steps && dto.steps.length > 0
                    ? {
                        create: dto.steps.map((s) => ({
                            order: s.order,
                            name: s.name,
                            description: s.description,
                            responsibleRole: s.responsibleRole,
                            dueDaysFromStart: s.dueDaysFromStart,
                            isMandatory: s.isMandatory ?? true,
                        })),
                    }
                    : undefined,
            },
            include: {
                processType: {
                    include: {
                        category: true,
                    },
                },
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    findAll() {
        return this.prisma.processTemplate.findMany({
            include: {
                processType: {
                    include: {
                        category: true,
                    },
                },
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { id: 'asc' },
        });
    }
    async findOne(id) {
        const template = await this.prisma.processTemplate.findUnique({
            where: { id },
            include: {
                processType: {
                    include: {
                        category: true,
                    },
                },
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!template) {
            throw new common_1.NotFoundException(`ProcessTemplate #${id} not found`);
        }
        return template;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.processTemplate.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
                isActive: dto.isActive,
                processTypeId: dto.processTypeId,
            },
            include: {
                processType: {
                    include: {
                        category: true,
                    },
                },
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.processTemplate.delete({
            where: { id },
        });
    }
};
exports.ProcessTemplatesService = ProcessTemplatesService;
exports.ProcessTemplatesService = ProcessTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessTemplatesService);
//# sourceMappingURL=process-templates.service.js.map