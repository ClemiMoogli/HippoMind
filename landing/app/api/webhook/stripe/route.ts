/**
 * Stripe Webhook Handler
 * Receives payment notifications and generates license keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createLicense } from '@/lib/license';
import { storeLicense } from '@/lib/db';
import Stripe from 'stripe';

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log('Payment successful:', session.id);

    // Generate license key
    const license = createLicense(
      session.customer_email || session.customer_details?.email || 'unknown@email.com',
      session.id,
      session.customer as string | undefined,
      session.amount_total || 0,
      session.currency || 'usd'
    );

    // Store license in database
    await storeLicense(license);

    console.log('License generated:', license.key);

    // TODO: Send email with license key
    // You can use Resend, SendGrid, or Stripe's email feature
    console.log('Email should be sent to:', license.email);
    console.log('License key:', license.key);

    // For now, the user will see the key on the success page
  }

  return NextResponse.json({ received: true });
}
