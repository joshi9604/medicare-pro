// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // Determine email provider based on config
// const getTransporter = () => {
//   const provider = process.env.EMAIL_PROVIDER || 'gmail'; // 'gmail' or 'sendgrid'
  
//   if (provider === 'sendgrid') {
//     // SendGrid Configuration
//     return nodemailer.createTransport({
//       host: 'smtp.sendgrid.net',
//       port: 587,
//       secure: false,
//       auth: {
//         user: 'apikey',
//         pass: process.env.SENDGRID_API_KEY
//       }
//     });
//   } else {
//     // Gmail Configuration
//     return nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });
//   }
// };

// exports.sendEmail = async ({ to, subject, html }) => {
//   const provider = process.env.EMAIL_PROVIDER || 'gmail';
  
//   // Check credentials based on provider
//   if (provider === 'sendgrid') {
//     if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
//       console.log('📧 Email skipped (no SENDGRID_API_KEY set)');
//       return false;
//     }
//   } else {
//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       console.log('📧 Email skipped (no EMAIL_USER or EMAIL_PASS set)');
//       return false;
//     }
//   }
  
//   const transporter = getTransporter();
//   const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@medicare-pro.com';
  
//   try {
//     await transporter.sendMail({
//       from: `"MediCare Pro 🏥" <${fromEmail}>`,
//       to, subject, html
//     });
//     console.log(`📧 Email sent to ${to} via ${provider}`);
//     return true;
//   } catch (err) {
//     console.error('❌ Email failed:', err.message);
//     throw err;
//   }
// };

const nodemailer = require('nodemailer');
require('dotenv').config();

const getEnv = (key) =>
  String(process.env[key] || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');

const getTransporter = () => {
  const provider = getEnv('EMAIL_PROVIDER').toLowerCase() || 'brevo';

  if (provider === 'brevo') {
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: getEnv('BREVO_SMTP_USER'),
        pass: getEnv('BREVO_SMTP_PASS'),
      },
    });
  }

  if (provider === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: getEnv('SENDGRID_API_KEY'),
      },
    });
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: getEnv('EMAIL_USER'),
      pass: getEnv('EMAIL_PASS').replace(/\s/g, ''),
    },
  });
};

exports.sendEmail = async ({ to, subject, html }) => {
  const provider = getEnv('EMAIL_PROVIDER').toLowerCase() || 'brevo';

  if (provider === 'brevo' && (!getEnv('BREVO_SMTP_USER') || !getEnv('BREVO_SMTP_PASS'))) {
    console.error('Email failed: BREVO_SMTP_USER or BREVO_SMTP_PASS missing');
    return false;
  }

  if (provider === 'sendgrid' && !getEnv('SENDGRID_API_KEY')) {
    console.error('Email failed: SENDGRID_API_KEY missing');
    return false;
  }

  if (provider === 'gmail' && (!getEnv('EMAIL_USER') || !getEnv('EMAIL_PASS'))) {
    console.error('Email failed: EMAIL_USER or EMAIL_PASS missing');
    return false;
  }

  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: `"MediCare Pro" <${getEnv('EMAIL_FROM') || getEnv('EMAIL_USER') || getEnv('BREVO_SMTP_USER')}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to} via ${provider}`);
    return true;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return false;
  }
};
