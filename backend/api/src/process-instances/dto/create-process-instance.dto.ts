import { IsInt, IsOptional, IsString, Min } from 'class-validator';

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
  responsibleUserId?: number;

  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsInt()
  month?: number; // 1-12
}
