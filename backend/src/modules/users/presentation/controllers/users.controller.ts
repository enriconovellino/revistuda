import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { UserPresenter } from '../../application/presenters/user.presenter';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
} from '../../domain/use-cases';
import { Permissions } from '@/shared/decorators/permissions.decorator';
import { PermissionsGuard } from '@/modules/auth/infrastructure/guards/permissions.guard';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UsersController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getAllUsersUseCase: GetAllUsersUseCase,
    private getUserUseCase: GetUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @Permissions('users.create')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserPresenter> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return UserPresenter.toPresentation(user);
  }

  @Get()
  @Permissions('users.read')
  async findAll(): Promise<UserPresenter[]> {
    const users = await this.getAllUsersUseCase.execute();
    return UserPresenter.toCollection(users);
  }

  @Get(':id')
  @Permissions('users.read')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserPresenter> {
    const user = await this.getUserUseCase.execute(id);
    return UserPresenter.toPresentation(user);
  }

  @Put(':id')
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
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
