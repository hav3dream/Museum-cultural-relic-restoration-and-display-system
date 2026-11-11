/**
 * Stripe Products and Pricing Configuration
 * Define all products and subscription plans here
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number; // Price in cents (e.g., 999 = $9.99)
  stripePriceId: string;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPriceInCents: number; // Monthly price in cents
  stripePriceId: string;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
}

// Subscription Plans
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: '入门版',
    description: '适合个人用户和小型项目',
    monthlyPriceInCents: 2999, // $29.99/month
    stripePriceId: 'price_starter_monthly', // Will be updated with actual Stripe price ID
    features: [
      '每月 10 次古画修复',
      '每月 10 次壁画修复',
      '每月 5 次书法生成',
      '基础支持',
      '标准分辨率输出'
    ],
    billingCycle: 'monthly'
  },
  {
    id: 'professional',
    name: '专业版',
    description: '适合专业用户和机构',
    monthlyPriceInCents: 7999, // $79.99/month
    stripePriceId: 'price_professional_monthly', // Will be updated with actual Stripe price ID
    features: [
      '每月 100 次古画修复',
      '每月 100 次壁画修复',
      '每月 50 次书法生成',
      '优先支持',
      '高分辨率输出',
      '批量处理能力',
      '高级参数调节'
    ],
    billingCycle: 'monthly'
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '适合大型机构和商业应用',
    monthlyPriceInCents: 19999, // $199.99/month
    stripePriceId: 'price_enterprise_monthly', // Will be updated with actual Stripe price ID
    features: [
      '无限制古画修复',
      '无限制壁画修复',
      '无限制书法生成',
      '24/7 专业支持',
      '超高分辨率输出',
      '批量处理能力',
      '高级参数调节',
      'API 接口访问',
      '自定义工作流',
      '专属账户经理'
    ],
    billingCycle: 'monthly'
  }
];

// One-time Purchase Products
export const oneTimeProducts: Product[] = [
  {
    id: 'credits_100',
    name: '100 次使用额度',
    description: '购买 100 次修复/生成额度，永久有效',
    priceInCents: 4999, // $49.99
    stripePriceId: 'price_credits_100', // Will be updated with actual Stripe price ID
    features: [
      '100 次修复/生成额度',
      '永久有效',
      '可用于任何功能'
    ]
  },
  {
    id: 'credits_500',
    name: '500 次使用额度',
    description: '购买 500 次修复/生成额度，永久有效',
    priceInCents: 19999, // $199.99
    stripePriceId: 'price_credits_500', // Will be updated with actual Stripe price ID
    features: [
      '500 次修复/生成额度',
      '永久有效',
      '可用于任何功能',
      '节省 20%'
    ]
  },
  {
    id: 'credits_1000',
    name: '1000 次使用额度',
    description: '购买 1000 次修复/生成额度，永久有效',
    priceInCents: 34999, // $349.99
    stripePriceId: 'price_credits_1000', // Will be updated with actual Stripe price ID
    features: [
      '1000 次修复/生成额度',
      '永久有效',
      '可用于任何功能',
      '节省 30%'
    ]
  }
];

/**
 * Get subscription plan by ID
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find(plan => plan.id === planId);
}

/**
 * Get one-time product by ID
 */
export function getOneTimeProduct(productId: string): Product | undefined {
  return oneTimeProducts.find(product => product.id === productId);
}

/**
 * Format price for display (e.g., 2999 -> $29.99)
 */
export function formatPrice(priceInCents: number): string {
  return `¥${(priceInCents / 100).toFixed(2)}`;
}
