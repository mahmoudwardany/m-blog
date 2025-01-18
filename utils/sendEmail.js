import nodemailer from 'nodemailer';

export default async (userEmail, subject, htmlTemplate) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.APP_EMAIL_ADDRESS,
      to: userEmail,
      subject: subject, 
      html: htmlTemplate, 
    });
  } catch (error) {
    throw new Error('Internal server Error (nodemailer)');
  }
};
