import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ShardModule } from './modules/shards/shard.module';
import { AccountModule } from './modules/accounts/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './modules/email/email.service';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './modules/admin/admin.module';


@Module({
  imports: [UserModule, ShardModule, AccountModule, AuthModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'recuperasenhadh@gmail.com',
          pass: 'easydoor'
        }
      }
    }),
    EmailModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
  exports: [EmailService],
})
export class AppModule {}
