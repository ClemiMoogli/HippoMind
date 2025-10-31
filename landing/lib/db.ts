/**
 * MongoDB database operations for licenses
 */

import { getDatabase } from './mongodb';
import type { License } from './license';
import { Collection } from 'mongodb';

/**
 * Get the licenses collection
 */
async function getLicensesCollection(): Promise<Collection<License>> {
  const db = await getDatabase();
  return db.collection<License>('licenses');
}

/**
 * Store a new license
 */
export async function storeLicense(license: License): Promise<void> {
  const collection = await getLicensesCollection();

  // Upsert pour éviter les doublons (au cas où le webhook se déclenche 2x)
  await collection.updateOne(
    { key: license.key },
    { $set: license },
    { upsert: true }
  );

  console.log('License stored in MongoDB:', license.key);
}

/**
 * Get license by key
 */
export async function getLicense(key: string): Promise<License | null> {
  const collection = await getLicensesCollection();
  return await collection.findOne({ key });
}

/**
 * Get license by Stripe session ID
 */
export async function getLicenseBySession(sessionId: string): Promise<License | null> {
  const collection = await getLicensesCollection();
  return await collection.findOne({ stripeSessionId: sessionId });
}

/**
 * Update license activation count
 */
export async function incrementActivation(key: string): Promise<boolean> {
  const collection = await getLicensesCollection();

  const license = await getLicense(key);

  if (!license || !license.active) {
    return false;
  }

  if (license.activations >= license.maxActivations) {
    return false; // Max activations reached
  }

  // Incrémenter atomiquement
  const result = await collection.updateOne(
    {
      key,
      active: true,
      activations: { $lt: license.maxActivations }
    },
    { $inc: { activations: 1 } }
  );

  return result.modifiedCount > 0;
}

/**
 * Deactivate a license
 */
export async function deactivateLicense(key: string): Promise<boolean> {
  const collection = await getLicensesCollection();

  const result = await collection.updateOne(
    { key },
    { $set: { active: false } }
  );

  return result.modifiedCount > 0;
}

/**
 * Get all license keys (for admin dashboard)
 */
export async function getAllLicenseKeys(): Promise<string[]> {
  const collection = await getLicensesCollection();

  const licenses = await collection
    .find({}, { projection: { key: 1, _id: 0 } })
    .toArray();

  return licenses.map(l => l.key);
}

/**
 * Get license statistics
 */
export async function getLicenseStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  totalActivations: number;
}> {
  const collection = await getLicensesCollection();

  const result = await collection.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: ['$active', 1, 0] }
        },
        inactive: {
          $sum: { $cond: ['$active', 0, 1] }
        },
        totalActivations: { $sum: '$activations' }
      }
    }
  ]).toArray();

  const stats = result[0] as { total: number; active: number; inactive: number; totalActivations: number } | undefined;

  return stats || {
    total: 0,
    active: 0,
    inactive: 0,
    totalActivations: 0
  };
}
