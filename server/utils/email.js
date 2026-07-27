const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
} else {
  console.warn('Email credentials not configured. Email notifications will be disabled.');
}

async function sendApplicationNotification(adminEmail, adminName, application) {
  if (!transporter) {
    console.log('Email notification skipped (not configured)');
    return { skipped: true };
  }

  const mailOptions = {
    from: EMAIL_FROM,
    to: adminEmail,
    subject: `New Job Application: ${application.jobTitle}`,
    html: `<h2>New Application</h2><p>Student ${application.studentName} applied for ${application.jobTitle}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { error: error.message };
  }
}

module.exports = { sendApplicationNotification };