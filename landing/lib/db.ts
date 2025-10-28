/**
 * Simple in-memory database for licenses
 * In production, use Vercel KV, PostgreSQL, or another database
 */

import type { License } from './license';
import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'licenses.json');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // Directory already exists
  }
}

/**
 * Load all licenses from file
 */
async function loadLicenses(): Promise<Record<string, License>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet
    return {};
  }
}

/**
 * Save all licenses to file
 */
async function saveLicenses(licenses: Record<string, License>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(licenses, null, 2), 'utf-8');
}

/**
 * Store a new license
 */
export async function storeLicense(license: License): Promise<void> {
  // Skip file operations on Vercel (read-only filesystem)
  if (process.env.VERCEL) {
    console.log('Skipping license storage on Vercel (read-only filesystem)');
    console.log('License generated:', license.key, 'for', license.email);
    return;
  }

  const licenses = await loadLicenses();
  licenses[license.key] = license;
  await saveLicenses(licenses);
}

/**
 * Get license by key
 */
export async function getLicense(key: string): Promise<License | null> {
  const licenses = await loadLicenses();
  return licenses[key] || null;
}

/**
 * Get license by Stripe session ID
 */
export async function getLicenseBySession(sessionId: string): Promise<License | null> {
  const licenses = await loadLicenses();
  return Object.values(licenses).find(l => l.stripeSessionId === sessionId) || null;
}

/**
 * Update license activation count
 */
export async function incrementActivation(key: string): Promise<boolean> {
  const licenses = await loadLicenses();
  const license = licenses[key];

  if (!license || !license.active) {
    return false;
  }

  if (license.activations >= license.maxActivations) {
    return false; // Max activations reached
  }

  license.activations += 1;
  await saveLicenses(licenses);
  return true;
}

/**
 * Deactivate a license
 */
export async function deactivateLicense(key: string): Promise<boolean> {
  const licenses = await loadLicenses();
  const license = licenses[key];

  if (!license) {
    return false;
  }

  license.active = false;
  await saveLicenses(licenses);
  return true;
}
