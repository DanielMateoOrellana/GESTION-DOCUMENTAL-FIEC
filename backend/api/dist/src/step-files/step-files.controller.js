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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepFilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const step_files_service_1 = require("./step-files.service");
let StepFilesController = class StepFilesController {
    stepFilesService;
    constructor(stepFilesService) {
        this.stepFilesService = stepFilesService;
    }
    async uploadFile(stepId, file, req) {
        if (!file) {
            throw new common_1.BadRequestException('Se requiere un archivo (campo "file")');
        }
        const userId = req.user?.id;
        return this.stepFilesService.upload(stepId, file, userId);
    }
    async listFiles(stepId) {
        return this.stepFilesService.listByStep(stepId);
    }
    async downloadFile(stepId, fileId, res) {
        const file = await this.stepFilesService.getFile(stepId, fileId);
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
        res.send(Buffer.from(file.content));
    }
    async deleteFile(stepId, fileId) {
        await this.stepFilesService.deleteFile(stepId, fileId);
        return { success: true };
    }
};
exports.StepFilesController = StepFilesController;
__decorate([
    (0, common_1.Post)(':stepId/files'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.memoryStorage)(),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('stepId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], StepFilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(':stepId/files'),
    __param(0, (0, common_1.Param)('stepId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StepFilesController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)(':stepId/files/:fileId'),
    __param(0, (0, common_1.Param)('stepId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], StepFilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)(':stepId/files/:fileId'),
    __param(0, (0, common_1.Param)('stepId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StepFilesController.prototype, "deleteFile", null);
exports.StepFilesController = StepFilesController = __decorate([
    (0, common_1.Controller)('steps'),
    __metadata("design:paramtypes", [step_files_service_1.StepFilesService])
], StepFilesController);
//# sourceMappingURL=step-files.controller.js.map