import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class TemplateStepInput {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  responsibleRole?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  dueDaysFromStart?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}
