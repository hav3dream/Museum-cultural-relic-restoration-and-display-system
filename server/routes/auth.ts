import { Router, Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { users, credits, subscriptions } from '../db/schema.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { COOKIE_NAME } from '../../shared/const.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// In-memory rate limiter for auth endpoints
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // 10 attempts per window

function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= RATE_LIMIT_MAX) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }
    entry.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }

  // Cleanup old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, val] of rateLimitStore) {
      if (now >= val.resetAt) rateLimitStore.delete(key);
    }
  }

  next();
}

export function createAuthRoutes(): Router {
  const router = Router();

  // POST /register
  router.post('/register', authRateLimiter, asyncHandler(async (req, res: Response) => {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      throw new AppError('Email, name, and password are required', 400);
    }

    // Input length limits
    if (typeof email !== 'string' || email.length > 255) {
      throw new AppError('邮箱地址过长', 400);
    }
    if (typeof name !== 'string' || name.length > 100) {
      throw new AppError('用户名过长（最长100字符）', 400);
    }
    if (typeof password !== 'string' || password.length > 128) {
      throw new AppError('密码过长（最长128字符）', 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('邮箱格式不正确', 400);
    }

    // Password strength: min 6 characters
    if (password.length < 6) {
      throw new AppError('密码至少需要6个字符', 400);
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      name,
      password_hash,
    }).returning();

    // Create initial credits (10 free credits)
    await db.insert(credits).values({
      user_id: newUser.id,
      amount: 10,
    });

    // Generate JWT
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    });

    // Return user data (without password_hash)
    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.created_at?.getTime() || Date.now(),
      },
      credits: 10,
    });
  }));

  // POST /login
  router.post('/login', authRateLimiter, asyncHandler(async (req, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Input length limits to prevent abuse
    if (typeof email !== 'string' || email.length > 255 || typeof password !== 'string' || password.length > 128) {
      throw new AppError('Invalid input', 400);
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Get user credits
    const [userCredits] = await db.select().from(credits).where(eq(credits.user_id, user.id));

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SEVEN_DAYS_MS,
    });

    // Return user data
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at?.getTime() || Date.now(),
      },
      credits: userCredits?.amount || 0,
    });
  }));

  // POST /logout
  router.post('/logout', asyncHandler(async (req, res: Response) => {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.json({ success: true });
  }));

  // GET /me
  router.get('/me', requireAuth, asyncHandler(async (req, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    // Get user data
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId));
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user credits
    const [userCredits] = await db.select().from(credits).where(eq(credits.user_id, user.id));

    // Get user subscription (optional)
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.user_id, user.id));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at?.getTime() || Date.now(),
      },
      credits: userCredits?.amount || 0,
      subscription: subscription || null,
    });
  }));

  return router;
}
