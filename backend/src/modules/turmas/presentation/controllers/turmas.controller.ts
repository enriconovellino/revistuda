import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';
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
@UseGuards(PermissionsGuard)
export class TurmasController {
  constructor(
    private createTurmaUseCase: CreateTurmaUseCase,
    private getAllTurmasUseCase: GetAllTurmasUseCase,
    private getTurmaUseCase: GetTurmaUseCase,
    private updateTurmaUseCase: UpdateTurmaUseCase,
    private deleteTurmaUseCase: DeleteTurmaUseCase,
  ) {}

  @Post()
  @Permissions('turmas.create')
  async create(@Body() dto: CreateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.createTurmaUseCase.execute(dto);
    return TurmaPresenter.toPresentation(turma);
  }

  @Get()
  @Permissions('turmas.read')
  async findAll(): Promise<TurmaPresenter[]> {
    const turmas = await this.getAllTurmasUseCase.execute();
    return TurmaPresenter.toCollection(turmas);
  }

  @Get(':id')
  @Permissions('turmas.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TurmaPresenter> {
    const turma = await this.getTurmaUseCase.execute(id);
    return TurmaPresenter.toPresentation(turma);
  }

  @Put(':id')
  @Permissions('turmas.update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurmaDto): Promise<TurmaPresenter> {
    const turma = await this.updateTurmaUseCase.execute({ id, ...dto });
    return TurmaPresenter.toPresentation(turma);
  }

  @Delete(':id')
  @Permissions('turmas.delete')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteTurmaUseCase.execute(id);
  }
}