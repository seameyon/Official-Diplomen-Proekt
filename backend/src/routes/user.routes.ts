import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/profile/:username', userController.getPublicProfile);

// Protected routes
router.use(protect);

// Health profile routes - NO validation, accept anything
router.get('/health-profile', userController.getHealthProfile);
router.put('/health-profile', userController.updateHealthProfile);

// Settings routes
router.put('/settings', userController.updateSettings);
router.put('/avatar', userController.updateAvatar);
router.put('/change-password', userController.changePassword);

// Account deletion
router.delete('/account', userController.deleteAccount);

export default router;
