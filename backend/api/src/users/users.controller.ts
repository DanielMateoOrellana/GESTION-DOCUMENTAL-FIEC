import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
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

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
        const deletedByUserId = req.user?.id;
        return this.usersService.remove(id, deletedByUserId);
    }
}
