// src/auth/auth.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private emailService: EmailService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user; // Removendo senha da resposta
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email,
      sub: user.id,
      role: user.role,
      firstLogin: user.password === await bcrypt.hash('senha123', 10) // Define se a senha ainda é a padrão
      };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('Email não encontrado.');
    }
  
    const resetToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '1h' });
  
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  
    return { message: 'Email de recuperação enviado!' };
  }
}
