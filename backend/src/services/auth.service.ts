import { User } from '../models/User.model.js';
import { generateToken, generateVerificationToken } from '../utils/jwt.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { IUser } from '../types/user.types.js';
import { sendPasswordResetEmail, isEmailConfigured } from './email.service.js';

/**
 * Register a new user - Direct access, no email verification needed
 */
export const register = async (
  email: string,
  password: string,
  username: string
): Promise<{ user: IUser; token: string }> => {
  // Validate input
  if (!email || !password || !username) {
    throw new ApiError('Всички полета са задължителни', 400);
  }

  if (password.length < 8) {
    throw new ApiError('Паролата трябва да е поне 8 символа', 400);
  }

  if (username.length < 3) {
    throw new ApiError('Потребителското име трябва да е поне 3 символа', 400);
  }

  // Check if email exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError('Този имейл вече е регистриран', 400);
  }

  // Check if username exists
  const existingUsername = await User.findOne({ 
    username: { $regex: new RegExp(`^${username}$`, 'i') } 
  });
  if (existingUsername) {
    throw new ApiError('Това потребителско име е заето', 400);
  }

  // Create user - automatically verified (no email verification required)
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    username,
    isEmailVerified: true, // Always true - no verification needed
    hasCompletedOnboarding: false,
    language: 'bg',
    theme: 'dark',
  });

  // Generate JWT token
  const token = generateToken({ userId: user._id.toString(), email: user.email });

  // Return user without password
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj as IUser, token };
};

/**
 * Login user
 */
export const login = async (
  email: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  if (!email || !password) {
    throw new ApiError('Имейл и парола са задължителни', 400);
  }

  // Find user with password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    throw new ApiError('Грешен имейл или парола', 401);
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Грешен имейл или парола', 401);
  }

  // Generate JWT token
  const token = generateToken({ userId: user._id.toString(), email: user.email });

  // Return user without password
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj as IUser, token };
};

/**
 * Forgot password - sends reset email if Gmail is configured
 */
export const forgotPassword = async (email: string): Promise<void> => {
  if (!email) {
    throw new ApiError('Имейлът е задължителен', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Don't reveal if user exists
  if (!user) {
    return;
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    throw new ApiError('Имейл функцията не е конфигурирана. Свържете се с администратор.', 503);
  }

  // Generate reset token
  const resetToken = generateVerificationToken();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetExpires;
  await user.save();

  // Send email
  const sent = await sendPasswordResetEmail(user.email, resetToken);
  
  if (!sent) {
    throw new ApiError('Грешка при изпращане на имейл. Опитайте отново.', 500);
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  if (!token || !newPassword) {
    throw new ApiError('Токен и нова парола са задължителни', 400);
  }

  if (newPassword.length < 8) {
    throw new ApiError('Паролата трябва да е поне 8 символа', 400);
  }

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw new ApiError('Невалиден или изтекъл токен', 400);
  }

  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

// These are kept for API compatibility but not used
export const verifyEmail = async (_token: string): Promise<null> => null;
export const resendVerification = async (_email: string): Promise<void> => {};

export default {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
