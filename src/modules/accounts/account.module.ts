import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'seuSegredoAqui', // 🔥 Garante acesso ao serviço JWT
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}