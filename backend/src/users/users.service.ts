import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: createUserDto.email }
    })
    if (user) {
      throw new BadRequestException('usuário já cadastrado!')
    } 
    const hashPassword = await bcrypt.hash(createUserDto.senha, 10);
    return this.prisma.user.create({
      data: {
        nome: createUserDto.nome,
        email: createUserDto.email,
        senha: hashPassword
      }
    })
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {

    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}