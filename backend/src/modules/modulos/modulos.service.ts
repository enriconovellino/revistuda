import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';

@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) { }

  create(createModuloDto: CreateModuloDto) {
    return this.prisma.modulo.create({ data: createModuloDto });
  }

  findAll() {
    return this.prisma.modulo.findMany();
  }

  async findOne(id: number) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { modulo_id: id },
    });
    if (!modulo) throw new NotFoundException('Módulo não encontrado');
    return modulo;
  }

  async update(id: number, updateModuloDto: UpdateModuloDto) {
    await this.findOne(id);
    return this.prisma.modulo.update({
      where: { modulo_id: id },
      data: updateModuloDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.modulo.delete({
      where: { modulo_id: id },
    });
  }
}