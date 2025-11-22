import { PartialType } from '@nestjs/mapped-types';
import { CreateProcessCategoryDto } from './create-process-category.dto';

export class UpdateProcessCategoryDto extends PartialType(
  CreateProcessCategoryDto,
) {}
