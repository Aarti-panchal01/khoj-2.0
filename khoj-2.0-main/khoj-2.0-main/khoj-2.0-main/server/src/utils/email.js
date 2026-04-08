const nodemailer = require('nodemailer');

// Build transporter from env — supports any SMTP provider (Gmail, SendGrid, Mailgun, etc.)
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Missing SMTP configuration. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env');
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Generate a cryptographically random 6-digit OTP
 */
const generateOtp = () => {
  // Use crypto.randomInt for uniform distribution — Math.random() is not cryptographically safe
  const { randomInt } = require('crypto');
  return String(randomInt(100000, 999999));
};

/**
 * Send OTP verification email
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - recipient name for personalisation
 */
const sendVerificationEmail = async (to, otp, name) => {
  const transporter = createTransporter();
  const fromName = process.env.EMAIL_FROM_NAME || 'Khoj Lost & Found';
  const fromAddr = process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to,
    subject: `${otp} is your Khoj verification code`,
    text: `Hi ${name},\n\nYour Khoj email verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nIf you didn't create a Khoj account, ignore this email.\n\n— The Khoj Team`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1d4ed8;margin-bottom:8px;">Verify your email</h2>
        <p style="color:#374151;">Hi <strong>${name}</strong>,</p>
        <p style="color:#374151;">Use the code below to verify your Khoj account:</p>
        <div style="background:#fff;border:2px solid #dbeafe;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1d4ed8;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#6b7280;font-size:14px;">If you didn't create a Khoj account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { generateOtp, sendVerificationEmail };
