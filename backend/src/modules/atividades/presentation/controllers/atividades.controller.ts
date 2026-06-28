import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { CreateAtividadeDto } from '../../application/dtos/create-atividade.dto';
import { UpdateAtividadeDto } from '../../application/dtos/update-atividade.dto';
import { CreateAtividadeUseCase } from '../../domain/use-cases/create-atividade.use-case';
import { GetAllAtividadesUseCase } from '../../domain/use-cases/get-all-atividades.use-case';
import { GetAtividadeUseCase } from '../../domain/use-cases/get-atividade.use-casa';
import { UpdateAtividadeUseCase } from '../../domain/use-cases/update-atividade.use-case';
import { DeleteAtividadeUseCase } from '../../domain/use-cases/delete-atividade.use-case';
import { AtividadePresenter } from '../../application/presenters/atividade.presenter';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('atividades')
export class AtividadesController {
  constructor(
    private createAtividadeUseCase: CreateAtividadeUseCase,
    private getAllAtividadesUseCase: GetAllAtividadesUseCase,
    private getAtividadeUseCase: GetAtividadeUseCase,
    private updateAtividadeUseCase: UpdateAtividadeUseCase,
    private deleteAtividadeUseCase: DeleteAtividadeUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova atividade' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createAtividadeDto: CreateAtividadeDto) {
    const atividade = await this.createAtividadeUseCase.execute({
      ...createAtividadeDto,
      descricao_atividade: createAtividadeDto.descricao_atividade ?? null,
    });
    return AtividadePresenter.toPresentation(atividade);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as atividades' })
  @ApiResponse({ status: 200, description: 'Atividades listadas com sucesso' })
  async findAll() {
    const atividades = await this.getAllAtividadesUseCase.execute();
    return AtividadePresenter.toCollection(atividades);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar atividade por ID' })
  @ApiResponse({ status: 200, description: 'Atividade encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const atividade = await this.getAtividadeUseCase.execute(id);
    return AtividadePresenter.toPresentation(atividade);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar atividade por ID' })
  @ApiParam({ name: 'id', description: 'ID da atividade', type: Number })
  @ApiResponse({ status: 200, description: 'Atividade atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateAtividadeDto: UpdateAtividadeDto) {
    return await this.updateAtividadeUseCase.execute(id, updateAtividadeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover atividade por ID' })
  @ApiParam({ name: 'id', description: 'ID da atividade', type: Number })
  @ApiResponse({ status: 200, description: 'Atividade removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.deleteAtividadeUseCase.execute(id);
  }
}
