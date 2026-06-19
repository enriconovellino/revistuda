import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Extensions } from '@prisma/client/runtime/client';

@Injectable()
export class AtividadesService {
  constructor(private prisma: PrismaService) {}

  create(createAtividadeDto: CreateAtividadeDto) {
    return this.prisma.atividade.create({
      data: createAtividadeDto
    });
  }

  findAll() {
    return this.prisma.atividade.findMany();
  }

  async findOne(id: number) {
    const atividade = await this.prisma.atividade.findUnique({
      where: {
        atividade_id: id
      }
    });

    if(!atividade) {
      throw new NotFoundException("Atividade não encontrada")
    };

    return atividade;
  }

  async update(id: number, updateAtividadeDto: UpdateAtividadeDto) {
    await this.findOne(id)
    return this.prisma.atividade.update({
      where: {
        atividade_id: id
      },
      data: updateAtividadeDto
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.atividade.delete({
      where: {
        atividade_id: id
      }
    });
  }
}
