import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
});

export interface EmailSaida {
  to: string[];                 // equipe de suporte
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string[];
  attachments?: { filename: string; content: Buffer }[];
}

export async function enviarEmail(dados: EmailSaida){
  return transporter.sendMail({
    from: process.env.SUPORTE_FROM!,
    ...dados,
  });
}
