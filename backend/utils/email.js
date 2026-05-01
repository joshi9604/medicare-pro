const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();
const logger = require('./logger');

const getEnv = (key) => String(process.env[key] || '').trim();

const sendWithGmail = async ({ to, subject, html }) => {
  const user = getEnv('EMAIL_USER');
  const pass = getEnv('EMAIL_PASS');
  const from = getEnv('EMAIL_FROM') || user;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS are required for Gmail email delivery');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: `"MediCare Pro" <${from}>`,
    to,
    subject,
    html
  });
};

const sendWithBrevo = async ({ to, subject, html }) => {
  const apiKey = getEnv('BREVO_API_KEY');
  const from = getEnv('EMAIL_FROM');

  if (!apiKey || !from) {
    throw new Error('BREVO_API_KEY and EMAIL_FROM are required for Brevo email delivery');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        name: 'MediCare Pro',
        email: from
      },
      to: [{ email: to }],
      subject,
      htmlContent: html
    },
    {
      proxy: false,
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
};

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const provider = getEnv('EMAIL_PROVIDER').toLowerCase();

    if (provider === 'gmail') {
      await sendWithGmail({ to, subject, html });
    } else {
      await sendWithBrevo({ to, subject, html });
    }

    logger.info('Email sent successfully', { to: logger.maskEmail(to) });
    return true;
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Unknown email delivery error';
    logger.error('Email delivery failed', err.response?.data || message);
    throw new Error(message);
  }
};
