import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'seuemail@gmail.com',
          pass: 'suasenha'
        }
      }
    })
  ],
  providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
