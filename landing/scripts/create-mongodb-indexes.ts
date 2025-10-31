/**
 * Script pour créer les index MongoDB
 * Run with: npx tsx scripts/create-mongodb-indexes.ts
 */

import dotenv from 'dotenv';
import { getDatabase } from '../lib/mongodb';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

async function createIndexes() {
  console.log('📊 Creating MongoDB indexes...\n');

  try {
    const db = await getDatabase();
    const collection = db.collection('licenses');

    // Index sur la clé de licence (unique)
    await collection.createIndex({ key: 1 }, { unique: true });
    console.log('✅ Index on "key" (unique)');

    // Index sur l'email (pour récupération)
    await collection.createIndex({ email: 1 });
    console.log('✅ Index on "email"');

    // Index sur le session ID Stripe (unique)
    await collection.createIndex({ stripeSessionId: 1 }, { unique: true });
    console.log('✅ Index on "stripeSessionId" (unique)');

    // Index sur la date de création (pour tri)
    await collection.createIndex({ createdAt: -1 });
    console.log('✅ Index on "createdAt"');

    // Index composite pour les stats
    await collection.createIndex({ active: 1, createdAt: -1 });
    console.log('✅ Composite index on "active" + "createdAt"');

    console.log('\n🎉 All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
