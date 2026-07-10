import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTurmaDto } from '../../application/dtos/create-turma.dto';
import { UpdateTurmaDto } from '../../application/dtos/update-turma.dto';
import { TurmaPresenter } from '../../application/presenters/turma.presenter';
import {
  CreateTurmaUseCase,
  DeleteTurmaUseCase,
  GetAllTurmasUseCase,
  GetTurmaUseCase,
  GetTurmasByProfessorUseCase,
  UpdateTurmaUseCase,
} from '../../domain/use-cases';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';

  @Controller('turmas')
  @UseGuards(JwtAuthGuard)
export class TurmasController {
  constructor(
    private createTurmaUseCase: CreateTurmaUseCase,
    private getAllTurmasUseCase: GetAllTurmasUseCase,
    private getTurmaUseCase: GetTurmaUseCase,
    private updateTurmaUseCase: UpdateTurmaUseCase,
    private deleteTurmaUseCase: DeleteTurmaUseCase,
    private getTurmasByProfessorUseCase: GetTurmasByProfessorUseCase
  ) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('ADM')
  @ApiOperation({ summary: 'Criar uma nova turma' })
  @ApiResponse({ status: 201, description: 'Turma criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.createTurmaUseCase.execute(dto);
    return TurmaPresenter.toPresentation(turma);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as turmas' })
  @ApiResponse({ status: 200, description: 'Lista de turmas retornada com sucesso' })
  async findAll(): Promise<TurmaPresenter[]> {
    const turmas = await this.getAllTurmasUseCase.execute();
    return TurmaPresenter.toCollection(turmas);
  }

  @Get('professor/:professorId')
  @ApiOperation({ summary: 'Buscar turmas de um professor' })
  async findByProfessor(@Param('professorId', ParseIntPipe) professorId: number): Promise<TurmaPresenter[]> {
    const turmas = await this.getTurmasByProfessorUseCase.execute(professorId);
    return TurmaPresenter.toCollection(turmas);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar turma por ID' })
  @ApiParam({ name: 'id', description: 'ID da turma', type: Number })
  @ApiResponse({ status: 200, description: 'Turma encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TurmaPresenter> {
    const turma = await this.getTurmaUseCase.execute(id);
    return TurmaPresenter.toPresentation(turma);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('ADM')
  @ApiOperation({ summary: 'Atualizar turma por ID' })
  @ApiParam({ name: 'id', description: 'ID da turma', type: Number })
  @ApiResponse({ status: 200, description: 'Turma atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.updateTurmaUseCase.execute({ id, ...dto });
    return TurmaPresenter.toPresentation(turma);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('ADM')
  @ApiOperation({ summary: 'Deletar turma por ID' })
  @ApiParam({ name: 'id', description: 'ID da turma', type: Number })
  @ApiResponse({ status: 200, description: 'Turma deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteTurmaUseCase.execute(id);
  }

}