import { Router } from 'express';
import * as favoriteController from '../controllers/favorite.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();


router.use(protect);

router.get('/', favoriteController.getFavorites);
router.post('/:recipeId', favoriteController.addFavorite);
router.delete('/:recipeId', favoriteController.removeFavorite);
router.get('/check/:recipeId', favoriteController.checkFavorite);
router.post('/toggle/:recipeId', favoriteController.toggleFavorite);

export default router;
