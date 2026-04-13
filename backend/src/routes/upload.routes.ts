import { Router } from 'express';
import { upload, uploadImage, deleteImage } from '../controllers/upload.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Upload image (requires auth)
router.post('/image', requireAuth, upload.single('image'), uploadImage);

// Delete image (requires auth)
router.delete('/image/:filename', requireAuth, deleteImage);

export default router;
