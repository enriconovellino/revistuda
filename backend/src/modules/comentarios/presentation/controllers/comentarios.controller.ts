import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SaveComentarioDto } from '../../application/dtos/save-comentario.dto';
import { ResponderComentarioDto } from '../../application/dtos/responder-comentario.dto';
import { ComentarioPresenter, ComentarioComAlunoPresenter, ComentarioResumoPresenter } from '../../application/presenters/comentario.presenter';
import {
  SaveComentarioUseCase,
  GetComentariosByConteudoUseCase,
  GetComentariosByModuloUseCase,
  GetComentariosByProfessorUseCase,
  ResponderComentarioUseCase,
} from '../../domain/use-cases';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Comentarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comentarios')
export class ComentariosController {
  constructor(
    private saveComentarioUseCase: SaveComentarioUseCase,
    private getComentariosByConteudoUseCase: GetComentariosByConteudoUseCase,
    private getComentariosByModuloUseCase: GetComentariosByModuloUseCase,
    private getComentariosByProfessorUseCase: GetComentariosByProfessorUseCase,
    private responderComentarioUseCase: ResponderComentarioUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Aluno salva (cria ou atualiza) o comentário de um conteúdo' })
  @ApiResponse({ status: 201, description: 'Comentário salvo com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async salvar(@Req() req: any, @Body() dto: SaveComentarioDto): Promise<ComentarioPresenter> {
    const alunoId = req.user.sub;
    const comentario = await this.saveComentarioUseCase.execute({
      alunoId,
      conteudoId: dto.conteudoId,
      texto: dto.texto,
    });
    return ComentarioPresenter.toPresentation(comentario);
  }

  @Patch(':id/resposta')
  @ApiOperation({ summary: 'Professor responde o comentário de um aluno' })
  @ApiParam({ name: 'id', description: 'ID do comentário', type: Number })
  @ApiResponse({ status: 200, description: 'Resposta salva com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async responder(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderComentarioDto,
  ): Promise<ComentarioPresenter> {
    const comentario = await this.responderComentarioUseCase.execute(id, dto.resposta);
    return ComentarioPresenter.toPresentation(comentario);
  }

  @Get('conteudo/:id')
  @ApiOperation({ summary: 'Professor lista os comentários de um conteúdo específico' })
  @ApiParam({ name: 'id', description: 'ID do conteúdo', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
  async porConteudo(@Param('id', ParseIntPipe) id: number): Promise<ComentarioComAlunoPresenter[]> {
    const comentarios = await this.getComentariosByConteudoUseCase.execute(id);
    return ComentarioComAlunoPresenter.toCollection(comentarios);
  }

  @Get('modulo/:id')
  @ApiOperation({ summary: 'Professor lista todos os comentários de um módulo inteiro' })
  @ApiParam({ name: 'id', description: 'ID do módulo', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
  async porModulo(@Param('id', ParseIntPipe) id: number): Promise<ComentarioComAlunoPresenter[]> {
    const comentarios = await this.getComentariosByModuloUseCase.execute(id);
    return ComentarioComAlunoPresenter.toCollection(comentarios);
  }

  @Get('professor')
  @ApiOperation({ summary: 'Professor lista todos os comentários de todas as suas turmas (resumo geral)' })
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
  async meus(@Req() req: any): Promise<ComentarioResumoPresenter[]> {
    const professorId = req.user.sub;
    const comentarios = await this.getComentariosByProfessorUseCase.execute(professorId);
    return ComentarioResumoPresenter.toCollection(comentarios);
  }
}