"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessInstancesModule = void 0;
const common_1 = require("@nestjs/common");
const process_instances_service_1 = require("./process-instances.service");
const process_instances_controller_1 = require("./process-instances.controller");
let ProcessInstancesModule = class ProcessInstancesModule {
};
exports.ProcessInstancesModule = ProcessInstancesModule;
exports.ProcessInstancesModule = ProcessInstancesModule = __decorate([
    (0, common_1.Module)({
        providers: [process_instances_service_1.ProcessInstancesService],
        controllers: [process_instances_controller_1.ProcessInstancesController]
    })
], ProcessInstancesModule);
//# sourceMappingURL=process-instances.module.js.map