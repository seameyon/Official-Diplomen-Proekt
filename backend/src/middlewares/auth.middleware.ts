import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.model.js';


export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
      return;
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized - invalid token',
    });
  }
};


export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'Please verify your email first',
    });
    return;
  }
  next();
};


export const requireOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.hasCompletedOnboarding) {
    res.status(403).json({
      success: false,
      message: 'Please complete your health profile first',
      requiresOnboarding: true,
    });
    return;
  }
  next();
};


export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }

    next();
  } catch {
    // Token invalid, continue without user
    next();
  }
};


export const requireAuth = protect;

export default { protect, requireAuth, requireVerified, requireOnboarding, optionalAuth };
