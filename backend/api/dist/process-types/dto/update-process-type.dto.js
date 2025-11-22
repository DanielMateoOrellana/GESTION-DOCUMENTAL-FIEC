"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProcessTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_process_type_dto_1 = require("./create-process-type.dto");
class UpdateProcessTypeDto extends (0, mapped_types_1.PartialType)(create_process_type_dto_1.CreateProcessTypeDto) {
}
exports.UpdateProcessTypeDto = UpdateProcessTypeDto;
//# sourceMappingURL=update-process-type.dto.js.map