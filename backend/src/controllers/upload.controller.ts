import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/error.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter - only allow images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image file
 * @access  Private
 */
export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // Get the server URL
  const protocol = req.protocol;
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  console.log('[Upload] Image uploaded:', imageUrl);

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      filename: req.file.filename,
      url: imageUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * @route   DELETE /api/upload/image/:filename
 * @desc    Delete an uploaded image
 * @access  Private
 */
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params;
  const filepath = path.join(uploadsDir, filename);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Image not found',
    });
  }
});

export default {
  upload,
  uploadImage,
  deleteImage,
};
