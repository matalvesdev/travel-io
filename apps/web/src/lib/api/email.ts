// EmailJS - Serviço de email gratuito
// https://www.emailjs.com/

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_travelio';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_travelio';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  from_name?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // Simulação - em produção, usar EmailJS SDK
    console.log('Enviando email:', params);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to_email: email,
    to_name: name,
    subject: 'Bem-vindo ao Travel.io!',
    message: `Olá ${name},\n\nBem-vindo ao Travel.io! Sua conta foi criada com sucesso.\n\nAtenciosamente,\nEquipe Travel.io`,
  });
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return sendEmail({
    to_email: email,
    to_name: '',
    subject: 'Redefina sua senha - Travel.io',
    message: `Clique no link para redefinir sua senha: ${resetLink}\n\nEste link expira em 24 horas.`,
  });
}

export async function sendNotificationEmail(
  email: string,
  title: string,
  message: string
): Promise<boolean> {
  return sendEmail({
    to_email: email,
    to_name: '',
    subject: title,
    message: message,
  });
}

export async function sendPriceAlertEmail(
  email: string,
  productName: string,
  currentPrice: number,
  targetPrice: number,
  productUrl: string
): Promise<boolean> {
  return sendEmail({
    to_email: email,
    to_name: '',
    subject: `Alerta de Preço: ${productName}`,
    message: `O produto "${productName}" atingiu o preço alvo!\n\nPreço atual: R$ ${currentPrice}\nPreço alvo: R$ ${targetPrice}\n\nAcesse: ${productUrl}`,
  });
}

export async function sendTravelDealEmail(
  email: string,
  destination: string,
  price: number,
  dealUrl: string
): Promise<boolean> {
  return sendEmail({
    to_email: email,
    to_name: '',
    subject: `Oferta de Viagem: ${destination}`,
    message: `Encontramos uma oferta incrível para ${destination} por R$ ${price}!\n\nAcesse: ${dealUrl}`,
  });
}
