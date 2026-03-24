const nodemailer = require('nodemailer');
require('dotenv').config();

// Determine email provider based on config
const getTransporter = () => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail'; // 'gmail' or 'sendgrid'
  
  if (provider === 'sendgrid') {
    // SendGrid Configuration
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  } else {
    // Gmail Configuration
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
};

exports.sendEmail = async ({ to, subject, html }) => {
  const provider = process.env.EMAIL_PROVIDER || 'gmail';
  
  // Check credentials based on provider
  if (provider === 'sendgrid') {
    if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY === 'your_sendgrid_api_key_here') {
      console.log('📧 Email skipped (no SENDGRID_API_KEY set)');
      return;
    }
  } else {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email skipped (no EMAIL_USER or EMAIL_PASS set)');
      return;
    }
  }
  
  const transporter = getTransporter();
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@medicare-pro.com';
  
  try {
    await transporter.sendMail({
      from: `"MediCare Pro 🏥" <${fromEmail}>`,
      to, subject, html
    });
    console.log(`📧 Email sent to ${to} via ${provider}`);
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    throw err;
  }
};
