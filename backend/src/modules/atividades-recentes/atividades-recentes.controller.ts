import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AtividadesRecentesService } from './atividades-recentes.service';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';
import { JwtAuthGuard } from '@/modules/auth/infrastructure/guards/jwt-auth.guard';

@Controller('atividades-recentes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AtividadesRecentesController {
  constructor(private atividadesRecentesService: AtividadesRecentesService) {}

  @Get()
  @Permissions('ADM')
  @ApiOperation({ summary: 'Listar as atividades recentes do sistema (feed do painel admin)' })
  @ApiResponse({ status: 200, description: 'Lista de atividades retornada com sucesso' })
  async findRecent() {
    return this.atividadesRecentesService.listar();
  }
}
