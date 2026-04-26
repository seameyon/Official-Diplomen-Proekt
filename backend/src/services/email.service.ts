import nodemailer from 'nodemailer';
import { env } from '../config/env.js';


const createTransporter = () => {
  if (!env.emailUser || !env.emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });
};

const transporter = createTransporter();


export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!transporter) {
    console.log('📧 Email not configured - skipping send to:', to);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Yumly 🍳" <${env.emailUser}>`,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent to:', to);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};


export const sendWelcomeEmail = async (email: string, username: string): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); color: white; padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🍳</div>
          <h1 style="margin: 0; font-size: 28px;">Добре дошъл в Yumly!</h1>
        </div>
        <div style="padding: 30px; color: #5c4a3a;">
          <h2 style="color: #2d5a27; margin-top: 0;">Здравей, ${username}! 👋</h2>
          <p style="line-height: 1.6;">Радваме се, че се присъедини към нашата общност от любители на готвенето!</p>
          
          <div style="background: #f5f0e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong>Какво можеш да правиш в Yumly:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li style="margin: 10px 0;">🌍 Разглеждай рецепти от 5 различни региона</li>
              <li style="margin: 10px 0;">❤️ Запазвай любимите си рецепти</li>
              <li style="margin: 10px 0;">📅 Планирай седмично меню с AI</li>
              <li style="margin: 10px 0;">📊 Следи калориите и хранителните стойности</li>
              <li style="margin: 10px 0;">🍳 Създавай и споделяй собствени рецепти</li>
            </ul>
          </div>
          
          <p style="line-height: 1.6;">Готов ли си да започнеш кулинарното си приключение?</p>
          
          <div style="text-align: center;">
            <a href="${env.frontendUrl}" style="display: inline-block; background: #2d5a27; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
              Започни сега →
            </a>
          </div>
        </div>
        <div style="background: #f5f0e8; padding: 20px; text-align: center; color: #8b7355; font-size: 14px;">
          <p style="margin: 5px 0;">© 2024 Yumly - Твоят кулинарен помощник</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, '🎉 Добре дошъл в Yumly!', html);
};


export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  const verifyUrl = `${env.frontendUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2d5a27; margin: 0;">🍳 Yumly</h1>
        <p style="color: #666;">Вкусно хранене</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c43 100%); padding: 30px; border-radius: 15px; text-align: center;">
        <h2 style="color: white; margin: 0 0 15px 0;">Добре дошъл! 🎉</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 25px 0;">
          Моля, потвърди имейла си за да активираш акаунта.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: white; color: #2d5a27; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: bold;">
          Потвърди Имейл ✓
        </a>
      </div>
      
      <p style="margin-top: 25px; color: #999; font-size: 12px; text-align: center;">
        Линкът е валиден 24 часа. Ако не си създал акаунт, игнорирай този имейл.
      </p>
    </div>
  `;

  return sendEmail(email, '🍳 Yumly - Потвърди имейла си', html);
};


export const sendPasswordResetEmail = async (email: string, token: string): Promise<boolean> => {
  const resetUrl = `${env.frontendUrl}/reset-password/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f0e8; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%); color: white; padding: 40px 30px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
          <h1 style="margin: 0; font-size: 24px;">Възстановяване на парола</h1>
        </div>
        <div style="padding: 30px; color: #5c4a3a;">
          <h2 style="color: #c53030; margin-top: 0;">Забравена парола?</h2>
          <p style="line-height: 1.6;">Получихме заявка за възстановяване на паролата на твоя акаунт.</p>
          
          <p style="line-height: 1.6;">Натисни бутона по-долу, за да създадеш нова парола:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background: #2d5a27; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
              Създай нова парола →
            </a>
          </div>
          
          <div style="background: #fff5f5; border-left: 4px solid #c53030; padding: 15px; margin: 20px 0; color: #c53030;">
            <strong>⚠️ Важно:</strong> Този линк е валиден само 1 час. 
            Ако не си поискал смяна на паролата, моля игнорирай този имейл.
          </div>
        </div>
        <div style="background: #f5f0e8; padding: 20px; text-align: center; color: #8b7355; font-size: 14px;">
          <p style="margin: 5px 0;">© 2024 Yumly - Твоят кулинарен помощник</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, '🔐 Yumly - Възстановяване на парола', html);
};

export const isEmailConfigured = (): boolean => {
  return !!(env.emailUser && env.emailPass);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  isEmailConfigured,
};
