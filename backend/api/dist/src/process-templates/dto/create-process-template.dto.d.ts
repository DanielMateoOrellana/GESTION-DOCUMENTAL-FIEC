import { TemplateStepInput } from './template-step-input.dto';
export declare class CreateProcessTemplateDto {
    name: string;
    description: string;
    processTypeId: number;
    isActive?: boolean;
    steps?: TemplateStepInput[];
}
