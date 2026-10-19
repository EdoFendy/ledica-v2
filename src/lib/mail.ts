import nodemailer from "nodemailer";

export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!process.env.SMTP_HOST) return false;
  const tr = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await tr.sendMail({ from: process.env.MAIL_FROM || "sito@ledica.it", ...opts });
  return true;
}
