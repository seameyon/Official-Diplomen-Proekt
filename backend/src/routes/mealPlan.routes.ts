import { Router } from 'express';
import * as mealPlanController from '../controllers/mealPlan.controller.js';
import { protect, requireVerified, requireOnboarding } from '../middlewares/auth.middleware.js';
import { mealPlanLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// All routes are protected and require onboarding
router.use(protect);
router.use(requireVerified);

// Get current meal plan (doesn't require onboarding - to show empty state)
router.get('/current', mealPlanController.getCurrentMealPlan);

// Generation requires onboarding
router.post(
  '/generate',
  requireOnboarding,
  mealPlanLimiter,
  mealPlanController.generateMealPlan
);

// Other routes
router.get('/history', mealPlanController.getMealPlanHistory);
router.get('/shopping-list', mealPlanController.getShoppingList);
router.put('/replace-meal', requireOnboarding, mealPlanController.replaceMeal);
router.get('/:weekKey', mealPlanController.getMealPlanByWeek);

export default router;
