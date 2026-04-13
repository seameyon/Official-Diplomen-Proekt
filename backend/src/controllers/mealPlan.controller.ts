import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middlewares/error.middleware.js';
import * as mealPlanService from '../services/mealPlan.service.js';
import { IWeeklyPlan } from '../types/mealPlan.types.js';

/**
 * @route   POST /api/meal-plans/generate
 * @desc    Generate a new weekly meal plan
 * @access  Private (requires onboarding)
 */
export const generateMealPlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { forceRegenerate = false } = req.body;

  const mealPlan = await mealPlanService.generateMealPlan(userId, forceRegenerate);

  res.json({
    success: true,
    message: forceRegenerate ? 'Meal plan regenerated successfully' : 'Meal plan generated successfully',
    data: { mealPlan },
  });
});

/**
 * @route   GET /api/meal-plans/current
 * @desc    Get current week's meal plan
 * @access  Private
 */
export const getCurrentMealPlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const mealPlan = await mealPlanService.getCurrentMealPlan(userId);

  if (!mealPlan) {
    res.json({
      success: true,
      data: null,
      message: 'No meal plan for current week. Generate one to get started!',
    });
    return;
  }

  res.json({
    success: true,
    data: { mealPlan },
  });
});

/**
 * @route   GET /api/meal-plans/history
 * @desc    Get meal plan history
 * @access  Private
 */
export const getMealPlanHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { page = '1', limit = '10' } = req.query;

  const result = await mealPlanService.getMealPlanHistory(
    userId,
    parseInt(page as string),
    Math.min(parseInt(limit as string), 50)
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @route   PUT /api/meal-plans/replace-meal
 * @desc    Replace a single meal in the current plan
 * @access  Private
 */
export const replaceMeal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { day, mealType, newRecipeId } = req.body;

  // Validate day
  const validDays: (keyof IWeeklyPlan)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];
  if (!validDays.includes(day)) {
    throw new ApiError('Invalid day', 400);
  }

  // Validate meal type
  const validMealTypes = ['breakfast', 'lunch', 'dinner'];
  if (!validMealTypes.includes(mealType)) {
    throw new ApiError('Invalid meal type', 400);
  }

  const mealPlan = await mealPlanService.replaceMeal(
    userId,
    day,
    mealType as 'breakfast' | 'lunch' | 'dinner',
    newRecipeId
  );

  res.json({
    success: true,
    message: 'Meal replaced successfully',
    data: { mealPlan },
  });
});

/**
 * @route   GET /api/meal-plans/:weekKey
 * @desc    Get meal plan by week key
 * @access  Private
 */
export const getMealPlanByWeek = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { weekKey } = req.params;

  // Validate week key format (YYYY-WW)
  if (!/^\d{4}-\d{2}$/.test(weekKey)) {
    throw new ApiError('Invalid week key format. Use YYYY-WW', 400);
  }

  const { plans } = await mealPlanService.getMealPlanHistory(userId, 1, 100);
  const mealPlan = plans.find(p => p.weekKey === weekKey);

  if (!mealPlan) {
    throw new ApiError('Meal plan not found for this week', 404);
  }

  res.json({
    success: true,
    data: { mealPlan },
  });
});

/**
 * @route   GET /api/meal-plans/shopping-list
 * @desc    Generate shopping list from current meal plan
 * @access  Private
 */
export const getShoppingList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const mealPlan = await mealPlanService.getCurrentMealPlan(userId);

  if (!mealPlan) {
    throw new ApiError('No meal plan found for current week', 404);
  }

  // Aggregate ingredients from all meals
  const ingredientMap = new Map<string, { amount: number; unit: string }>();

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const mealTypes = ['breakfast', 'lunch', 'dinner'] as const;

  for (const day of days) {
    for (const mealType of mealTypes) {
      const meal = mealPlan.weeklyPlan[day][mealType];
      // Note: In a full implementation, we'd fetch recipe details
      // and aggregate actual ingredients
    }
  }

  // For now, return a placeholder
  res.json({
    success: true,
    data: {
      weekKey: mealPlan.weekKey,
      message: 'Shopping list feature coming soon! This would aggregate all ingredients from your meal plan.',
      // ingredients: Array.from(ingredientMap.entries()).map(([name, data]) => ({
      //   name,
      //   ...data,
      // })),
    },
  });
});

export default {
  generateMealPlan,
  getCurrentMealPlan,
  getMealPlanHistory,
  replaceMeal,
  getMealPlanByWeek,
  getShoppingList,
};
