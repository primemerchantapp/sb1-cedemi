import emailjs from 'emailjs-com';

export const sendEmail = async (toEmail: string, template: string) => {
  try {
    const templateParams = {
      to_email: toEmail,
      message: template,
    };

    await emailjs.send(
      'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
      'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
      templateParams,
      'YOUR_USER_ID' // Replace with your EmailJS user ID
    );
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};