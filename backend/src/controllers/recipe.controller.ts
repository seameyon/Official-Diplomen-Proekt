import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import * as recipeService from '../services/recipe.service.js';
import * as groqService from '../services/groq.service.js';
import * as translateService from '../services/translate.service.js';
import { RecipeTag } from '../types/recipe.types.js';

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Private
 */
export const createRecipe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  
  console.log('[Recipe] Creating recipe:', JSON.stringify(req.body, null, 2));
  
  // Validate required fields
  const { title, description, ingredients, steps, prepTime, cookTime, servings, mainImage, nutrition } = req.body;
  
  if (!title || title.length < 3) {
    console.log('[Recipe] Title validation failed:', title);
    return res.status(400).json({ success: false, message: 'Title must be at least 3 characters' });
  }
  
  if (!description || description.length < 10) {
    console.log('[Recipe] Description validation failed:', description);
    return res.status(400).json({ success: false, message: 'Description must be at least 10 characters' });
  }
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    console.log('[Recipe] Ingredients validation failed:', ingredients);
    return res.status(400).json({ success: false, message: 'At least one ingredient is required' });
  }
  
  // Validate each ingredient has required fields
  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    if (!ing.name || ing.amount === undefined || ing.amount === null || !ing.unit) {
      console.log('[Recipe] Ingredient validation failed at index', i, ':', ing);
      return res.status(400).json({ 
        success: false, 
        message: `Ingredient ${i + 1} is missing required fields (name, amount, unit)` 
      });
    }
  }
  
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    console.log('[Recipe] Steps validation failed:', steps);
    return res.status(400).json({ success: false, message: 'At least one step is required' });
  }
  
  if (!mainImage) {
    console.log('[Recipe] mainImage validation failed');
    return res.status(400).json({ success: false, message: 'Main image is required' });
  }
  
  if (!nutrition || !nutrition.calories) {
    console.log('[Recipe] Nutrition validation failed:', nutrition);
    return res.status(400).json({ success: false, message: 'Nutrition with calories is required' });
  }
  
  try {
    // If nutrition is not complete, estimate it using AI
    if (!req.body.nutrition?.calories && req.body.ingredients) {
      const estimatedNutrition = await groqService.estimateNutrition(
        req.body.ingredients,
        req.body.servings || 1
      );
      req.body.nutrition = {
        ...estimatedNutrition,
        ...req.body.nutrition,
      };
    }

    const recipe = await recipeService.createRecipe(userId, req.body);
    console.log('[Recipe] Created successfully:', recipe._id);

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: { recipe },
    });
  } catch (error: any) {
    console.error('[Recipe] Creation error:', error.message);
    console.error('[Recipe] Full error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create recipe',
    });
  }
});

/**
 * @route   GET /api/recipes
 * @desc    Get recipes with filters and pagination
 * @access  Public
 */
export const getRecipes = asyncHandler(async (req: Request, res: Response) => {
  const {
    search,
    tags,
    region,
    maxCalories,
    minCalories,
    maxTime,
    authorId,
    page = '1',
    limit = '12',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filters = {
    search: search as string,
    tags: tags ? (Array.isArray(tags) ? tags : [tags]) as RecipeTag[] : undefined,
    region: region as string,
    maxCalories: maxCalories ? parseInt(maxCalories as string) : undefined,
    minCalories: minCalories ? parseInt(minCalories as string) : undefined,
    maxTime: maxTime ? parseInt(maxTime as string) : undefined,
    authorId: authorId as string,
  };

  const pagination = {
    page: parseInt(page as string),
    limit: Math.min(parseInt(limit as string), 50),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  const result = await recipeService.getRecipes(
    filters,
    pagination,
    req.userId
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @route   GET /api/recipes/:id
 * @desc    Get recipe by ID
 * @access  Public
 */
export const getRecipeById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const recipe = await recipeService.getRecipeById(id, req.userId);

  res.json({
    success: true,
    data: { recipe },
  });
});

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe
 * @access  Private (owner only)
 */
export const updateRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;

  const recipe = await recipeService.updateRecipe(id, userId, req.body);

  res.json({
    success: true,
    message: 'Recipe updated successfully',
    data: { recipe },
  });
});

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe
 * @access  Private (owner or admin)
 */
export const deleteRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId!;
  const isAdmin = req.user?.isAdmin || false;

  await recipeService.deleteRecipe(id, userId, isAdmin);

  res.json({
    success: true,
    message: 'Recipe deleted successfully',
  });
});

/**
 * @route   GET /api/recipes/user/:userId
 * @desc    Get recipes by user
 * @access  Public
 */
export const getUserRecipes = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = '1', limit = '12' } = req.query;

  const result = await recipeService.getUserRecipes(
    userId,
    {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 50),
    }
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @route   GET /api/recipes/my-recipes
 * @desc    Get current user's recipes
 * @access  Private
 */
export const getMyRecipes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { page = '1', limit = '12' } = req.query;

  const result = await recipeService.getUserRecipes(
    userId,
    {
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 50),
    }
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @route   POST /api/recipes/:id/tips
 * @desc    Get AI-generated cooking tips for a recipe
 * @access  Public
 */
export const getCookingTips = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const recipe = await recipeService.getRecipeById(id);
  const tips = await groqService.generateCookingTips(recipe);

  res.json({
    success: true,
    data: { tips },
  });
});

/**
 * @route   POST /api/recipes/suggest
 * @desc    Get recipe suggestions based on ingredients
 * @access  Private
 */
export const suggestRecipes = asyncHandler(async (req: Request, res: Response) => {
  const { ingredients, dietary, maxTime, cuisine } = req.body;

  const suggestions = await groqService.suggestRecipes(
    ingredients,
    { dietary, maxTime, cuisine }
  );

  res.json({
    success: true,
    data: { suggestions },
  });
});

/**
 * @route   POST /api/recipes/translate
 * @desc    Translate recipe content to Bulgarian
 * @access  Public
 */
export const translateRecipe = asyncHandler(async (req: Request, res: Response) => {
  const { title, steps, ingredients } = req.body;

  if (!title || !steps || !Array.isArray(steps)) {
    return res.status(400).json({
      success: false,
      message: 'Title and steps array are required',
    });
  }

  // Use Google Translate (FREE, no API key needed)
  const translation = await translateService.translateRecipeToBulgarian(
    title,
    steps,
    ingredients || []
  );

  res.json({
    success: true,
    data: translation,
  });
});

export default {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes,
  getMyRecipes,
  getCookingTips,
  suggestRecipes,
  translateRecipe,
};
