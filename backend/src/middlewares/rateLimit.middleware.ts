import rateLimit from 'express-rate-limit';


export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute 
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for MealDB proxy and static assets
  skip: (req) => {
    const path = req.path || req.url || '';
    return path.includes('/mealdb') || path.includes('/uploads');
  },
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window (increased from 10)
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});


export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many accounts created, please try again after an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const mealPlanLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 generations per hour
  message: {
    success: false,
    message: 'Too many meal plan generations, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const recipeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 recipes per hour
  message: {
    success: false,
    message: 'Too many recipes created, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  generalLimiter,
  authLimiter,
  registerLimiter,
  mealPlanLimiter,
  recipeLimiter,
};
