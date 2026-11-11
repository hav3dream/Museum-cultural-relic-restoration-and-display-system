import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSubscription, cancelSubscription } from '../services/stripe.service.js';

export function createSubscriptionRoutes() {
  const router = Router();

  // GET / - Get current user's subscription
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.userId;
      const subscription = await getSubscription(userId);

      if (!subscription) {
        return res.json({ subscription: null });
      }

      res.json({ subscription });
    })
  );

  // POST /cancel - Cancel subscription
  router.post(
    '/cancel',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.userId;
      await cancelSubscription(userId);

      res.json({ success: true, message: 'Subscription canceled successfully' });
    })
  );

  return router;
}
