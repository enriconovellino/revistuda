import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { GetRelatorioOverviewUseCase, RelatorioOverview } from '../../domain/use-cases/get-relatorio-overview.use-case';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RelatoriosController {
  constructor(private getRelatorioOverviewUseCase: GetRelatorioOverviewUseCase) {}

  @Get('overview')
  @Permissions('ADM')
  @ApiOperation({ summary: 'Visão geral de desempenho: contagens e médias por turma/módulo' })
  @ApiResponse({ status: 200, description: 'Relatório retornado com sucesso' })
  async overview(): Promise<RelatorioOverview> {
    return this.getRelatorioOverviewUseCase.execute();
  }
}
