import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService) {}

  async updateAccount(accountId: number, updateAccountDto: UpdateAccountDto, currentUserId: number, isAdmin: boolean) {
    // Busca a conta
    const account = await this.prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    // Se o usuário não for administrador, ele só pode atualizar sua própria conta
    if (!isAdmin && account.userId !== currentUserId) {
      throw new ForbiddenException('Você não tem permissão para alterar esta conta');
    }

    // Atualiza os campos permitidos: name e inQueue
    return await this.prisma.account.update({
      where: { id: accountId },
      data: {
        name: updateAccountDto.name,
        inQueue: updateAccountDto.inQueue,
      },
    });
  }

  // Retorna todas as contas
  async findAllAccounts() {
    return this.prisma.account.findMany();
  }

  // Retorna apenas as contas que estão na fila
  async findAccountsInQueue() {
    return this.prisma.account.findMany({
      where: { inQueue: true },
    });
  }

  async createAccount(userToken: string, name: string) {
    const decoded = this.jwtService.decode(userToken);

    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException('Token inválido ou expirado'); // 🔥 Tratamento de erro
    }

    const userId = decoded.sub; // 🔥 Obtendo automaticamente o userId do token

    return await this.prisma.account.create({
      data: {
        name,
        userId, // 🔥 Associando ao usuário autenticado
      },
    });
  }

  async updateGems(accountId: number, gems: number) {
    return this.prisma.account.update({
      where: { id: accountId },
      data: { gems },
    });
  }
}
