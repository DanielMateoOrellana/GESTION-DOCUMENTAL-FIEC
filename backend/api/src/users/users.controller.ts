import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMINISTRADOR) // Solo admin puede acceder a todos los endpoints de usuarios
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
        const createdByUserId = req.user?.id;
        return this.usersService.create(createUserDto, createdByUserId);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
        const updatedByUserId = req.user?.id;
        return this.usersService.update(id, updateUserDto, updatedByUserId);
    }

    /**
     * Endpoint específico para cambiar el rol de un usuario.
     * Solo ADMINISTRADOR puede usar este endpoint.
     */
    @Patch(':id/role')
    async changeRole(
        @Param('id', ParseIntPipe) id: number,
        @Body('role') newRole: UserRole,
        @Req() req: any
    ) {
        const currentUserId = req.user?.id;

        // Validar que el rol sea válido
        if (!Object.values(UserRole).includes(newRole)) {
            throw new ForbiddenException('Rol no válido');
        }

        return this.usersService.update(id, { role: newRole }, currentUserId);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const deletedByUserId = req.user?.id;
        return this.usersService.remove(id, deletedByUserId);
    }
}

