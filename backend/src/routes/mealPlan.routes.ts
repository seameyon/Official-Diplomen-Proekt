import { Router } from 'express';
import * as mealPlanController from '../controllers/mealPlan.controller.js';
import { protect, requireVerified, requireOnboarding } from '../middlewares/auth.middleware.js';
import { mealPlanLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(protect);
router.use(requireVerified);

router.get('/current', mealPlanController.getCurrentMealPlan);

router.post(
  '/generate',
  requireOnboarding,
  mealPlanLimiter,
  mealPlanController.generateMealPlan
);

router.get('/history', mealPlanController.getMealPlanHistory);
router.get('/shopping-list', mealPlanController.getShoppingList);
router.put('/replace-meal', requireOnboarding, mealPlanController.replaceMeal);
router.get('/:weekKey', mealPlanController.getMealPlanByWeek);

export default router;
