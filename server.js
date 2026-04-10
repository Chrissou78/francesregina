const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'mail.francesregina.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'frances@francesregina.com',
    pass: process.env.EMAIL_PASSWORD || 'YOUR_EMAIL_PASSWORD_HERE'
  }
});

// Auto-reply messages by language
const autoReplyMessages = {
  en: {
    subject: "Thank you for reaching out",
    text: "Hi {name},\n\nThank you for reaching out. I review every application personally. Before we connect, go ahead and pick a time that works for you. This is a 20-minute conversation, no pressure, no pitch. We talk about your goals, your background, and whether this program is the right fit.\n\nBook your time here: https://cal.com/francesregina\n\nLooking forward to it.\n\nBest regards,\nFrances Regina\nfrances@francesregina.com"
  },
  es: {
    subject: "Gracias por ponerte en contacto",
    text: "Hola {name},\n\nGracias por ponerte en contacto. Reviso cada solicitud personalmente. Antes de que nos conectemos, adelante y elige un horario que te funcione. Esta es una conversación de 20 minutos, sin presión, sin pitch. Hablamos sobre tus objetivos, tu trasfondo, y si este programa es el adecuado para ti.\n\nReserva tu tiempo aquí: https://cal.com/francesregina\n\nEspero hablar contigo.\n\nSaludos,\nFrances Regina\nfrances@francesregina.com"
  },
  fr: {
    subject: "Merci de nous avoir contactés",
    text: "Bonjour {name},\n\nMerci de nous avoir contactés. J'examine chaque candidature personnellement. Avant que nous nous connectons, allez-y et choisissez un moment qui vous convient. C'est une conversation de 20 minutes, sans pression, sans pitch. Nous parlons de vos objectifs, de votre parcours, et de savoir si ce programme vous convient.\n\nRéservez votre créneau ici: https://cal.com/francesregina\n\nJ'ai hâte de vous parler.\n\nCordialement,\nFrances Regina\nfrances@francesregina.com"
  },
  pt: {
    subject: "Obrigada por entrar em contato",
    text: "Oi {name},\n\nObrigada por entrar em contato. Reviso cada inscrição pessoalmente. Antes de nos conectarmos, vá em frente e escolha um horário que funcione para você. Esta é uma conversa de 20 minutos, sem pressão, sem pitch. Conversamos sobre seus objetivos, seu background, e se este programa é o ajuste certo para você.\n\nReserve seu horário aqui: https://cal.com/francesregina\n\nEspero conversar com você.\n\nAtenciosamente,\nFrances Regina\nfrances@francesregina.com"
  }
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, language } = req.body;
    const lang = language || 'en';
    const replyMsg = autoReplyMessages[lang];

    // Email to Frances
    const francesEmail = {
      from: 'frances@francesregina.com',
      to: 'frances@francesregina.com',
      subject: 'New contact from Frances Regina website',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Language:</strong> ${lang.toUpperCase()}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    // Auto-reply to visitor
    const visitorEmail = {
      from: 'frances@francesregina.com',
      to: email,
      subject: replyMsg.subject,
      text: replyMsg.text.replace('{name}', name)
    };

    // Send both emails
    await transporter.sendMail(francesEmail);
    await transporter.sendMail(visitorEmail);

    res.json({ 
      success: true, 
      message: 'Emails sent successfully' 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending email',
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
