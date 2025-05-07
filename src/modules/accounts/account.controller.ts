import { Controller, Get, Patch, Param, Body, ParseIntPipe, Query, Post, Headers, UnauthorizedException, Put } from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  // Atualiza os dados de uma conta (entrada/saída da fila e alteração de nome)
  @Patch(':id')
  updateAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Body() updateAccountDto: UpdateAccountDto,
    // Simulação de dados do usuário atual; substitua por um sistema de autenticação real
    @Query('currentUserId') currentUserId: string,
    @Query('isAdmin') isAdmin: string,
  ) {
    const currentUser = parseInt(currentUserId);
    const adminFlag = isAdmin === 'true';
    return this.accountService.updateAccount(accountId, updateAccountDto, currentUser, adminFlag);
  }

  // Lista todas as contas
  @Get()
  findAllAccounts() {
    return this.accountService.findAllAccounts();
  }

  // Lista apenas as contas que entraram na fila
  @Get('queue')
  findAccountsInQueue() {
    return this.accountService.findAccountsInQueue();
  }

  @Post()
  async createAccount(@Headers('Authorization') authHeader: string, @Body() { name }: { name: string }) {
    if (!authHeader) {
      throw new UnauthorizedException('Token de autenticação não fornecido'); // 🔥 Tratamento de erro
    }

    const token = authHeader.replace('Bearer ', '');
    return this.accountService.createAccount(token, name);
  }

  @Put(':id/gems')
  async updateGems(
    @Param('id') id: number,
    @Body('gems') gems: number
  ) {
    return this.accountService.updateGems(+id, gems);
  }
}
