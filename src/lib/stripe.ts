import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_to_bypass_build_error', {
  apiVersion: '2025-02-24.acacia' as any,
  typescript: true,
})
