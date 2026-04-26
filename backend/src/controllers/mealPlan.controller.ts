import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middlewares/error.middleware.js';
import * as mealPlanService from '../services/mealPlan.service.js';
import { IWeeklyPlan } from '../types/mealPlan.types.js';

export const generateMealPlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { forceRegenerate = false } = req.body;

  const mealPlan = await mealPlanService.generateMealPlan(userId, forceRegenerate);

  res.json({
    success: true,
    message: forceRegenerate
      ? 'Хранителният план е генериран наново успешно.'
      : 'Хранителният план е генериран успешно.',
    data: { mealPlan },
  });
});

export const getCurrentMealPlan = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const mealPlan = await mealPlanService.getCurrentMealPlan(userId);

  if (!mealPlan) {
    res.json({
      success: true,
      data: null,
      message: 'Няма хранителен план за текущата седмица.',
    });
    return;
  }

  res.json({
    success: true,
    data: { mealPlan },
  });
});

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

export const replaceMeal = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { day, mealType, newRecipeId } = req.body;

  const validDays: (keyof IWeeklyPlan)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  if (!validDays.includes(day)) {
    throw new ApiError('Невалиден ден от седмицата.', 400);
  }

  const validMealTypes = ['breakfast', 'lunch', 'dinner'];

  if (!validMealTypes.includes(mealType)) {
    throw new ApiError('Невалиден тип хранене.', 400);
  }

  const mealPlan = await mealPlanService.replaceMeal(
    userId,
    day,
    mealType as 'breakfast' | 'lunch' | 'dinner',
    newRecipeId
  );

  res.json({
    success: true,
    message: 'Храненето е подменено успешно.',
    data: { mealPlan },
  });
});

export const getMealPlanByWeek = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { weekKey } = req.params;

  if (!/^\d{4}-\d{2}$/.test(weekKey)) {
    throw new ApiError('Невалиден формат на седмицата. Използвайте YYYY-WW.', 400);
  }

  const { plans } = await mealPlanService.getMealPlanHistory(userId, 1, 100);
  const mealPlan = plans.find((p) => p.weekKey === weekKey);

  if (!mealPlan) {
    throw new ApiError('Не е намерен хранителен план за тази седмица.', 404);
  }

  res.json({
    success: true,
    data: { mealPlan },
  });
});

export const getShoppingList = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const mealPlan = await mealPlanService.getCurrentMealPlan(userId);

  if (!mealPlan) {
    throw new ApiError('Няма хранителен план за текущата седмица.', 404);
  }

  res.json({
    success: true,
    data: {
      weekKey: mealPlan.weekKey,
      message:
        'Функционалността за автоматично генериране на списък за пазаруване е предвидена като бъдещо разширение на системата.',
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