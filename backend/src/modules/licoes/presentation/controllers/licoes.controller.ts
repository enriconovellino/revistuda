import { Controller, Post, Get, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
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
  async create(@Body() createLicaoDto: CreateLicaoDto) {
    const licao = await this.createLicaoUseCase.execute(createLicaoDto);
    return LicaoPresenter.toPresentation(licao);
  }

  @Get()
  async findAll() {
    const licoes = await this.getAllLicoes.execute();
    return LicaoPresenter.toCollection(licoes);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const licao = await this.getLicaoUseCase.execute(id);
    return LicaoPresenter.toPresentation(licao);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateLicaoDto: UpdateLicaoDto) {
    const licao = await this.updateLicaoUseCase.execute(id, updateLicaoDto);
    return LicaoPresenter.toPresentation(licao);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.deleteLicaoUseCase.execute(id);
  }
}
