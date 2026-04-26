import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { authLimiter, registerLimiter } from '../middlewares/rateLimit.middleware.js';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middlewares/validate.middleware.js';

const router = Router();


router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/verify-email',
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  authLimiter,
  authController.resendVerification
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  authController.resetPassword
);


router.get('/me', protect, authController.getMe);

export default router;
