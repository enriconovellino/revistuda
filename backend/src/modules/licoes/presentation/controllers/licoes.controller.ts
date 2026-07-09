import { Controller, Post, Get, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CreateLicaoUseCase } from '../../domain/use-cases/create-licao.use-case';
import { GetAllLicoes } from '../../domain/use-cases/get-all-licoes.use-case';
import { GetLicaoUseCase } from '../../domain/use-cases/get-licao.use-case';
import { UpdateLicaoUseCase } from '../../domain/use-cases/update-licao.use-case';
import { DeleteLicaoUseCase } from '../../domain/use-cases/delete-licao.use-case';
import { CreateLicaoDto } from '../../application/dtos/create-licao.dto';
import { UpdateLicaoDto } from '../../application/dtos/update-licao.dto';
import { LicaoPresenter } from '../../application/presenters/licao.presenter';

@Controller('licoes')
export class LicioesController {
  constructor(
    private createLicaoUseCase: CreateLicaoUseCase,
    private getAllLicoes: GetAllLicoes,
    private getLicaoUseCase: GetLicaoUseCase,
    private updateLicaoUseCase: UpdateLicaoUseCase,
    private deleteLicaoUseCase: DeleteLicaoUseCase,
  ) {}

@Post()
@ApiOperation({ summary: 'Criar uma nova lição' })
@ApiResponse({ status: 201, description: 'Lição criada com sucesso' })
@ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createLicaoDto: CreateLicaoDto) {
    const licao = await this.createLicaoUseCase.execute(createLicaoDto);
    return LicaoPresenter.toPresentation(licao);
  }

@UseGuards(JwtAuthGuard)
@Get()
@ApiBearerAuth()
@ApiOperation({ summary: 'Listar todas as lições' })
@ApiResponse({ status: 200, description: 'Lista de lições retornada com sucesso' })
  async findAll(@Request() req) {
    const userId = req.user.sub;
    const licoes = await this.getAllLicoes.execute(userId);
    return LicaoPresenter.toCollection(licoes);
  }

@Get(':id')
@ApiOperation({ summary: 'Buscar lição por ID' })
@ApiParam({ name: 'id', description: 'ID da lição', type: Number })
@ApiResponse({ status: 200, description: 'Lição encontrada com sucesso' })
@ApiResponse({ status: 404, description: 'Lição não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const licao = await this.getLicaoUseCase.execute(id);
    return LicaoPresenter.toPresentation(licao);
  }

@Put(':id')
@ApiOperation({ summary: 'Atualizar lição por ID' })
@ApiParam({ name: 'id', description: 'ID da lição', type: Number })
@ApiResponse({ status: 200, description: 'Lição atualizada com sucesso' })
@ApiResponse({ status: 404, description: 'Lição não encontrada' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateLicaoDto: UpdateLicaoDto) {
    const licao = await this.updateLicaoUseCase.execute(id, updateLicaoDto);
    return LicaoPresenter.toPresentation(licao);
  }

@Delete(':id')
@ApiOperation({ summary: 'Deletar lição por ID' })
@ApiParam({ name: 'id', description: 'ID da lição', type: Number })
@ApiResponse({ status: 200, description: 'Lição deletada com sucesso' })
@ApiResponse({ status: 404, description: 'Lição não encontrada' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.deleteLicaoUseCase.execute(id);
  }
}
