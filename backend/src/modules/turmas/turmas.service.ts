import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTurmaDto } from './application/dtos/create-turma.dto';
import { UpdateTurmaDto } from './application/dtos/update-turma.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TurmasService {
  constructor(private prisma: PrismaService) {}

  create(createTurmaDto: CreateTurmaDto) {
    return this.prisma.turma.create({ data: createTurmaDto });
  }

  findAll() {
     return this.prisma.turma.findMany();
  }

  async findOne(id: number) {
    const turma = await this.prisma.turma.findUnique({
      where: { turma_id: id },
    });
    if (!turma) throw new NotFoundException('Turma não encontrada');
    return turma;
  }

  async update(id: number, updateTurmaDto: UpdateTurmaDto) {
    await this.findOne(id);
    return this.prisma.turma.update({
      where: { turma_id: id },
      data: updateTurmaDto,
    });
  }
  
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.turma.delete({
      where: { turma_id: id },
    });
  }
}
