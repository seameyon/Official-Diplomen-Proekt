import { Router } from 'express';
import * as recipeController from '../controllers/recipe.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { recipeLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.get('/my-recipes', protect, recipeController.getMyRecipes);

router.post('/translate', recipeController.translateRecipe);
router.post('/suggest', protect, recipeController.suggestRecipes);

router.get('/', optionalAuth, recipeController.getRecipes);
router.get('/user/:userId', optionalAuth, recipeController.getUserRecipes);
router.get('/:id', optionalAuth, recipeController.getRecipeById);

router.post('/:id/tips', recipeController.getCookingTips);


router.post('/', protect, recipeLimiter, recipeController.createRecipe);
router.put('/:id', protect, recipeController.updateRecipe);
router.delete('/:id', protect, recipeController.deleteRecipe);

export default router;
