import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Test if Stripe keys are loaded
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const hasPriceId = !!process.env.STRIPE_PRICE_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Try to retrieve a test session
    return NextResponse.json({
      success: true,
      config: {
        hasSecretKey,
        hasPriceId,
        siteUrl,
        secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
