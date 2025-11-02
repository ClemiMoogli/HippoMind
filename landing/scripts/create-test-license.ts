/**
 * Script to create a test license
 * Run with: MONGODB_URI="..." npx tsx scripts/create-test-license.ts your@email.com
 */

import dotenv from 'dotenv';
import { getDatabase } from '../lib/mongodb';
import { generateLicenseKey } from '../lib/license';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createTestLicense(email: string) {
  console.log('🔑 Creating test license...\n');

  try {
    const db = await getDatabase();
    const licensesCollection = db.collection('licenses');

    // Generate a license key
    const licenseKey = generateLicenseKey();

    // Create license object
    const license = {
      key: licenseKey,
      email: email,
      stripeSessionId: `test_${Date.now()}`,
      stripeCustomerId: undefined,
      productName: 'HippoMind',
      price: 0,
      currency: 'usd',
      createdAt: new Date().toISOString(),
      active: true,
      activations: 0,
      maxActivations: 3,
    };

    // Insert into database
    await licensesCollection.insertOne(license);

    console.log('✅ License created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 License Key:', licenseKey);
    console.log('🎯 Max Activations: 3');
    console.log('\nYou can now use this license key in the app!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating license:', error);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx scripts/create-test-license.ts your@email.com');
  process.exit(1);
}

createTestLicense(email);
