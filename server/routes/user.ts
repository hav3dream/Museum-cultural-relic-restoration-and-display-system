import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { db } from '../db/connection.js';
import { users, subscriptions, credits, restorations, gallery_items } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';

export function createUserRoutes() {
  const router = Router();

  // GET /dashboard - Get user dashboard data
  router.get(
    '/dashboard',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.userId;

      // Get user info
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          created_at: users.created_at,
        })
        .from(users)
        .where(eq(users.id, userId));

      const user = userResult[0];

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get credit balance (sum of all credits)
      const creditResult = await db
        .select({
          total: sql<number>`COALESCE(SUM(${credits.amount}), 0)`,
        })
        .from(credits)
        .where(eq(credits.user_id, userId));

      const creditBalance = creditResult[0]?.total || 0;

      // Get subscription status
      const subscriptionResult = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.user_id, userId));

      const subscription = subscriptionResult[0] || null;

      // Get recent restorations (last 5)
      const recentRestorations = await db
        .select()
        .from(restorations)
        .where(eq(restorations.user_id, userId))
        .orderBy(desc(restorations.created_at))
        .limit(5);

      // Get gallery items count
      const galleryCountResult = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(gallery_items)
        .where(eq(gallery_items.user_id, userId));

      const galleryItemsCount = galleryCountResult[0]?.count || 0;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        },
        creditBalance,
        subscription: subscription
          ? {
              id: subscription.id,
              plan_id: subscription.plan_id,
              status: subscription.status,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end,
            }
          : null,
        recentRestorations: recentRestorations.map((r) => {
          let resultUrls: string[] = [];
          let params: Record<string, unknown> | null = null;
          try { if (r.result_urls) resultUrls = JSON.parse(r.result_urls); } catch { /* corrupt data fallback */ }
          try { if (r.parameters) params = JSON.parse(r.parameters); } catch { /* corrupt data fallback */ }
          return {
            id: r.id, type: r.type, status: r.status,
            inputFileUrl: r.input_file_url, resultUrls, algorithm: r.algorithm,
            parameters: params, created_at: r.created_at, completed_at: r.completed_at,
          };
        }),
        galleryItemsCount,
      });
    })
  );

  return router;
}
