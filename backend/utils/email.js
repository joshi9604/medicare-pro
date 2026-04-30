// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const getEnv = (key) => String(process.env[key] || '')
//   .trim()
//   .replace(/^['"]|['"]$/g, '');

// exports.sendEmail = async ({ to, subject, html }) => {
//   const emailUser = getEnv('EMAIL_USER');
//   const emailPass = getEnv('EMAIL_PASS').replace(/\s/g, '');
//   const emailFrom = getEnv('EMAIL_FROM') || emailUser;

//   if (!emailUser || !emailPass) {
//     throw new Error('EMAIL_USER or EMAIL_PASS missing');
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: Number(getEnv('EMAIL_PORT')) || 587,
//       secure: false,
//       requireTLS: true,
//       connectionTimeout: 20000,
//       greetingTimeout: 20000,
//       socketTimeout: 20000,
//       auth: {
//         user: emailUser,
//         pass: emailPass
//       }
//     });

//     await transporter.sendMail({
//       from: `"MediCare Pro" <${emailFrom}>`,
//       to,
//       subject,
//       html
//     });

//     console.log(`Gmail email sent to ${to}`);
//     return true;
//   } catch (err) {
//     console.error('Gmail email failed:', err.message);
//     throw err;
//   }
// };

//local testing with Gmail SMTP (requires app password and less secure apps enabled)
// 
const axios = require('axios');
require('dotenv').config();

const getEnv = (key) =>
  String(process.env[key] || '').trim();

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'MediCare Pro',
          email: getEnv('EMAIL_FROM'),
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        proxy: false,
        headers: {
          'api-key': getEnv('BREVO_API_KEY'),
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Brevo API email sent');
    return true;
  } catch (err) {
    console.error('❌ Brevo API error:', err.response?.data || err.message);
    return false;
  }
};
