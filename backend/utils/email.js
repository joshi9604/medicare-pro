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

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MediCare Pro" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Brevo Email Sent");
    return true;
  } catch (err) {
    console.log("❌ Brevo Error:", err.message);
    return false;
  }
};