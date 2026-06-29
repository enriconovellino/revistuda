import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';
import { CreateModuloDto } from '../../application/dtos/create-modulo.dto';
import { UpdateModuloDto } from '../../application/dtos/update-modulo.dto';
import { ModuloPresenter } from '../../application/presenters/modulo.presenter';
import {
  CreateModuloUseCase,
  DeleteModuloUseCase,
  GetAllModulosUseCase,
  GetModuloUseCase,
  UpdateModuloUseCase,
} from '../../domain/use-cases';

@Controller('modulos')
@UseGuards(PermissionsGuard)
export class ModulosController {
  constructor(
    private createModuloUseCase: CreateModuloUseCase,
    private getAllModulosUseCase: GetAllModulosUseCase,
    private getModuloUseCase: GetModuloUseCase,
    private updateModuloUseCase: UpdateModuloUseCase,
    private deleteModuloUseCase: DeleteModuloUseCase,
  ) { }

  @Post()
  @Permissions('modulos.create')
  async create(@Body() dto: CreateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.createModuloUseCase.execute(dto);
    return ModuloPresenter.toPresentation(modulo);
  }

  @Get()
  @Permissions('modulos.read')
  async findAll(): Promise<ModuloPresenter[]> {
    const modulos = await this.getAllModulosUseCase.execute();
    return ModuloPresenter.toCollection(modulos);
  }

  @Get(':id')
  @Permissions('modulos.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ModuloPresenter> {
    const modulo = await this.getModuloUseCase.execute(id);
    return ModuloPresenter.toPresentation(modulo);
  }

  @Put(':id')
  @Permissions('modulos.update')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.updateModuloUseCase.execute({ id, ...dto });
    return ModuloPresenter.toPresentation(modulo);
  }

  @Delete(':id')
  @Permissions('modulos.delete')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteModuloUseCase.execute(id);
  }
}