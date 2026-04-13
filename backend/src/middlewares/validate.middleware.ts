import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ==================== Auth Schemas ====================

export const registerSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(6, 'Паролата трябва да е поне 6 символа'),
  username: z.string().min(2, 'Потребителското име трябва да е поне 2 символа').max(30),
});

export const loginSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
  password: z.string().min(1, 'Паролата е задължителна'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Невалиден имейл адрес'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Паролата трябва да е поне 8 символа'),
});

// ==================== Health Profile Schema ====================

export const healthProfileSchema = z.object({
  height: z.number().min(50, 'Height must be at least 50cm').max(300, 'Height must be at most 300cm'),
  weight: z.number().min(20, 'Weight must be at least 20kg').max(500, 'Weight must be at most 500kg'),
  age: z.number().min(13, 'Must be at least 13 years old').max(120, 'Invalid age'),
  sex: z.enum(['male', 'female', 'other']).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'very_active']),
  goal: z.enum(['lose_weight', 'maintain', 'gain_muscle']),
  dietaryPreference: z.enum(['vegan', 'vegetarian', 'pescatarian', 'none']).default('none'),
  allergies: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
  mealsPerDay: z.number().min(2).max(5).default(3),
  cookingTime: z.enum(['quick', 'normal', 'meal_prep']).default('normal'),
  budget: z.enum(['low', 'medium', 'flexible']).default('medium'),
  equipment: z.array(z.string()).default([]),
  hasMedicalCondition: z.boolean().default(false),
});

// ==================== Recipe Schemas ====================

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
});

const nutritionSchema = z.object({
  calories: z.number().min(0, 'Calories must be positive'),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  sugar: z.number().min(0).optional(),
  sodium: z.number().min(0).optional(),
});

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  steps: z.array(z.string().min(5)).min(1, 'At least one step is required'),
  prepTime: z.number().min(0, 'Prep time must be positive'),
  cookTime: z.number().min(0, 'Cook time must be positive'),
  servings: z.number().min(1).max(100),
  tags: z.array(z.enum([
    'vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'nut-free',
    'high-protein', 'low-carb', 'low-fat', 'keto', 'paleo',
    'quick', 'meal-prep', 'budget-friendly',
    'breakfast', 'lunch', 'dinner', 'snack', 'dessert'
  ])).max(10).default([]),
  mainImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  nutrition: nutritionSchema,
});

// ==================== User Settings Schema ====================

export const userSettingsSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  language: z.enum(['en', 'bg']).optional(),
});

// ==================== Validation Middleware ====================

export const validate = <T extends z.ZodSchema>(schema: T) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.reduce((acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
          }, {} as Record<string, string>),
        });
        return;
      }
      next(error);
    }
  };
};

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  healthProfileSchema,
  recipeSchema,
  userSettingsSchema,
  validate,
};
