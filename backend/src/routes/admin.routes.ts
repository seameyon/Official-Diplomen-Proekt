import { Router, Request, Response } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import User from '../models/User.model.js';
import Recipe from '../models/Recipe.model.js';

const router = Router();

const ADMIN_EMAIL = 'xzvelkosimeon@gmail.com';

// Admin middleware - allows main admin or users with isAdmin flag
const requireAdmin = async (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  
  const isMainAdmin = req.user.email === ADMIN_EMAIL;
  const hasAdminFlag = req.user.isAdmin === true;
  
  if (!isMainAdmin && !hasAdminFlag) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// Middleware for main admin only (for dangerous operations)
const requireMainAdmin = async (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, message: 'Only main admin can perform this action' });
  }
  next();
};

// Get all users - any admin can view
router.get('/users', protect, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Get stats - any admin can view
router.get('/stats', protect, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const userCount = await User.countDocuments();
    const recipeCount = await Recipe.countDocuments();
    
    res.json({
      success: true,
      data: {
        users: userCount,
        recipes: recipeCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// Delete user - only main admin
router.delete('/users/:id', protect, requireMainAdmin, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Toggle admin status - only main admin
router.put('/users/:id/admin', protect, requireMainAdmin, async (req: Request, res: Response) => {
  try {
    const { isAdmin } = req.body;
    const userId = req.params.id;

    // Prevent removing admin from main admin
    const targetUser = await User.findById(userId);
    if (targetUser?.email === ADMIN_EMAIL && !isAdmin) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot remove admin from main admin' 
      });
    }

    await User.findByIdAndUpdate(userId, { isAdmin });
    
    res.json({ 
      success: true, 
      message: isAdmin ? 'User is now admin' : 'Admin rights removed' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating admin status' });
  }
});

export default router;
