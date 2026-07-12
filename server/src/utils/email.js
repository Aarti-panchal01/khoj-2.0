const nodemailer = require('nodemailer');

// Build transporter from env — supports SMTP providers (Gmail, SendGrid, etc.)
// Also supports common production env names:
// - `SENDGRID_API_KEY` (used to derive SMTP creds)
// - `EMAIL_USER` / `EMAIL_PASS` (defaults to Gmail SMTP if host not provided)
const createTransporter = () => {
  let host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT) || 587;
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  // SendGrid fallback: use SMTP auth user "apikey"
  if ((!host || !user || !pass) && process.env.SENDGRID_API_KEY) {
    host = host || 'smtp.sendgrid.net';
    user = user || 'apikey';
    pass = pass || process.env.SENDGRID_API_KEY;
  }

  // Gmail fallback: use `EMAIL_USER` / `EMAIL_PASS` if SMTP_* are not provided
  if ((!host || !user || !pass) && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    host = host || 'smtp.gmail.com';
    user = user || process.env.EMAIL_USER;
    pass = pass || process.env.EMAIL_PASS;
  }

  const missing = [];
  if (!host) missing.push('SMTP_HOST (or provider fallback like SENDGRID_API_KEY/EMAIL_USER)');
  if (!user) missing.push('SMTP_USER (or apikey fallback / EMAIL_USER)');
  if (!pass) missing.push('SMTP_PASS (or SENDGRID_API_KEY/EMAIL_PASS)');

  if (missing.length > 0) {
    const err = new Error(`Email service is not configured. Missing: ${missing.join(', ')}.`);
    err.status = 503;
    err.publicMessage = 'Email service is not configured. Please try again later.';
    throw err;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

const resolveFromAddress = () => {
  // Prefer explicit "from" address if present.
  // Fallbacks cover:
  // - Gmail where SMTP_USER == actual email
  // - SendGrid where SMTP_USER might be "apikey" (invalid as a from address)
  if (process.env.EMAIL_FROM_ADDR) return process.env.EMAIL_FROM_ADDR;
  if (process.env.EMAIL_USER) return process.env.EMAIL_USER;
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'apikey') return process.env.SMTP_USER;
  return null;
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
  const fromAddr = resolveFromAddress();

  if (!fromAddr) {
    const err = new Error('Missing from address for verification email.');
    err.status = 503;
    err.publicMessage = 'Email service is not configured. Please try again later.';
    throw err;
  }

  // Note: do not log the OTP value itself.
  try {
    const info = await transporter.sendMail({
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

    return info;
  } catch (err) {
    console.error('sendMail error:', err?.message || err);

    // Ensure the caller gets a meaningful status/message.
    err.status = err.status || 500;
    err.publicMessage = err.publicMessage || 'Failed to send verification email';
    throw err;
  }
};

module.exports = { generateOtp, sendVerificationEmail };
