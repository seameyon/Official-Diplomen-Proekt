import { Recipe } from '../models/Recipe.model.js';
import { Favorite } from '../models/Favorite.model.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { IRecipe, IRecipeInput, IRecipeWithAuthor, RecipeTag } from '../types/recipe.types.js';
import { Types } from 'mongoose';

interface RecipeFilters {
  search?: string;
  tags?: RecipeTag[];
  region?: string;
  maxCalories?: number;
  minCalories?: number;
  maxTime?: number;
  authorId?: string;
  dietary?: string[];
}

interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create a new recipe
 */
export const createRecipe = async (
  authorId: string,
  input: IRecipeInput
): Promise<IRecipe> => {
  const recipe = await Recipe.create({
    ...input,
    authorId: new Types.ObjectId(authorId),
  });

  return recipe;
};


export const getRecipeById = async (
  recipeId: string,
  userId?: string
): Promise<IRecipeWithAuthor & { isFavorited?: boolean }> => {
  const recipe = await Recipe.findById(recipeId)
    .populate('authorId', 'username avatar')
    .lean();

  if (!recipe) {
    throw new ApiError('Recipe not found', 404);
  }

 
  let isFavorited = false;
  if (userId) {
    const favorite = await Favorite.findOne({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId),
    });
    isFavorited = !!favorite;
  }

  return {
    ...recipe,
    author: recipe.authorId as unknown as { _id: string; username: string; avatar?: string },
    isFavorited,
  } as IRecipeWithAuthor & { isFavorited?: boolean };
};


export const updateRecipe = async (
  recipeId: string,
  authorId: string,
  input: Partial<IRecipeInput>
): Promise<IRecipe> => {
  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw new ApiError('Recipe not found', 404);
  }

  if (recipe.authorId.toString() !== authorId) {
    throw new ApiError('Not authorized to update this recipe', 403);
  }

  Object.assign(recipe, input);
  await recipe.save();

  return recipe;
};


export const deleteRecipe = async (
  recipeId: string,
  authorId: string,
  isAdmin: boolean = false
): Promise<void> => {
  const recipe = await Recipe.findById(recipeId);

  if (!recipe) {
    throw new ApiError('Recipe not found', 404);
  }

  if (recipe.authorId.toString() !== authorId && !isAdmin) {
    throw new ApiError('Not authorized to delete this recipe', 403);
  }

  await Favorite.deleteMany({ recipeId: new Types.ObjectId(recipeId) });

  await Recipe.deleteOne({ _id: recipeId });
};


export const getRecipes = async (
  filters: RecipeFilters,
  pagination: PaginationOptions,
  userId?: string
): Promise<{
  recipes: (IRecipeWithAuthor & { isFavorited?: boolean })[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
  const skip = (page - 1) * limit;

  
  const query: Record<string, unknown> = {};

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $all: filters.tags };
  }

  if (filters.region) {
    query.region = filters.region;
  }

  if (filters.maxCalories) {
    query['nutrition.calories'] = { ...query['nutrition.calories'] as object, $lte: filters.maxCalories };
  }

  if (filters.minCalories) {
    query['nutrition.calories'] = { ...query['nutrition.calories'] as object, $gte: filters.minCalories };
  }

  if (filters.maxTime) {
    query.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, filters.maxTime] };
  }

  if (filters.authorId) {
    query.authorId = new Types.ObjectId(filters.authorId);
  }

  if (filters.dietary && filters.dietary.length > 0) {
    query.tags = { $all: filters.dietary };
  }

  
  const total = await Recipe.countDocuments(query);

 
  const recipes = await Recipe.find(query)
    .populate('authorId', 'username avatar')
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit)
    .lean();


  let userFavorites: Set<string> = new Set();
  if (userId) {
    const favorites = await Favorite.find({ userId: new Types.ObjectId(userId) });
    userFavorites = new Set(favorites.map(f => f.recipeId.toString()));
  }

  const recipesWithFavorites = recipes.map(recipe => ({
    ...recipe,
    author: recipe.authorId as unknown as { _id: string; username: string; avatar?: string },
    isFavorited: userFavorites.has(recipe._id.toString()),
  })) as (IRecipeWithAuthor & { isFavorited?: boolean })[];

  return {
    recipes: recipesWithFavorites,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};


export const getMatchingRecipes = async (
  dietary: string[],
  allergies: string[],
  maxPrepTime?: number,
  tags?: string[]
): Promise<IRecipe[]> => {
  const query: Record<string, unknown> = {};


  if (dietary.length > 0) {
    query.tags = { $in: dietary };
  }

  
  if (allergies.length > 0) {
    query['ingredients.name'] = { 
      $not: { 
        $regex: allergies.join('|'), 
        $options: 'i' 
      } 
    };
  }

  
  if (maxPrepTime) {
    query.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, maxPrepTime] };
  }

 
  if (tags && tags.length > 0) {
    query.tags = { ...(query.tags || {}), $all: tags };
  }

  const recipes = await Recipe.find(query)
    .limit(100)
    .lean();

  return recipes as IRecipe[];
};


export const getUserRecipes = async (
  userId: string,
  pagination: PaginationOptions
): Promise<{
  recipes: IRecipe[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const total = await Recipe.countDocuments({ authorId: new Types.ObjectId(userId) });

  const recipes = await Recipe.find({ authorId: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    recipes: recipes as IRecipe[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export default {
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getRecipes,
  getMatchingRecipes,
  getUserRecipes,
};
