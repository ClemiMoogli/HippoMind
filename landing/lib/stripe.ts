/**
 * Stripe configuration and utilities
 */

import Stripe from 'stripe';

// Allow building without Stripe keys (they'll be checked at runtime)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
