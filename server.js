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
    user: process.env.SMTP_USER,         // Your Gmail address
    pass: process.env.SMTP_PASS,         // Your app password
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

/**
 * Route: /api/send
 * Purpose: Sends the contact message to your admin email.
 */
app.post('/api/send', async (req, res) => {
  // Expecting a JSON body with name, email, and message
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'fail', error: 'All fields are required.' });
  }

  const adminMailOptions = {
    from: process.env.SMTP_USER, // Sender address (your email)
    to: process.env.RECEIVER_EMAIL, // Admin's receiving email
    subject: `shreyas-portfolio: New message from ${name} <${email}>`,
    text: `You received a new message from your website contact form:\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
  };

  try {
    const info = await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent:', info.response);
    res.status(200).json({ status: 'success', info });
  } catch (error) {
    console.error('Error sending admin email:', error);
    res.status(500).json({ status: 'fail', error: error.message });
  }
});

/**
 * Route: /api/thankyou
 * Purpose: Sends a thank-you email to the user who contacted you.
 */
app.post('/api/thankyou', async (req, res) => {
  // Expecting a JSON body with name and email
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ status: 'fail', error: 'Name and email are required.' });
  }

  const userMailOptions = {
    from: process.env.SMTP_USER, // Your email as sender
    to: email, // User's email
    subject: 'Thank you for reaching out!',
    text: `Dear ${name},\n\nThank you for contacting me. I have received your message and will get back to you shortly.\n\nThanks & Regards,\nShreyas Mohite`,
  };

  try {
    const info = await transporter.sendMail(userMailOptions);
    console.log('Thank-you email sent:', info.response);
    res.status(200).json({ status: 'success', info });
  } catch (error) {
    console.error('Error sending thank-you email:', error);
    res.status(500).json({ status: 'fail', error: error.message });
  }
});

// Only start the server if not running in a Vercel environment
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
