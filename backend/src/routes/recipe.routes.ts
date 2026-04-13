import { Router } from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { recipeLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// Protected route MUST come before /:id
router.get('/my-recipes', protect, recipeController.getMyRecipes);

// AI features - MUST come before /:id
router.post('/translate', recipeController.translateRecipe);
router.post('/suggest', protect, recipeController.suggestRecipes);

// Public routes with optional auth (to check favorites)
router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/user/:userId', optionalAuth, recipeController.getUserRecipes);
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// AI features for specific recipe
router.post('/:id/tips', recipeController.getCookingTips);

// Protected routes
router.post('/', protect, recipeLimiter, recipeController.createRecipe);
router.put('/:id', protect, recipeController.updateRecipe);
router.delete('/:id', protect, recipeController.deleteRecipe);

export default router;
