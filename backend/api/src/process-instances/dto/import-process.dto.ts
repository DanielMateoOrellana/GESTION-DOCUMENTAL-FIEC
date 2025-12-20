import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportProcessDto {
    @Type(() => Number)
    @IsInt()
    processTypeId: number;

    @Type(() => Number)
    @IsInt()
    templateId: number;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    year?: number;
}
