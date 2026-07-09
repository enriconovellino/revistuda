import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Put, UseGuards, Request } from '@nestjs/common';
import { CreateAtividadeDto } from '../../application/dtos/create-atividade.dto';
import { UpdateAtividadeDto } from '../../application/dtos/update-atividade.dto';
import { CreateAtividadeUseCase } from '../../domain/use-cases/create-atividade.use-case';
import { GetAllAtividadesUseCase } from '../../domain/use-cases/get-all-atividades.use-case';
import { GetAtividadeUseCase } from '../../domain/use-cases/get-atividade.use-casa';
import { UpdateAtividadeUseCase } from '../../domain/use-cases/update-atividade.use-case';
import { DeleteAtividadeUseCase } from '../../domain/use-cases/delete-atividade.use-case';
import { ResponderAtividadeUseCase } from '../../domain/use-cases/responder-atividade.use-case';
import { AtividadePresenter } from '../../application/presenters/atividade.presenter';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('atividades')
export class AtividadesController {
  constructor(
    private createAtividadeUseCase: CreateAtividadeUseCase,
    private getAllAtividadesUseCase: GetAllAtividadesUseCase,
    private getAtividadeUseCase: GetAtividadeUseCase,
    private updateAtividadeUseCase: UpdateAtividadeUseCase,
    private deleteAtividadeUseCase: DeleteAtividadeUseCase,
    private responderAtividadeUseCase: ResponderAtividadeUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova atividade' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createAtividadeDto: CreateAtividadeDto) {
    const atividade = await this.createAtividadeUseCase.execute({
      ...createAtividadeDto,
      enunciado: createAtividadeDto.enunciado ?? null,
      opcoes: createAtividadeDto.opcoes ?? [],
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
    const atividade = await this.updateAtividadeUseCase.execute(id, updateAtividadeDto);
    return AtividadePresenter.toPresentation(atividade);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover atividade por ID' })
  @ApiParam({ name: 'id', description: 'ID da atividade', type: Number })
  @ApiResponse({ status: 200, description: 'Atividade removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.deleteAtividadeUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/responder')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Responder a uma atividade de múltipla escolha' })
  @ApiParam({ name: 'id', description: 'ID da atividade', type: Number })
  @ApiResponse({ status: 201, description: 'Resposta salva com sucesso' })
  @ApiResponse({ status: 401, description: 'Token inválido ou não informado' })
  async responder(
    @Param('id', ParseIntPipe) id: number,
    @Body('opcao_id') opcaoId: number,
    @Request() req
  ) {
    const alunoId = req.user.sub;
    const resposta = await this.responderAtividadeUseCase.execute(alunoId, opcaoId);
    return resposta;
  }
}
