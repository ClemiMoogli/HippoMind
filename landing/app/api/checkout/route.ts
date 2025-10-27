/**
 * Stripe Checkout API
 * Creates a checkout session and redirects user to Stripe payment page
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Try to parse JSON body, fallback to empty object if no body
    let priceId;
    try {
      const body = await req.json();
      priceId = body.priceId;
    } catch {
      priceId = undefined;
    }

    // Use provided priceId or default from env
    const finalPriceId = priceId || STRIPE_PRICE_ID;

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Missing Stripe Price ID configuration' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/en/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/en#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: undefined, // Let user enter email
      metadata: {
        product: 'hippomind-license',
      },
      payment_intent_data: {
        metadata: {
          product: 'hippomind-license',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
