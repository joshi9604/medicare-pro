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
const nodemailer = require('nodemailer');
require('dotenv').config();

const getEnv = (key) => String(process.env[key] || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

// Determine email provider based on config
const getTransporter = () => {
  const provider = getEnv('EMAIL_PROVIDER') || 'gmail'; // 'gmail' or 'sendgrid'
  
  if (provider === 'sendgrid') {
    // SendGrid Configuration
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: getEnv('SENDGRID_API_KEY')
      }
    });
  } else {
    const emailPass = getEnv('EMAIL_PASS').replace(/\s/g, '');

    // Gmail Configuration
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      auth: {
        user: getEnv('EMAIL_USER'),
        pass: emailPass
      }
    });
  }
};

exports.sendEmail = async ({ to, subject, html }) => {
  const provider = getEnv('EMAIL_PROVIDER') || 'gmail';
  
  // Check credentials based on provider
  if (provider === 'sendgrid') {
    if (!getEnv('SENDGRID_API_KEY') || getEnv('SENDGRID_API_KEY') === 'your_sendgrid_api_key_here') {
      console.log('📧 Email skipped (no SENDGRID_API_KEY set)');
      return false;
    }
  } else {
    if (!getEnv('EMAIL_USER') || !getEnv('EMAIL_PASS')) {
      console.log('📧 Email skipped (no EMAIL_USER or EMAIL_PASS set)');
      return false;
    }
  }
  
  const transporter = getTransporter();
  const fromEmail = getEnv('EMAIL_FROM') || getEnv('EMAIL_USER') || 'noreply@medicare-pro.com';
  
  try {
    await transporter.sendMail({
      from: `"MediCare Pro 🏥" <${fromEmail}>`,
      to, subject, html
    });
    console.log(`📧 Email sent to ${to} via ${provider}`);
    return true;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    throw err;
  }
};
