import { groqClient, GROQ_MODEL, MEAL_PLAN_SYSTEM_PROMPT } from '../config/groq.js';
import { MealPlan } from '../models/MealPlan.model.js';
import { User } from '../models/User.model.js';
import { Recipe } from '../models/Recipe.model.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { getCurrentWeekKey } from '../utils/jwt.js';
import { IMealPlan, IWeeklyPlan, IDailyCalories, INutritionSummary } from '../types/mealPlan.types.js';
import { IHealthProfile } from '../types/user.types.js';
import { Types } from 'mongoose';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/**
 * Generate weekly meal plan - uses Groq AI if available, otherwise falls back to algorithm
 */
export const generateMealPlan = async (
  userId: string,
  forceRegenerate: boolean = false
): Promise<IMealPlan> => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError('Потребителят не е намерен', 404);
  }

  if (!user.healthProfile || !user.hasCompletedOnboarding) {
    throw new ApiError('Моля, първо попълнете здравния си профил', 400);
  }

  const weekKey = getCurrentWeekKey();

  // Check if plan exists for this week
  const existingPlan = await MealPlan.findOne({
    userId: new Types.ObjectId(userId),
    weekKey,
  });

  if (existingPlan && !forceRegenerate) {
    return existingPlan;
  }

  // Get candidate recipes from database
  const candidateRecipes = await getMatchingCandidates(user.healthProfile);

  let mealPlanData;

  // Try Groq AI first if available
  if (groqClient && candidateRecipes.length > 0) {
    try {
      mealPlanData = await generateWithGroq(user.healthProfile, candidateRecipes, userId, weekKey);
    } catch (error) {
      console.log('Groq API грешка, използване на алгоритъм:', error);
      mealPlanData = generateWithAlgorithm(user.healthProfile, candidateRecipes, userId, weekKey);
    }
  } else {
    // Fallback to algorithm
    mealPlanData = generateWithAlgorithm(user.healthProfile, candidateRecipes, userId, weekKey);
  }

  // Save or update meal plan
  if (existingPlan) {
    existingPlan.weeklyPlan = mealPlanData.weeklyPlan;
    existingPlan.totalDailyCalories = mealPlanData.totalDailyCalories;
    existingPlan.nutritionSummary = mealPlanData.nutritionSummary;
    existingPlan.notes = mealPlanData.notes;
    existingPlan.regenerateHistory.push({
      regeneratedAt: new Date(),
      reason: 'Потребителят поиска нов план',
    });
    await existingPlan.save();
    return existingPlan;
  }

  const newPlan = await MealPlan.create(mealPlanData);
  return newPlan;
};

/**
 * Generate meal plan using Groq AI
 */
const generateWithGroq = async (
  profile: IHealthProfile,
  candidates: any[],
  userId: string,
  weekKey: string
) => {
  const userPrompt = buildUserPrompt(profile, candidates);

  const completion = await groqClient!.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: MEAL_PLAN_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const responseContent = completion.choices[0]?.message?.content;
  
  if (!responseContent) {
    throw new ApiError('Неуспешно генериране на хранителен план', 500);
  }

  const aiPlan = JSON.parse(responseContent);
  return transformAIPlan(aiPlan, userId, weekKey);
};

/**
 * Generate meal plan using algorithm (fallback)
 */
const generateWithAlgorithm = (
  profile: IHealthProfile,
  candidates: any[],
  userId: string,
  weekKey: string
) => {
  const targetCalories = profile.dailyCalorieTarget || 2000;
  const breakfastCalories = Math.round(targetCalories * 0.25);
  const lunchCalories = Math.round(targetCalories * 0.35);
  const dinnerCalories = Math.round(targetCalories * 0.40);

  // Group recipes by tags
  const breakfastRecipes = candidates.filter(r => 
    r.tags?.includes('breakfast') || r.tags?.includes('snack')
  );
  const lunchRecipes = candidates.filter(r => 
    r.tags?.includes('lunch') || r.tags?.includes('dinner')
  );
  const dinnerRecipes = candidates.filter(r => 
    r.tags?.includes('dinner') || r.tags?.includes('lunch')
  );

  // Default suggestions if not enough recipes
  const defaultBreakfast = {
    title: 'Овесена каша с плодове',
    calories: breakfastCalories,
    protein: 12,
    carbs: 45,
    fat: 8,
    prepTime: 10,
  };

  const defaultLunch = {
    title: 'Салата с пилешко месо',
    calories: lunchCalories,
    protein: 35,
    carbs: 25,
    fat: 15,
    prepTime: 20,
  };

  const defaultDinner = {
    title: 'Печена риба със зеленчуци',
    calories: dinnerCalories,
    protein: 30,
    carbs: 30,
    fat: 18,
    prepTime: 35,
  };

  const weeklyPlan: IWeeklyPlan = {} as IWeeklyPlan;
  const totalDailyCalories: IDailyCalories = {} as IDailyCalories;

  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCals = 0;

  for (let i = 0; i < DAYS.length; i++) {
    const day = DAYS[i];
    
    // Select recipes for each meal type (with rotation)
    const breakfast = breakfastRecipes.length > 0 
      ? breakfastRecipes[i % breakfastRecipes.length]
      : null;
    
    const lunch = lunchRecipes.length > 0
      ? lunchRecipes[i % lunchRecipes.length]
      : null;
    
    const dinner = dinnerRecipes.length > 0
      ? dinnerRecipes[(i + 3) % dinnerRecipes.length]
      : null;

    const breakfastMeal = breakfast ? {
      recipeId: breakfast._id,
      title: breakfast.title,
      servings: 1,
      calories: breakfast.nutrition?.calories || breakfastCalories,
      protein: breakfast.nutrition?.protein || 12,
      carbs: breakfast.nutrition?.carbs || 40,
      fat: breakfast.nutrition?.fat || 8,
      prepTime: (breakfast.prepTime || 0) + (breakfast.cookTime || 0),
      suggested: false,
      reason: 'Подбрано за закуска',
    } : {
      recipeId: null,
      ...defaultBreakfast,
      servings: 1,
      suggested: true,
      reason: 'Препоръчано - лек старт на деня',
    };

    const lunchMeal = lunch ? {
      recipeId: lunch._id,
      title: lunch.title,
      servings: 1,
      calories: lunch.nutrition?.calories || lunchCalories,
      protein: lunch.nutrition?.protein || 30,
      carbs: lunch.nutrition?.carbs || 35,
      fat: lunch.nutrition?.fat || 12,
      prepTime: (lunch.prepTime || 0) + (lunch.cookTime || 0),
      suggested: false,
      reason: 'Подбрано за обяд',
    } : {
      recipeId: null,
      ...defaultLunch,
      servings: 1,
      suggested: true,
      reason: 'Препоръчано - балансиран обяд',
    };

    const dinnerMeal = dinner ? {
      recipeId: dinner._id,
      title: dinner.title,
      servings: 1,
      calories: dinner.nutrition?.calories || dinnerCalories,
      protein: dinner.nutrition?.protein || 28,
      carbs: dinner.nutrition?.carbs || 30,
      fat: dinner.nutrition?.fat || 15,
      prepTime: (dinner.prepTime || 0) + (dinner.cookTime || 0),
      suggested: false,
      reason: 'Подбрано за вечеря',
    } : {
      recipeId: null,
      ...defaultDinner,
      servings: 1,
      suggested: true,
      reason: 'Препоръчано - лека вечеря',
    };

    weeklyPlan[day] = {
      breakfast: breakfastMeal,
      lunch: lunchMeal,
      dinner: dinnerMeal,
      snacks: [],
    };

    const dayCalories = breakfastMeal.calories + lunchMeal.calories + dinnerMeal.calories;
    totalDailyCalories[day] = dayCalories;
    totalCals += dayCalories;
    totalProtein += breakfastMeal.protein + lunchMeal.protein + dinnerMeal.protein;
    totalCarbs += breakfastMeal.carbs + lunchMeal.carbs + dinnerMeal.carbs;
    totalFat += breakfastMeal.fat + lunchMeal.fat + dinnerMeal.fat;
  }

  return {
    userId: new Types.ObjectId(userId),
    weekKey,
    weeklyPlan,
    totalDailyCalories,
    nutritionSummary: {
      avgProtein: Math.round(totalProtein / 7),
      avgCarbs: Math.round(totalCarbs / 7),
      avgFat: Math.round(totalFat / 7),
      avgCalories: Math.round(totalCals / 7),
    },
    notes: `Персонализиран план според твоите цели: ${profile.goal === 'lose_weight' ? 'отслабване' : profile.goal === 'gain_muscle' ? 'качване на мускулна маса' : 'поддържане на теглото'}. Дневен калориен таргет: ${targetCalories} ккал.`,
    isActive: true,
    regenerateHistory: [],
  };
};

/**
 * Get current week's meal plan
 */
export const getCurrentMealPlan = async (userId: string): Promise<IMealPlan | null> => {
  const weekKey = getCurrentWeekKey();
  
  const mealPlan = await MealPlan.findOne({
    userId: new Types.ObjectId(userId),
    weekKey,
    isActive: true,
  });

  return mealPlan;
};

/**
 * Get meal plan history
 */
export const getMealPlanHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  plans: IMealPlan[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;
  const total = await MealPlan.countDocuments({ userId: new Types.ObjectId(userId) });
  const plans = await MealPlan.find({ userId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    plans: plans as IMealPlan[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Replace a single meal in the plan
 */
export const replaceMeal = async (
  userId: string,
  day: keyof IWeeklyPlan,
  mealType: 'breakfast' | 'lunch' | 'dinner',
  newRecipeId?: string
): Promise<IMealPlan> => {
  const weekKey = getCurrentWeekKey();
  
  const mealPlan = await MealPlan.findOne({
    userId: new Types.ObjectId(userId),
    weekKey,
  });

  if (!mealPlan) {
    throw new ApiError('Няма хранителен план за тази седмица', 404);
  }

  const user = await User.findById(userId);
  if (!user?.healthProfile) {
    throw new ApiError('Здравният профил не е намерен', 404);
  }

  let newMeal;
  
  if (newRecipeId) {
    const recipe = await Recipe.findById(newRecipeId);
    if (!recipe) {
      throw new ApiError('Рецептата не е намерена', 404);
    }
    newMeal = {
      recipeId: recipe._id,
      title: recipe.title,
      servings: 1,
      calories: recipe.nutrition?.calories || 0,
      protein: recipe.nutrition?.protein || 0,
      carbs: recipe.nutrition?.carbs || 0,
      fat: recipe.nutrition?.fat || 0,
      prepTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
      suggested: false,
      reason: 'Избрано от потребителя',
    };
  } else {
    const currentMeal = mealPlan.weeklyPlan[day][mealType];
    const alternatives = await getAlternatives(user.healthProfile, mealType, currentMeal.recipeId?.toString());
    
    if (alternatives.length === 0) {
      throw new ApiError('Няма налични алтернативни рецепти', 404);
    }

    const recipe = alternatives[0];
    newMeal = {
      recipeId: recipe._id,
      title: recipe.title,
      servings: 1,
      calories: recipe.nutrition?.calories || 0,
      protein: recipe.nutrition?.protein || 0,
      carbs: recipe.nutrition?.carbs || 0,
      fat: recipe.nutrition?.fat || 0,
      prepTime: (recipe.prepTime || 0) + (recipe.cookTime || 0),
      suggested: false,
      reason: 'Алтернативно предложение',
    };
  }

  mealPlan.weeklyPlan[day][mealType] = newMeal;

  // Recalculate daily calories
  const dayMeals = mealPlan.weeklyPlan[day];
  mealPlan.totalDailyCalories[day] = 
    dayMeals.breakfast.calories + 
    dayMeals.lunch.calories + 
    dayMeals.dinner.calories;

  await mealPlan.save();
  return mealPlan;
};

// ==================== Helper Functions ====================

const getMatchingCandidates = async (profile: IHealthProfile) => {
  const query: Record<string, unknown> = { isPublished: true };

  // Dietary preferences
  if (profile.dietaryPreference && profile.dietaryPreference !== 'none') {
    query.tags = { $in: [profile.dietaryPreference] };
  }

  const recipes = await Recipe.find(query)
    .limit(50)
    .select('_id title nutrition prepTime cookTime tags servings')
    .lean();

  return recipes;
};

const buildUserPrompt = (profile: IHealthProfile, candidates: unknown[]): string => {
  return `
Създай 7-дневен хранителен план за потребител със следния профил:

ЗДРАВЕН ПРОФИЛ:
- Дневен калориен таргет: ${profile.dailyCalorieTarget} ккал
- Протеин таргет: ${profile.proteinTarget}g
- Въглехидрати таргет: ${profile.carbsTarget}g
- Мазнини таргет: ${profile.fatTarget}g
- Диетични предпочитания: ${profile.dietaryPreference}
- Алергии: ${profile.allergies?.length > 0 ? profile.allergies.join(', ') : 'Няма'}
- Нелюбими съставки: ${profile.dislikedIngredients?.length > 0 ? profile.dislikedIngredients.join(', ') : 'Няма'}
- Цел: ${profile.goal === 'lose_weight' ? 'Отслабване' : profile.goal === 'gain_muscle' ? 'Качване на мускули' : 'Поддържане'}

НАЛИЧНИ РЕЦЕПТИ (ИЗПОЛЗВАЙ ПЪРВО ТЯХ):
${JSON.stringify(candidates, null, 2)}

ИНСТРУКЦИИ:
1. Създай балансиран 7-дневен план (Понеделник до Неделя)
2. Използвай рецептите от списъка когато е възможно
3. Осигури разнообразие
4. Отговори само с валиден JSON
`;
};

const transformAIPlan = (
  aiPlan: any,
  userId: string,
  weekKey: string
) => {
  const weeklyPlan: IWeeklyPlan = {} as IWeeklyPlan;
  const totalDailyCalories: IDailyCalories = {} as IDailyCalories;

  for (const day of DAYS) {
    const dayPlan = aiPlan.weeklyPlan?.[day];
    
    weeklyPlan[day] = {
      breakfast: transformMeal(dayPlan?.breakfast),
      lunch: transformMeal(dayPlan?.lunch),
      dinner: transformMeal(dayPlan?.dinner),
      snacks: dayPlan?.snacks?.map(transformMeal) || [],
    };

    totalDailyCalories[day] = aiPlan.totalDailyCalories?.[day] || 
      weeklyPlan[day].breakfast.calories +
      weeklyPlan[day].lunch.calories +
      weeklyPlan[day].dinner.calories;
  }

  return {
    userId: new Types.ObjectId(userId),
    weekKey,
    weeklyPlan,
    totalDailyCalories,
    nutritionSummary: aiPlan.nutritionSummary || {
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      avgCalories: 0,
    },
    notes: aiPlan.notes || '',
    isActive: true,
    regenerateHistory: [],
  };
};

const transformMeal = (meal: Record<string, unknown> | undefined) => {
  return {
    recipeId: meal?.recipeId ? new Types.ObjectId(meal.recipeId as string) : null,
    title: (meal?.title as string) || 'Ястие',
    servings: (meal?.servings as number) || 1,
    calories: (meal?.calories as number) || 0,
    protein: (meal?.protein as number) || 0,
    carbs: (meal?.carbs as number) || 0,
    fat: (meal?.fat as number) || 0,
    prepTime: (meal?.prepTime as number) || 0,
    suggested: (meal?.suggested as boolean) || false,
    reason: (meal?.reason as string) || '',
  };
};

const getAlternatives = async (
  profile: IHealthProfile,
  mealType: string,
  excludeId?: string
) => {
  const query: Record<string, unknown> = { isPublished: true };

  if (excludeId) {
    query._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const recipes = await Recipe.find(query)
    .limit(5)
    .lean();

  return recipes;
};

export default {
  generateMealPlan,
  getCurrentMealPlan,
  getMealPlanHistory,
  replaceMeal,
};
