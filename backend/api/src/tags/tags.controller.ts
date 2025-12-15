import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    Req,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Get()
    findAll() {
        return this.tagsService.findAll();
    }

    // Rutas específicas PRIMERO antes de :id para evitar conflictos
    @Get('process/:processId')
    getTagsByProcess(@Param('processId', ParseIntPipe) processId: number) {
        return this.tagsService.getTagsByProcess(processId);
    }

    @Post('process/:processId/set')
    setProcessTags(
        @Param('processId', ParseIntPipe) processId: number,
        @Body('tagIds') tagIds: number[],
    ) {
        return this.tagsService.setProcessTags(processId, tagIds);
    }

    @Post('assign/:processId/:tagId')
    assignToProcess(
        @Param('processId', ParseIntPipe) processId: number,
        @Param('tagId', ParseIntPipe) tagId: number,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        return this.tagsService.assignToProcess(processId, tagId, userId);
    }

    @Delete('assign/:processId/:tagId')
    removeFromProcess(
        @Param('processId', ParseIntPipe) processId: number,
        @Param('tagId', ParseIntPipe) tagId: number,
        @Req() req: any,
    ) {
        const userId = req.user?.id;
        return this.tagsService.removeFromProcess(processId, tagId, userId);
    }

    // Rutas con :id AL FINAL
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tagsService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateTagDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.tagsService.create(dto, userId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto, @Req() req: any) {
        const userId = req.user?.id;
        return this.tagsService.update(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const userId = req.user?.id;
        return this.tagsService.remove(id, userId);
    }
}
