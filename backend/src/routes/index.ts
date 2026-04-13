import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import recipeRoutes from './recipe.routes.js';
import favoriteRoutes from './favorite.routes.js';
import mealPlanRoutes from './mealPlan.routes.js';
import adminRoutes from './admin.routes.js';
import mealdbRoutes from './mealdb.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recipes', recipeRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/meal-plans', mealPlanRoutes);
router.use('/admin', adminRoutes);
router.use('/mealdb', mealdbRoutes);
router.use('/upload', uploadRoutes);

export default router;
