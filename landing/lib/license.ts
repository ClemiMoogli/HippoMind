/**
 * License generation and validation utilities
 */

import { nanoid } from 'nanoid';
import { createHash } from 'crypto';

export interface License {
  key: string;
  email: string;
  stripeSessionId: string;
  stripeCustomerId?: string;
  productName: string;
  price: number;
  currency: string;
  createdAt: string;
  active: boolean;
  activations: number;
  maxActivations: number;
}

/**
 * Generate a deterministic license key from a session ID
 * Format: HIPPO-XXXX-XXXX-XXXX
 */
export function generateLicenseKeyFromSession(sessionId: string): string {
  // Create a deterministic hash from the session ID
  const hash = createHash('sha256').update(sessionId).digest('hex');

  // Take 12 characters from the hash and format them
  const chars = hash.toUpperCase();
  const part1 = chars.substring(0, 4);
  const part2 = chars.substring(4, 8);
  const part3 = chars.substring(8, 12);

  return `HIPPO-${part1}-${part2}-${part3}`;
}

/**
 * Generate a random license key
 * Format: HIPPO-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(): string {
  const part1 = nanoid(4).toUpperCase();
  const part2 = nanoid(4).toUpperCase();
  const part3 = nanoid(4).toUpperCase();

  return `HIPPO-${part1}-${part2}-${part3}`;
}

/**
 * Create a new license
 */
export function createLicense(
  email: string,
  stripeSessionId: string,
  stripeCustomerId: string | undefined,
  price: number,
  currency: string
): License {
  return {
    key: generateLicenseKeyFromSession(stripeSessionId), // Deterministic key based on session
    email,
    stripeSessionId,
    stripeCustomerId,
    productName: 'HippoMind',
    price,
    currency,
    createdAt: new Date().toISOString(),
    active: true,
    activations: 0,
    maxActivations: 3, // Allow 3 device activations
  };
}

/**
 * Validate license key format
 */
export function isValidLicenseFormat(key: string): boolean {
  // Format: HIPPO-XXXX-XXXX-XXXX (16 chars total without dashes)
  const regex = /^HIPPO-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(key);
}
