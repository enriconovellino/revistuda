import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../../application/dtos/login.dto';
import { RegisterDto } from '../../application/dtos/register.dto';
import { RefreshTokenDto } from '../../application/dtos/refresh-token.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

@Post('login')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Fazer login no sistema' })
@ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
@ApiResponse({ status: 401, description: 'Credenciais inválidas' })
@HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
@ApiOperation({ summary: 'Cadastrar novo usuário' })
@ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso' })
@ApiResponse({ status: 400, description: 'Dados inválidos' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Gerar novo token de acesso' })
@ApiResponse({ status: 200, description: 'Token atualizado com sucesso' })
@ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

@UseGuards(JwtAuthGuard)
@Get('me')
@ApiBearerAuth()
@ApiOperation({ summary: 'Buscar dados do usuário autenticado' })
@ApiResponse({ status: 200, description: 'Usuário autenticado retornado com sucesso' })
@ApiResponse({ status: 401, description: 'Token inválido ou não informado' })
  getMe(@Request() req) {
    return this.authService.validateUserById(req.user.sub);
  }
}

