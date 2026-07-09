import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendPasswordResetEmail(to: string, nome: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.APP_URL}/redefinir-senha?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f2744;">ReviEstuda</h2>
        <p>Olá, ${nome}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background: #1E90FF; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">
          Este link expira em 1 hora. Se você não solicitou essa alteração, pode ignorar este e-mail com segurança.
        </p>
        <p style="color: #64748b; font-size: 12px;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          ${resetUrl}
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"ReviEstuda" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Redefinição de senha - ReviEstuda',
        html,
      });
    } catch (err) {
      this.logger.error(`Erro ao enviar e-mail de recuperação para ${to}`, err);
      throw new Error('Não foi possível enviar o e-mail de recuperação. Tente novamente mais tarde.');
    }
  }
}