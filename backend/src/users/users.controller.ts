import { Controller, Post, Body, Get, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateUserDto: CreateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.usersService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.usersService.remove(id);
    }

}