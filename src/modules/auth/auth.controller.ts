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
  
      if (user.password === await bcrypt.hash('senha123', 10)) {
        throw new BadRequestException('Você precisa alterar sua senha antes de prosseguir.');
      }
    
      const payload = { id: user.id, email: user.email, role: user.role };
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

}
