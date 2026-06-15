import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { CreateTurmaDto } from '../../application/dtos/create-turma.dto';
import { UpdateTurmaDto } from '../../application/dtos/update-turma.dto';
import { TurmaPresenter } from '../../application/presenters/turma.presenter';
import {
  CreateTurmaUseCase,
  DeleteTurmaUseCase,
  GetAllTurmasUseCase,
  GetTurmaUseCase,
  UpdateTurmaUseCase,
} from '../../domain/use-cases';

@Controller('turmas')
export class TurmasController {
  constructor(
    private createTurmaUseCase: CreateTurmaUseCase,
    private getAllTurmasUseCase: GetAllTurmasUseCase,
    private getTurmaUseCase: GetTurmaUseCase,
    private updateTurmaUseCase: UpdateTurmaUseCase,
    private deleteTurmaUseCase: DeleteTurmaUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.createTurmaUseCase.execute(dto);
    return TurmaPresenter.toPresentation(turma);
  }

  @Get()
  async findAll(): Promise<TurmaPresenter[]> {
    const turmas = await this.getAllTurmasUseCase.execute();
    return TurmaPresenter.toCollection(turmas);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TurmaPresenter> {
    const turma = await this.getTurmaUseCase.execute(id);
    return TurmaPresenter.toPresentation(turma);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.updateTurmaUseCase.execute({ id, ...dto });
    return TurmaPresenter.toPresentation(turma);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteTurmaUseCase.execute(id);
  }
}