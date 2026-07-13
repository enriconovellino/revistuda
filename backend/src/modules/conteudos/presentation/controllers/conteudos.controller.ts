import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateConteudoDto } from '../../application/dtos/create-conteudo.dto';
import { UpdateConteudoDto } from '../../application/dtos/update-conteudo.dto';
import { ConteudoPresenter } from '../../application/presenters/conteudo.presenter';
import {
  CreateConteudoUseCase,
  DeleteConteudoUseCase,
  GetAllConteudosUseCase,
  GetConteudoUseCase,
  UpdateConteudoUseCase,
  ConcluirConteudoUseCase,
  GetProgressoConteudosUseCase,
} from '../../domain/use-cases';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('conteudos')
export class ConteudosController {
  constructor(
    private createConteudoUseCase: CreateConteudoUseCase,
    private getAllConteudosUseCase: GetAllConteudosUseCase,
    private getConteudoUseCase: GetConteudoUseCase,
    private updateConteudoUseCase: UpdateConteudoUseCase,
    private deleteConteudoUseCase: DeleteConteudoUseCase,
    private concluirConteudoUseCase: ConcluirConteudoUseCase,
    private getProgressoConteudosUseCase: GetProgressoConteudosUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo conteúdo'})
  @ApiResponse({ status: 201, description: 'Conteúdo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos'})
  async create(@Body() dto: CreateConteudoDto): Promise<ConteudoPresenter> {
    const conteudo = await this.createConteudoUseCase.execute(dto);
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos'})
  @ApiResponse({ status: 200, description: 'Lista de conteúdos retornada com sucesso' })
  async findAll(): Promise<ConteudoPresenter[]> {
    const conteudos = await this.getAllConteudosUseCase.execute();
    return ConteudoPresenter.toCollection(conteudos);
  }

  @UseGuards(JwtAuthGuard)
  @Get('progresso')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter conteúdos concluídos pelo aluno em um módulo' })
  @ApiQuery({ name: 'moduloId', type: Number, description: 'ID do módulo' })
  @ApiResponse({ status: 200, description: 'Lista de IDs de conteúdos concluídos' })
  async getProgresso(
    @Query('moduloId', ParseIntPipe) moduloId: number,
    @Request() req,
  ): Promise<number[]> {
    const alunoId = req.user.sub;
    return this.getProgressoConteudosUseCase.execute(alunoId, moduloId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conteúdo por ID' })
  @ApiParam({ name: 'id', description: 'ID do conteúdo', type: Number })
  @ApiResponse({ status: 200, description: 'Conteúdo encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConteudoPresenter> {
    const conteudo = await this.getConteudoUseCase.execute(id);
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar conteúdo por ID' })
  @ApiParam({ name: 'id', description: 'ID do conteúdo', type: Number })
  @ApiResponse({ status: 200, description: 'Conteúdo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConteudoDto): Promise<ConteudoPresenter> {
    const conteudo = await this.updateConteudoUseCase.execute({ id, ...dto });
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar conteúdo por ID' })
  @ApiParam({ name: 'id', description: 'ID do conteúdo', type: Number })
  @ApiResponse({ status: 200, description: 'Conteúdo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conteúdo não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteConteudoUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/concluir')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar um conteúdo como concluído pelo aluno' })
  @ApiParam({ name: 'id', description: 'ID do conteúdo', type: Number })
  @ApiResponse({ status: 201, description: 'Conteúdo marcado como concluído' })
  async concluir(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<{ conteudo_id: number; data_conclusao: Date }> {
    const alunoId = req.user.sub;
    return this.concluirConteudoUseCase.execute(alunoId, id);
  }
}
