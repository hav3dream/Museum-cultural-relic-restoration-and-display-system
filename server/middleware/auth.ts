import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAME } from '../../shared/const.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; email: string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies[COOKIE_NAME];

    if (token) {
      const payload = verifyToken(token);
      req.user = { userId: payload.userId, email: payload.email };
    }

    next();
  } catch (error) {
    // Silently continue if token is invalid
    next();
  }
}
