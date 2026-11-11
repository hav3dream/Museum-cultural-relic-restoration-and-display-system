import { db } from '../db/connection.js';
import { subscriptions, credits } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Mock mode - simulate Stripe behavior without actual API calls
// This allows the app to work without real Stripe keys in sandbox/development

export async function createCheckoutSession(
  userId: number,
  planId: string,
  type: 'subscription' | 'credits'
) {
  // In mock mode, directly activate the subscription/credits
  if (type === 'subscription') {
    // Check for existing subscription
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.user_id, userId));

    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (existing.length > 0) {
      await db
        .update(subscriptions)
        .set({
          plan_id: planId,
          status: 'active',
          current_period_start: now,
          current_period_end: oneMonthLater,
          updated_at: now,
        })
        .where(eq(subscriptions.user_id, userId));
    } else {
      await db.insert(subscriptions).values({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        stripe_subscription_id: 'mock_sub_' + Date.now(),
        current_period_start: now,
        current_period_end: oneMonthLater,
      });
    }
  } else {
    // Add credits based on package
    const creditAmounts: Record<string, number> = {
      credits_100: 100,
      credits_500: 500,
      credits_1000: 1000,
    };
    const amount = creditAmounts[planId] || 100;
    await db.insert(credits).values({
      user_id: userId,
      amount,
    });
  }

  // Return mock session
  return {
    id: 'mock_session_' + Date.now(),
    url: null, // In mock mode, we don't need a checkout URL
  };
}

export async function getSubscription(userId: number) {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.user_id, userId));
  return result[0] || null;
}

export async function cancelSubscription(userId: number) {
  const result = await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updated_at: new Date(),
    })
    .where(eq(subscriptions.user_id, userId));
  return result;
}

export async function handleWebhookEvent(payload: any, signature: string) {
  // In mock mode, this is a no-op
  // In production, this would verify the signature and process the event
  return { received: true };
}
