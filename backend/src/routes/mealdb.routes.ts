import { Router } from 'express';
import * as mealdbController from '../controllers/mealdb.controller.js';

const router = Router();

// Search recipes by name
router.get('/search', mealdbController.searchByName);

// Get recipe by ID
router.get('/lookup/:id', mealdbController.getById);

// Get random recipe
router.get('/random', mealdbController.getRandom);

// Filter by area/region
router.get('/filter/area/:area', mealdbController.filterByArea);

// Filter by category
router.get('/filter/category/:category', mealdbController.filterByCategory);

// Get all categories
router.get('/categories', mealdbController.getCategories);

// Get all areas
router.get('/areas', mealdbController.getAreas);

export default router;
