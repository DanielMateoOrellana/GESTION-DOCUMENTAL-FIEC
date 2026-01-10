import { IsInt, IsOptional } from 'class-validator';

export class AssignStepDto {
    @IsInt()
    assignedToId: number;
}

export class UpdateResponsibleDto {
    @IsInt()
    @IsOptional()
    responsibleUserId?: number;
}
