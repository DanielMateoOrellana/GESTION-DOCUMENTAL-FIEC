import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateTagDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    color: string;
}

export class UpdateTagDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    color?: string;
}

export class AssignTagDto {
    @IsNotEmpty()
    @IsInt()
    processInstanceId: number;

    @IsNotEmpty()
    @IsInt()
    tagId: number;
}
