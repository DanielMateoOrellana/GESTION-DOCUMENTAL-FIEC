import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessTypeDto } from './create-process-type.dto';

export class UpdateProcessTypeDto extends PartialType(CreateProcessTypeDto) {}
