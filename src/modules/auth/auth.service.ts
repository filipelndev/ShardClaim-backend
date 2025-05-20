// src/auth/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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

  async login(email: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new UnauthorizedException('Usuário não encontrado.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException('Senha inválida.');
  }

  // Cria o payload incluindo o campo firstLogin
  const payload = { 
    email: user.email,
    sub: user.id,
    role: user.role,
    isFirstLogin: user.firstLogin // Aqui o valor deve vir corretamente do banco
  };

  // Gera o token com o algoritmo HS256
  const accessToken = this.jwtService.sign(payload, { algorithm: 'HS256' });  
  // Decodifica o token para teste e loga informações importantes
  const testDecodedToken = this.jwtService.decode(accessToken);
  console.log('Payload enviado:', payload);
  console.log('Token gerado:', accessToken);
  console.log('Token decodificado (teste):', testDecodedToken);

  return {
    access_token: accessToken,
    isFirstLogin: user.firstLogin
  };
}

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        firstLogin: false // Define como `false` após trocar a senha
      }
    });
  
    return { message: 'Senha alterada com sucesso!' };
  }
}
