# Guide de Migration vers MongoDB Atlas

## Pourquoi MongoDB ?

MongoDB est un excellent choix pour stocker les licences HippoMind :

### ✅ Avantages

- **Gratuit** : 512 MB gratuits avec MongoDB Atlas
- **Flexible** : Schema-less, facile d'ajouter des champs
- **Performant** : Excellentes performances de lecture/écriture
- **Familier** : Si vous connaissez déjà MongoDB
- **Queries riches** : Recherche avancée, agrégations, etc.
- **Scaling** : Facile de scaler si vous avez beaucoup de clients
- **Backup automatique** : Sur le plan gratuit

### Comparaison avec Vercel KV

| Critère | MongoDB Atlas | Vercel KV (Redis) |
|---------|---------------|-------------------|
| Stockage gratuit | 512 MB | 256 MB |
| Queries complexes | ✅ Excellent | ⚠️ Limité |
| Setup initial | ⚠️ ~20 min | ✅ ~10 min |
| Familiarité | ✅ Si vous connaissez | ⚠️ Nouveau concept |
| Relations | ✅ Excellentes | ❌ Pas de relations |
| Backup | ✅ Automatique | ⚠️ Payant |

**Recommandation** : MongoDB si vous prévoyez beaucoup de features (dashboard admin, analytics, etc.). Vercel KV si vous voulez la simplicité.

## Étape 1 : Créer un compte MongoDB Atlas (5 min)

1. Aller sur https://www.mongodb.com/cloud/atlas/register
2. S'inscrire (gratuit, pas de carte bancaire requise)
3. Choisir le plan **M0 Free** (512 MB)
4. Sélectionner le provider : **AWS**
5. Région : **us-east-1** (proche de Vercel)
6. Nom du cluster : `hippomind-cluster`
7. Cliquer "Create Cluster"

⏱️ Le cluster met ~3-5 minutes à se créer.

## Étape 2 : Configuration de sécurité (5 min)

### 2.1 Créer un utilisateur de base de données

1. Dans le menu, cliquer "Database Access"
2. Cliquer "Add New Database User"
3. Méthode : **Password**
4. Username : `hippomind-app`
5. Password : **Générer un mot de passe fort** (noter le quelque part !)
6. Database User Privileges : **Read and write to any database**
7. Cliquer "Add User"

### 2.2 Configurer l'accès réseau

1. Dans le menu, cliquer "Network Access"
2. Cliquer "Add IP Address"
3. Sélectionner **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ C'est OK pour une app serverless sur Vercel
   - L'authentification se fait par username/password
4. Cliquer "Confirm"

## Étape 3 : Obtenir la connection string (2 min)

1. Retour à "Database" dans le menu
2. Cliquer "Connect" sur votre cluster
3. Choisir "Connect your application"
4. Driver : **Node.js**
5. Version : **6.7 or later**
6. Copier la connection string :

```
mongodb+srv://hippomind-app:<password>@hippomind-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. Remplacer `<password>` par le mot de passe créé à l'étape 2.1

## Étape 4 : Installer le driver MongoDB (1 min)

```bash
cd landing
npm install mongodb
```

## Étape 5 : Créer le client MongoDB (5 min)

Créer `landing/lib/mongodb.ts` :

```typescript
/**
 * MongoDB client configuration
 */

import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// En développement, utiliser une variable globale pour éviter
// de créer trop de connexions lors des hot-reloads
if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En production, créer une nouvelle connexion
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('hippomind');
}
```

## Étape 6 : Remplacer lib/db.ts (15 min)

Remplacer le contenu de `landing/lib/db.ts` :

```typescript
/**
 * MongoDB database operations for licenses
 */

import { getDatabase } from './mongodb';
import type { License } from './license';
import { Collection, Document } from 'mongodb';

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
 * Get all licenses for an email
 */
export async function getLicensesByEmail(email: string): Promise<License[]> {
  const collection = await getLicensesCollection();
  return await collection.find({ email }).toArray();
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
 * Get all licenses with pagination
 */
export async function getAllLicenses(
  page: number = 1,
  limit: number = 50
): Promise<{ licenses: License[]; total: number }> {
  const collection = await getLicensesCollection();

  const skip = (page - 1) * limit;

  const [licenses, total] = await Promise.all([
    collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments()
  ]);

  return { licenses, total };
}

/**
 * Get license statistics
 */
export async function getLicenseStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  totalActivations: number;
  totalRevenue: number;
}> {
  const collection = await getLicensesCollection();

  const [stats] = await collection.aggregate([
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
        totalActivations: { $sum: '$activations' },
        totalRevenue: { $sum: '$price' }
      }
    }
  ]).toArray();

  return stats || {
    total: 0,
    active: 0,
    inactive: 0,
    totalActivations: 0,
    totalRevenue: 0
  };
}

/**
 * Search licenses by email, key or session ID
 */
export async function searchLicenses(query: string): Promise<License[]> {
  const collection = await getLicensesCollection();

  return await collection.find({
    $or: [
      { email: { $regex: query, $options: 'i' } },
      { key: { $regex: query, $options: 'i' } },
      { stripeSessionId: { $regex: query, $options: 'i' } }
    ]
  }).toArray();
}
```

## Étape 7 : Ajouter les variables d'environnement (2 min)

### Local (.env.local)

```bash
cd landing

# Ajouter la connection string MongoDB
echo "MONGODB_URI=mongodb+srv://hippomind-app:<password>@hippomind-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority" >> .env.local
```

Remplacez `<password>` par votre mot de passe !

### Vercel (Production)

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `landing`
3. Settings > Environment Variables
4. Ajouter :
   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://hippomind-app:PASSWORD@hippomind-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Environments : Production, Preview, Development

## Étape 8 : Créer les index MongoDB (5 min)

Les index améliorent les performances des requêtes.

Créer `landing/scripts/setup-mongodb-indexes.ts` :

```typescript
/**
 * Script to create MongoDB indexes
 * Run with: npx tsx scripts/setup-mongodb-indexes.ts
 */

import { getDatabase } from '../lib/mongodb';

async function setupIndexes() {
  console.log('Setting up MongoDB indexes...');

  const db = await getDatabase();
  const collection = db.collection('licenses');

  // Index sur la clé de licence (unique)
  await collection.createIndex({ key: 1 }, { unique: true });
  console.log('✅ Created index on key');

  // Index sur l'email (pour récupération)
  await collection.createIndex({ email: 1 });
  console.log('✅ Created index on email');

  // Index sur le session ID Stripe (unique)
  await collection.createIndex({ stripeSessionId: 1 }, { unique: true });
  console.log('✅ Created index on stripeSessionId');

  // Index sur la date de création (pour tri)
  await collection.createIndex({ createdAt: -1 });
  console.log('✅ Created index on createdAt');

  // Index composite pour les stats
  await collection.createIndex({ active: 1, createdAt: -1 });
  console.log('✅ Created composite index on active + createdAt');

  console.log('\n🎉 All indexes created successfully!');
  process.exit(0);
}

setupIndexes().catch(console.error);
```

Installer tsx et exécuter :

```bash
npm install --save-dev tsx
npx tsx scripts/setup-mongodb-indexes.ts
```

## Étape 9 : Tester localement (5 min)

```bash
cd landing
npm run dev
```

Tester l'API de vérification :

```bash
curl -X POST http://localhost:3000/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"key": "HIPPO-TEST-TEST-TEST"}'
```

## Étape 10 : Déployer (1 min)

```bash
git add .
git commit -m "feat: Migrate to MongoDB for license storage"
git push
```

## Avantages supplémentaires avec MongoDB

### 1. Dashboard MongoDB Atlas

Vous pouvez voir vos données directement dans MongoDB Atlas :

1. Aller sur https://cloud.mongodb.com
2. Browse Collections
3. Base `hippomind` > Collection `licenses`

Vous verrez toutes vos licences avec une interface graphique !

### 2. Queries avancées

```typescript
// Licences créées dans les dernières 24h
const recentLicenses = await collection.find({
  createdAt: {
    $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
}).toArray();

// Licences actives avec plus de 2 activations
const highUsageLicenses = await collection.find({
  active: true,
  activations: { $gte: 2 }
}).toArray();

// Revenue total par mois
const monthlyRevenue = await collection.aggregate([
  {
    $group: {
      _id: { $month: { $dateFromString: { dateString: '$createdAt' } } },
      total: { $sum: '$price' },
      count: { $sum: 1 }
    }
  }
]).toArray();
```

### 3. Export des données

Facile d'exporter toutes les licences en CSV/JSON depuis MongoDB Atlas.

## Structure des données

MongoDB stocke les licences comme des documents JSON :

```json
{
  "_id": ObjectId("..."),
  "key": "HIPPO-A1B2-C3D4-E5F6",
  "email": "user@example.com",
  "stripeSessionId": "cs_test_xxx",
  "stripeCustomerId": "cus_xxx",
  "productName": "HippoMind",
  "price": 2900,
  "currency": "usd",
  "createdAt": "2025-10-28T15:30:00.000Z",
  "active": true,
  "activations": 1,
  "maxActivations": 3
}
```

## Monitoring et alertes

### Alertes MongoDB Atlas

Vous pouvez configurer des alertes :

1. Dans Atlas, aller dans "Alerts"
2. Configurer par exemple :
   - Alerte si le stockage dépasse 80%
   - Alerte si le cluster est down
   - Alerte si trop de connexions

### Logs

Les logs de connexion MongoDB sont dans :
- Vercel : Dashboard > Logs
- MongoDB Atlas : Metrics > View Monitoring

## Migration depuis le système actuel

Si vous avez déjà des licences stockées dans des fichiers :

```typescript
// Script de migration
import { storeLicense } from './lib/db';
import fs from 'fs/promises';

async function migrate() {
  const data = await fs.readFile('data/licenses.json', 'utf-8');
  const licenses = JSON.parse(data);

  for (const [key, license] of Object.entries(licenses)) {
    await storeLicense(license);
    console.log('Migrated:', key);
  }

  console.log('Migration complete!');
}

migrate();
```

## Coûts

### MongoDB Atlas - Plan gratuit (M0)

- ✅ 512 MB de stockage
- ✅ Connexions illimitées
- ✅ Backup automatique (7 jours)
- ✅ Support communautaire

**Estimation** :
- 1 licence = ~500 bytes
- 512 MB = ~1 million de licences
- Largement suffisant !

### Si vous dépassez

Plan M2 : 9$/mois pour 2 GB

## Comparaison finale : MongoDB vs Vercel KV

| Cas d'usage | Recommandation |
|-------------|----------------|
| Vous connaissez MongoDB | ✅ **MongoDB** |
| Vous voulez la simplicité | ✅ **Vercel KV** |
| Vous prévoyez beaucoup de features | ✅ **MongoDB** |
| Vous voulez juste que ça marche | ✅ **Vercel KV** |
| Vous voulez un dashboard visuel | ✅ **MongoDB** |
| Vous voulez des queries complexes | ✅ **MongoDB** |
| Vous voulez des backups gratuits | ✅ **MongoDB** |

**Mon avis** : MongoDB est plus complet mais prend un peu plus de temps à setup. Les deux sont d'excellents choix !

## Checklist finale

Avant de déployer en production :

- [ ] Cluster MongoDB créé
- [ ] Utilisateur de BDD créé
- [ ] IP whitelistée (0.0.0.0/0)
- [ ] Connection string copiée
- [ ] Variable MONGODB_URI ajoutée sur Vercel
- [ ] Driver `mongodb` installé
- [ ] Index créés
- [ ] Tests locaux réussis
- [ ] Build réussi

---

**Temps total estimé** : ~40-50 minutes

**Difficulté** : ⭐⭐⭐☆☆ (Moyen)

Besoin d'aide ? Les erreurs courantes et leurs solutions sont dans la section suivante !

## Dépannage

### Erreur : "MongoServerError: bad auth"

**Cause** : Mauvais mot de passe ou username

**Solution** :
1. Vérifier le mot de passe dans la connection string
2. Recréer un utilisateur si nécessaire

### Erreur : "Connection timeout"

**Cause** : IP non whitelistée

**Solution** :
1. MongoDB Atlas > Network Access
2. Vérifier que 0.0.0.0/0 est ajouté

### Erreur : "MongoServerError: not authorized"

**Cause** : Privilèges insuffisants

**Solution** :
1. Database Access > Edit User
2. Privilèges : "Read and write to any database"

---

Vous êtes prêt ! 🚀
