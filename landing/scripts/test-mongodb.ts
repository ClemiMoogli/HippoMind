/**
 * Script pour tester la connexion MongoDB
 * Run with: npx tsx scripts/test-mongodb.ts
 */

import dotenv from 'dotenv';
import { getDatabase } from '../lib/mongodb';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('🔌 Testing MongoDB connection...\n');

  try {
    // Se connecter à la base de données
    const db = await getDatabase();

    console.log('✅ Connected to MongoDB!');
    console.log('📦 Database:', db.databaseName);

    // Lister les collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections:', collections.length);

    if (collections.length > 0) {
      console.log('   -', collections.map(c => c.name).join(', '));
    } else {
      console.log('   - (aucune collection pour le moment)');
    }

    // Tester l'accès à la collection licenses
    const licensesCollection = db.collection('licenses');
    const count = await licensesCollection.countDocuments();
    console.log('🔑 Licenses:', count);

    console.log('\n✅ MongoDB is ready to use!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

testConnection();
