import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { createCheckoutSession } from '../services/stripe.service.js';

export function createCheckoutRoutes() {
  const router = Router();

  // POST / - Create checkout session
  router.post(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { planId, productId, type } = req.body;
      const userId = req.user!.userId;

      // Determine the ID and type to use
      const id = planId || productId;

      if (!id || typeof id !== 'string' || id.length > 100) {
        throw new AppError('Invalid plan ID', 400);
      }
      if (type && !['one-time', 'subscription'].includes(type)) {
        throw new AppError('Invalid checkout type', 400);
      }

      const sessionType = type === 'one-time' ? 'credits' : 'subscription';

      // Create checkout session
      const session = await createCheckoutSession(userId, id, sessionType);

      // In mock mode, return success immediately
      res.json({
        sessionId: session.id,
        checkoutUrl: session.url || '/dashboard', // Redirect to dashboard in mock mode
        message: 'Mock checkout completed successfully',
      });
    })
  );

  return router;
}
