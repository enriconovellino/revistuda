import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation,ApiTags, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateConteudoDto } from '../../application/dtos/create-conteudo.dto';
import { UpdateConteudoDto } from '../../application/dtos/update-conteudo.dto';
import { ConteudoPresenter } from '../../application/presenters/conteudo.presenter';
import {
  CreateConteudoUseCase,
  DeleteConteudoUseCase,
  GetAllConteudosUseCase,
  GetConteudoUseCase,
  UpdateConteudoUseCase,
} from '../../domain/use-cases';

@Controller('conteudos')
export class ConteudosController {
  constructor(
    private createConteudoUseCase: CreateConteudoUseCase,
    private getAllConteudosUseCase: GetAllConteudosUseCase,
    private getConteudoUseCase: GetConteudoUseCase,
    private updateConteudoUseCase: UpdateConteudoUseCase,
    private deleteConteudoUseCase: DeleteConteudoUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo conteúdo'})
  @ApiResponse({ status: 201, description: 'Conteúdo criadocom sucesso' })
  @ApiResponse ({ status: 400, description: 'Dados inválidos'}) 
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
}
