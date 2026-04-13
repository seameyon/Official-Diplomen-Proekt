export { protect, requireVerified, requireOnboarding, optionalAuth } from './auth.middleware.js';
export { notFound, errorHandler, asyncHandler, ApiError } from './error.middleware.js';
export { generalLimiter, authLimiter, registerLimiter, mealPlanLimiter, recipeLimiter } from './rateLimit.middleware.js';
export { 
  validate, 
  registerSchema, 
  loginSchema, 
  healthProfileSchema, 
  recipeSchema,
  userSettingsSchema,
  forgotPasswordSchema,
  resetPasswordSchema 
} from './validate.middleware.js';
