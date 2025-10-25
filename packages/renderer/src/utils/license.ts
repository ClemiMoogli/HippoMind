/**
 * License validation utilities
 */

import type { License, GumroadVerifyResponse } from '@shared';

// Gumroad product permalink (the slug in your product URL)
// URL: https://cjlabs.gumroad.com/l/uvsste
// Permalink: uvsste
const GUMROAD_PRODUCT_ID = 'uvsste';

/**
 * Verify a license key with Gumroad API
 */
export async function verifyLicenseKey(licenseKey: string): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: false, // Don't increment on validation (only on activation)
      }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: 'Network error. Please check your internet connection.',
      };
    }

    const data: GumroadVerifyResponse = await response.json();

    if (data.success) {
      return {
        valid: true,
        email: data.purchase.email,
      };
    } else {
      return {
        valid: false,
        error: 'Invalid license key. Please check and try again.',
      };
    }
  } catch (error) {
    console.error('License verification error:', error);
    return {
      valid: false,
      error: 'Failed to verify license. Please check your internet connection.',
    };
  }
}

/**
 * Activate a license (increments use count)
 */
export async function activateLicenseKey(licenseKey: string): Promise<{
  valid: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: true, // Increment use count on activation
      }),
    });

    if (!response.ok) {
      return {
        valid: false,
        error: 'Network error. Please check your internet connection.',
      };
    }

    const data: GumroadVerifyResponse = await response.json();

    if (data.success) {
      return {
        valid: true,
        email: data.purchase.email,
      };
    } else {
      return {
        valid: false,
        error: 'Invalid license key. Please check and try again.',
      };
    }
  } catch (error) {
    console.error('License activation error:', error);
    return {
      valid: false,
      error: 'Failed to activate license. Please check your internet connection.',
    };
  }
}

/**
 * Save license to local storage
 */
export function saveLicense(license: License): void {
  localStorage.setItem('hippomind_license', JSON.stringify(license));
}

/**
 * Get saved license from local storage
 */
export function getSavedLicense(): License | null {
  const saved = localStorage.getItem('hippomind_license');
  if (!saved) return null;

  try {
    const license = JSON.parse(saved);
    // Convert date string back to Date object
    if (license.activatedAt) {
      license.activatedAt = new Date(license.activatedAt);
    }
    return license as License;
  } catch (error) {
    console.error('Failed to parse saved license:', error);
    return null;
  }
}

/**
 * Clear saved license (for testing or logout)
 */
export function clearLicense(): void {
  localStorage.removeItem('hippomind_license');
}

/**
 * Check if app is licensed
 */
export function isLicensed(): boolean {
  const license = getSavedLicense();
  return license !== null && license.verified;
}
