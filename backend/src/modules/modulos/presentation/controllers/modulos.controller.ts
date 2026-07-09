import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: 'Criar um novo módulo' })
  @ApiResponse({ status: 201, description: 'Módulo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() dto: CreateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.createModuloUseCase.execute(dto);
    return ModuloPresenter.toPresentation(modulo);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os módulos' })
  @ApiResponse({ status: 200, description: 'Lista de módulos retornada com sucesso' })
  async findAll(@Request() req): Promise<ModuloPresenter[]> {
    const userId = req.user.sub;
    const modulos = await this.getAllModulosUseCase.execute(userId);
    return ModuloPresenter.toCollection(modulos);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ModuloPresenter> {
    const modulo = await this.getModuloUseCase.execute(id);
    return ModuloPresenter.toPresentation(modulo);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateModuloDto): Promise<ModuloPresenter> {
    const modulo = await this.updateModuloUseCase.execute({ id, ...dto });
    return ModuloPresenter.toPresentation(modulo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: Number })
  @ApiResponse({ status: 200, description: 'Módulo deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Módulo não encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteModuloUseCase.execute(id);
  }
}