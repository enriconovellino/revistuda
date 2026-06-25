import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
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
  async create(@Body() dto: CreateConteudoDto): Promise<ConteudoPresenter> {
    const conteudo = await this.createConteudoUseCase.execute(dto);
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Get()
  async findAll(): Promise<ConteudoPresenter[]> {
    const conteudos = await this.getAllConteudosUseCase.execute();
    return ConteudoPresenter.toCollection(conteudos);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ConteudoPresenter> {
    const conteudo = await this.getConteudoUseCase.execute(id);
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateConteudoDto): Promise<ConteudoPresenter> {
    const conteudo = await this.updateConteudoUseCase.execute({ id, ...dto });
    return ConteudoPresenter.toPresentation(conteudo);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteConteudoUseCase.execute(id);
  }
}
