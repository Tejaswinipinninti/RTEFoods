const nodemailer = require('nodemailer');

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@rtefoods.com',
    to,
    subject,
    text,
    html
  });
  return info;
};

module.exports = sendEmail;
