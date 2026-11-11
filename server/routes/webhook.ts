import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { handleWebhookEvent } from '../services/stripe.service.js';

export function createWebhookRoutes() {
  const router = Router();

  // POST /stripe - Handle Stripe webhooks
  // Note: This route is mounted BEFORE express.json() middleware in server/index.ts
  // to allow raw body access for signature verification
  router.post(
    '/stripe',
    asyncHandler(async (req, res) => {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      // In mock mode, just acknowledge receipt
      await handleWebhookEvent(payload, signature);

      res.json({ received: true });
    })
  );

  return router;
}
