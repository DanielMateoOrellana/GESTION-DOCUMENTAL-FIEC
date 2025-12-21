import { IsArray, IsInt, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkExportDto {
    @IsArray()
    @ArrayMinSize(1, { message: 'Debe seleccionar al menos un proceso' })
    @Type(() => Number)
    @IsInt({ each: true })
    ids: number[];
}
