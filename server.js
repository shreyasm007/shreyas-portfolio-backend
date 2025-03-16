// server.js
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS if your frontend is hosted elsewhere

// Create a transporter using your SMTP details
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,           // "smtp.gmail.com"
  port: Number(process.env.SMTP_PORT) || 465, // 465 for SSL/TLS
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to mail server:', error);
  } else {
    console.log('Mail server is ready to take messages.');
  }
});

// POST endpoint to send an email
app.post('/api/send', async (req, res) => {
  // Expecting a JSON body with name, email, and message
  const { name, email, message } = req.body;

  // Configure the mail options
  const mailOptions = {
    from: process.env.SMTP_USER, // Sender address (your email)
    to: process.env.RECEIVER_EMAIL, // Where you want to receive the email
    subject: `New message from ${name} <${email}>`,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ status: 'success', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ status: 'fail', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
