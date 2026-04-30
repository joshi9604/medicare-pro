const axios = require('axios');
require('dotenv').config();
const logger = require('./logger');

const getEnv = (key) => String(process.env[key] || '').trim();

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'MediCare Pro',
          email: getEnv('EMAIL_FROM')
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        proxy: false,
        headers: {
          'api-key': getEnv('BREVO_API_KEY'),
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info('Email sent successfully', { to: logger.maskEmail(to) });
    return true;
  } catch (err) {
    logger.error('Email delivery failed', err.response?.data || err.message);
    return false;
  }
};
