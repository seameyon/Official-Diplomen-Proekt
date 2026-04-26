import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler, ApiError } from '../middlewares/error.middleware.js';
import { Favorite } from '../models/Favorite.model.js';
import { Recipe } from '../models/Recipe.model.js';


export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { recipeId } = req.params;

 
  if (!Types.ObjectId.isValid(recipeId)) {
    throw new ApiError('Invalid recipe ID', 400);
  }

  
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError('Recipe not found', 404);
  }

 
  const existingFavorite = await Favorite.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId),
  });

  if (existingFavorite) {
    throw new ApiError('Recipe already in favorites', 400);
  }

 
  await Favorite.create({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId),
  });

  res.status(201).json({
    success: true,
    message: 'Recipe added to favorites',
  });
});


export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { recipeId } = req.params;

  if (!Types.ObjectId.isValid(recipeId)) {
    throw new ApiError('Invalid recipe ID', 400);
  }

  const result = await Favorite.deleteOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId),
  });

  if (result.deletedCount === 0) {
    throw new ApiError('Favorite not found', 404);
  }

  res.json({
    success: true,
    message: 'Recipe removed from favorites',
  });
});


export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { page = '1', limit = '12' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = Math.min(parseInt(limit as string), 50);
  const skip = (pageNum - 1) * limitNum;

 
  const total = await Favorite.countDocuments({
    userId: new Types.ObjectId(userId),
  });


  const favorites = await Favorite.find({ userId: new Types.ObjectId(userId) })
    .populate({
      path: 'recipeId',
      populate: {
        path: 'authorId',
        select: 'username avatar',
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();


  const recipes = favorites
    .filter(f => f.recipeId) //Филтрират се изтрити рецепти
    .map(f => ({
      ...f.recipeId,
      favoritedAt: f.createdAt,
      isFavorited: true,
    }));

  res.json({
    success: true,
    data: {
      recipes,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});


export const checkFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { recipeId } = req.params;

  if (!Types.ObjectId.isValid(recipeId)) {
    res.json({ success: true, data: { isFavorited: false } });
    return;
  }

  const favorite = await Favorite.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId),
  });

  res.json({
    success: true,
    data: {
      isFavorited: !!favorite,
    },
  });
});


export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { recipeId } = req.params;

  if (!Types.ObjectId.isValid(recipeId)) {
    throw new ApiError('Invalid recipe ID. Make sure the recipe is saved first.', 400);
  }

 
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new ApiError('Recipe not found. Make sure the recipe is saved first.', 404);
  }

  
  const existingFavorite = await Favorite.findOne({
    userId: new Types.ObjectId(userId),
    recipeId: new Types.ObjectId(recipeId),
  });

  let isFavorited: boolean;

  if (existingFavorite) {
    await Favorite.deleteOne({ _id: existingFavorite._id });
    isFavorited = false;
  } else {
    await Favorite.create({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId),
    });
    isFavorited = true;
  }

  res.json({
    success: true,
    data: { isFavorited },
    message: isFavorited ? 'Added to favorites' : 'Removed from favorites',
  });
});

export default {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
  toggleFavorite,
};
