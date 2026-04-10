import nodemailer from 'nodemailer';

const autoReplyMessages = {
  en: {
    subject: 'Thank you for reaching out — Frances Regina',
    text: `Hi {name},

Thank you for reaching out. I review every application personally.

Before we connect, go ahead and pick a time that works for you:
https://cal.com/francesregina

This is a 20-minute conversation, no pressure, no pitch. We talk about your goals, your background, and whether this program is the right fit.

Looking forward to connecting with you.

Best regards,
Frances Regina`
  },
  es: {
    subject: 'Gracias por ponerte en contacto — Frances Regina',
    text: `Hola {name},

Gracias por ponerte en contacto. Reviso cada solicitud personalmente.

Antes de conectar, elige una hora que te funcione:
https://cal.com/francesregina

Esta es una conversación de 20 minutos, sin presión, sin pitch. Hablamos sobre tus objetivos, tu background y si este programa es el ajuste correcto.

Espero conectar contigo.

Saludos,
Frances Regina`
  },
  fr: {
    subject: 'Merci de nous avoir contactés — Frances Regina',
    text: `Bonjour {name},

Merci de nous avoir contactés. J'examine chaque candidature personnellement.

Avant de nous connecter, choisissez un horaire qui vous convient :
https://cal.com/francesregina

C'est une conversation de 20 minutes, sans pression, sans pitch. Nous discutons de vos objectifs, de votre background et de la pertinence de ce programme pour vous.

J'attends avec impatience de vous rencontrer.

Cordialement,
Frances Regina`
  },
  pt: {
    subject: 'Obrigada por entrar em contato — Frances Regina',
    text: `Oi {name},

Obrigada por entrar em contato. Reviso cada solicitação pessoalmente.

Antes de nos conectarmos, escolha um horário que funcione para você:
https://cal.com/francesregina

Esta é uma conversa de 20 minutos, sem pressão, sem pitch. Falamos sobre seus objetivos, seu background e se este programa é o ajuste certo.

Espero conectar com você.

Atenciosamente,
Frances Regina`
  }
};

const transporter = nodemailer.createTransport({
  host: 'mail.francesregina.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@francesregina.com',
    pass: process.env.EMAIL_PASSWORD
  }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://francesregina.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, message, language } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: name, email, message' 
      });
    }

    const lang = language || 'en';
    const autoReply = autoReplyMessages[lang] || autoReplyMessages.en;

    // Email 1: To Frances
    const francesEmail = {
      from: 'info@francesregina.com',
      to: 'frances@francesregina.com',
      subject: 'New contact from Frances Regina website',
      text: `Name: ${name}\nEmail: ${email}\nLanguage: ${lang}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Language:</strong> ${lang}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
    };

    // Email 2: Auto-reply to visitor
    const visitorEmail = {
      from: 'info@francesregina.com',
      to: email,
      subject: autoReply.subject,
      text: autoReply.text.replace('{name}', name),
      html: `<p>${autoReply.text.replace('{name}', name).replace(/\n/g, '<br>')}</p>`
    };

    // Send both emails
    await transporter.sendMail(francesEmail);
    await transporter.sendMail(visitorEmail);

    res.status(200).json({ 
      success: true, 
      message: 'Emails sent successfully'
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error: ${error.message}` 
    });
  }
}
