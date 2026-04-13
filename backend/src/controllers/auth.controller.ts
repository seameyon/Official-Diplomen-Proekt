import { Request, Response } from 'express';
import crypto from 'crypto';
import { asyncHandler, ApiError } from '../middlewares/error.middleware.js';
import * as authService from '../services/auth.service.js';
import { sendWelcomeEmail, sendPasswordResetEmail, isEmailConfigured } from '../services/email.service.js';
import { User } from '../models/User.model.js';
import bcrypt from 'bcryptjs';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  const { user, token } = await authService.register(email, password, username);

  // Send welcome email (non-blocking)
  sendWelcomeEmail(email, username).catch(err => {
    console.log('[Auth] Welcome email failed:', err.message);
  });

  res.status(201).json({
    success: true,
    message: 'Регистрацията е успешна!',
    data: { user, token },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.json({
    success: true,
    message: 'Успешен вход!',
    data: { user, token },
  });
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email (not used - kept for compatibility)
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Имейлът е потвърден',
  });
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification (not used)
 * @access  Public
 */
export const resendVerification = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Не е необходима верификация',
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError('Моля, въведете имейл', 400);
  }

  // Check if email is configured
  if (!isEmailConfigured()) {
    throw new ApiError('Email функционалността не е конфигурирана. Моля, свържете се с администратор.', 500);
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Always return success to prevent email enumeration
  if (!user) {
    console.log('[Auth] Password reset requested for non-existent email:', email);
    res.json({
      success: true,
      message: 'Ако имейлът съществува, ще получите линк за възстановяване на паролата.',
    });
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save to user
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // Send email
  const emailSent = await sendPasswordResetEmail(email, resetToken);
  
  if (!emailSent) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new ApiError('Грешка при изпращане на имейл. Опитайте отново.', 500);
  }

  console.log('[Auth] Password reset email sent to:', email);

  res.json({
    success: true,
    message: 'Ако имейлът съществува, ще получите линк за възстановяване на паролата.',
  });
});

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    throw new ApiError('Невалиден токен', 400);
  }

  if (!password || password.length < 8) {
    throw new ApiError('Паролата трябва да е поне 8 символа', 400);
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+password');

  if (!user) {
    throw new ApiError('Невалиден или изтекъл токен. Моля, поискайте нов линк.', 400);
  }

  // Update password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  console.log('[Auth] Password reset successful for:', user.email);

  res.json({
    success: true,
    message: 'Паролата е променена успешно! Можете да влезете с новата парола.',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        isEmailVerified: true,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        healthProfile: user.healthProfile,
        theme: user.theme,
        language: user.language,
        isAdmin: user.isAdmin || false,
        createdAt: user.createdAt,
      },
    },
  });
});

export default {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
};
