import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://localhost:4200/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperação de Senha',
      text: `Clique no link para alterar sua senha: ${resetLink}`,
      html: `<p>Clique no link para alterar sua senha: <a href="${resetLink}">Alterar Senha</a></p>`
    });

    console.log(`Email enviado para ${email} com link: ${resetLink}`);
  }
}
