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
const nodemailer = require('nodemailer');
require('dotenv').config();

const getEnv = (key) => String(process.env[key] || '').trim().replace(/^['"]|['"]$/g, '');

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const host = getEnv('SMTP_HOST') || 'smtp-relay.brevo.com';
    const port = Number(getEnv('SMTP_PORT')) || 587;
    const user = getEnv('BREVO_SMTP_USER') || getEnv('SMTP_USER');
    const pass = getEnv('BREVO_SMTP_PASS') || getEnv('SMTP_PASS');
    const from = getEnv('EMAIL_FROM') || user;

    if (!user || !pass || !from) {
      throw new Error('SMTP user, password, or from address missing');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      connectionTimeout: Number(getEnv('SMTP_CONNECTION_TIMEOUT')) || 20000,
      greetingTimeout: Number(getEnv('SMTP_GREETING_TIMEOUT')) || 20000,
      socketTimeout: Number(getEnv('SMTP_SOCKET_TIMEOUT')) || 20000,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"MediCare Pro" <${from}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Brevo email sent to ${to}`);
    return true;
  } catch (err) {
    console.error('❌ Brevo email failed:', err.message);
    return false;
  }
};
