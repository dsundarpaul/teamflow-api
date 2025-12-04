import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic, CurrentUser } from './decorators';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @IsPublic()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
