/**
 * License Verification API
 * Used by the desktop app to verify license keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLicense, incrementActivation } from '@/lib/db';
import { isValidLicenseFormat } from '@/lib/license';

export async function POST(req: NextRequest) {
  try {
    const { license_key, increment = false } = await req.json();

    // Validate format
    if (!license_key || !isValidLicenseFormat(license_key)) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid license key format',
      });
    }

    // Get license from database
    const license = await getLicense(license_key);

    if (!license) {
      return NextResponse.json({
        valid: false,
        error: 'License key not found',
      });
    }

    if (!license.active) {
      return NextResponse.json({
        valid: false,
        error: 'License has been deactivated',
      });
    }

    // Check activation limit
    if (license.activations >= license.maxActivations && increment) {
      return NextResponse.json({
        valid: false,
        error: `Maximum activations (${license.maxActivations}) reached. Contact support to reset.`,
      });
    }

    // Increment activation count if requested
    if (increment) {
      await incrementActivation(license_key);
    }

    // Return success
    return NextResponse.json({
      valid: true,
      email: license.email,
      activations: increment ? license.activations + 1 : license.activations,
      maxActivations: license.maxActivations,
    });
  } catch (error) {
    console.error('License verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
