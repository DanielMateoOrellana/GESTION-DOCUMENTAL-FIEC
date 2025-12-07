import { IsInt, IsOptional, IsString, Min, IsISO8601 } from 'class-validator';

export class CreateProcessInstanceDto {
  @IsInt()
  processTypeId: number;

  @IsInt()
  templateId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsInt()
  @IsOptional()
  @IsInt()
  month?: number; // 1-12

  @IsOptional()
  @IsISO8601()
  dueAt?: string;
}
