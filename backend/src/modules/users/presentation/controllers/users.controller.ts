import { Body,Controller, Delete, Get, Param, ParseIntPipe, Put,UseGuards,} from '@nestjs/common'; 
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags,} from '@nestjs/swagger';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserPresenter } from '../../application/presenters/user.presenter';
import { DeleteUserUseCase, GetAllUsersUseCase, GetUserUseCase, UpdateUserUseCase,} from '../../domain/use-cases';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';

  @Controller('users')
  @UseGuards(PermissionsGuard)
export class UsersController {
  constructor(
    private getAllUsersUseCase: GetAllUsersUseCase,
    private getUserUseCase: GetUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
  ) {}
  
  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  @Permissions('users.read')
  async findAll(): Promise<UserPresenter[]> {
    const users = await this.getAllUsersUseCase.execute();
    return UserPresenter.toCollection(users);
  }

  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Permissions('users.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserPresenter> {
    const user = await this.getUserUseCase.execute(id);
    return UserPresenter.toPresentation(user);
  }

  @Put(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Atualizar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Permissions('users.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserPresenter> {
    const user = await this.updateUserUseCase.execute({ id, ...updateUserDto });
    return UserPresenter.toPresentation(user);
  }

  @Delete(':id')
  @Permissions('users.delete')
  @ApiOperation({ summary: 'Deletar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: Number })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @Permissions('users.delete')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
