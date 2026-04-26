import { Router } from 'express';
import { upload, uploadImage, deleteImage } from '../controllers/upload.controller.js';
import { optionalAuth, requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/image', requireAuth, upload.single('image'), uploadImage);

router.delete('/image/:filename', requireAuth, deleteImage);

export default router;
