import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
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
export class ModulosController {
  constructor(
    private createModuloUseCase: CreateModuloUseCase,
    private getAllModulosUseCase: GetAllModulosUseCase,
    private getModuloUseCase: GetModuloUseCase,
    private updateModuloUseCase: UpdateModuloUseCase,
    private deleteModuloUseCase: DeleteModuloUseCase,
  ) { }

  @Post()
  async create(@Body() dto: CreateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.createModuloUseCase.execute(dto);
    return ModuloPresenter.toPresentation(modulo);
  }

  @Get()
  async findAll(): Promise<ModuloPresenter[]> {
    const modulos = await this.getAllModulosUseCase.execute();
    return ModuloPresenter.toCollection(modulos);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ModuloPresenter> {
    const modulo = await this.getModuloUseCase.execute(id);
    return ModuloPresenter.toPresentation(modulo);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.updateModuloUseCase.execute({ id, ...dto });
    return ModuloPresenter.toPresentation(modulo);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteModuloUseCase.execute(id);
  }
}