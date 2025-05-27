// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, BadRequestException, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, 
    private userService: UserService, 
    private emailService: EmailService, 
    private jwtService: JwtService) {}

    @Post('login')
    async login(@Body() body) {
      const user = await this.userService.findByEmail(body.email);
      if (!user || !(await bcrypt.compare(body.password, user.password))) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }
      
      const payload = { sub: user.id, email: user.email, role: user.role, isFirstLogin: user.firstLogin};
      const accessToken = this.jwtService.sign(payload);
    
      return { access_token: accessToken };
    }

  @Post('forgot-password')
async forgotPassword(@Body() body) {
  const user = await this.userService.findByEmail(body.email);
  
  if (!user) {
    throw new BadRequestException('Email não encontrado.');
  }

  const resetToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '1h' });

  await this.emailService.sendPasswordResetEmail(user.email, resetToken);

  return { message: 'Email de recuperação enviado!' };
}

@Post('change-password')
async changePassword(@Body() body) {
  const { userId, newPassword } = body;
  
  if (!newPassword || newPassword.length < 6) {
    throw new BadRequestException('A senha deve ter pelo menos 6 caracteres.');
  }

  await this.authService.updatePassword(userId, newPassword);

  return { message: 'Senha alterada com sucesso! Agora você pode fazer login.' };
}

}
