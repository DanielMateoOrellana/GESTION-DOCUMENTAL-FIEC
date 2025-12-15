import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    async findAll(
        @Query('action') action?: string,
        @Query('entityType') entityType?: string,
        @Query('userId') userId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        return this.auditLogService.findAll({
            action,
            entityType,
            userId: userId ? parseInt(userId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit: limit ? parseInt(limit) : 100,
            offset: offset ? parseInt(offset) : 0,
        });
    }

    @Get('stats')
    async getStats() {
        return this.auditLogService.getStats();
    }

    @Get('action-types')
    async getActionTypes() {
        return this.auditLogService.getActionTypes();
    }

    @Get('entity-types')
    async getEntityTypes() {
        return this.auditLogService.getEntityTypes();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.auditLogService.findOne(id);
    }
}
