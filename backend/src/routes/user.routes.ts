import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/profile/:username', userController.getPublicProfile);

router.use(protect);

router.get('/health-profile', userController.getHealthProfile);
router.put('/health-profile', userController.updateHealthProfile);

router.put('/settings', userController.updateSettings);
router.put('/avatar', userController.updateAvatar);
router.put('/change-password', userController.changePassword);

router.delete('/account', userController.deleteAccount);

export default router;
