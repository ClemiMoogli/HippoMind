import { NextResponse } from 'next/server';

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: errorMessage,
    }, { status: 500 });
  }
}
