import { Router } from 'express';
import * as mealdbController from '../controllers/mealdb.controller.js';

const router = Router();

router.get('/search', mealdbController.searchByName);

router.get('/lookup/:id', mealdbController.getById);

router.get('/random', mealdbController.getRandom);

router.get('/filter/area/:area', mealdbController.filterByArea);

router.get('/filter/category/:category', mealdbController.filterByCategory);

router.get('/categories', mealdbController.getCategories);

router.get('/areas', mealdbController.getAreas);

export default router;
