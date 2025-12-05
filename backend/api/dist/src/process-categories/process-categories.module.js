"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const process_categories_service_1 = require("./process-categories.service");
const process_categories_controller_1 = require("./process-categories.controller");
let ProcessCategoriesModule = class ProcessCategoriesModule {
};
exports.ProcessCategoriesModule = ProcessCategoriesModule;
exports.ProcessCategoriesModule = ProcessCategoriesModule = __decorate([
    (0, common_1.Module)({
        providers: [process_categories_service_1.ProcessCategoriesService],
        controllers: [process_categories_controller_1.ProcessCategoriesController]
    })
], ProcessCategoriesModule);
//# sourceMappingURL=process-categories.module.js.map