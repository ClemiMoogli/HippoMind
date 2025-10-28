# Guide de Migration vers Vercel KV (Base de Données)

## Pourquoi migrer ?

Actuellement, les licences sont générées à la volée à partir du `session_id` Stripe, mais **ne sont pas sauvegardées**. Cela pose plusieurs problèmes :

- ❌ Impossible de lister les licences vendues
- ❌ Impossible de tracker les activations
- ❌ Impossible de désactiver une licence à distance
- ❌ L'API `/api/verify-license` ne fonctionne pas correctement

## Solution : Vercel KV (Redis)

**Vercel KV** est une base de données Redis serverless, parfaite pour notre cas d'usage :

- ✅ Gratuit jusqu'à 256 MB
- ✅ Intégré à Vercel
- ✅ Très simple à utiliser
- ✅ Parfait pour stocker des clés-valeurs
- ✅ Pas de configuration complexe

## Étape 1 : Créer une instance Vercel KV (5 min)

1. Aller sur https://vercel.com/dashboard
2. Cliquer sur "Storage" dans le menu
3. Cliquer "Create Database"
4. Sélectionner "KV (Redis)"
5. Donner un nom : `hippomind-licenses`
6. Sélectionner la région : `iad1` (proche de vos utilisateurs)
7. Cliquer "Create"

## Étape 2 : Connecter au projet (2 min)

1. Une fois la BDD créée, cliquer "Connect to Project"
2. Sélectionner votre projet `landing`
3. Les variables d'environnement seront automatiquement ajoutées :
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

## Étape 3 : Installer le client (1 min)

```bash
cd landing
npm install @vercel/kv
```

## Étape 4 : Remplacer lib/db.ts (15-20 min)

Remplacer le contenu de `landing/lib/db.ts` :

```typescript
/**
 * Vercel KV (Redis) database for licenses
 */

import { kv } from '@vercel/kv';
import type { License } from './license';

/**
 * Store a new license
 */
export async function storeLicense(license: License): Promise<void> {
  // Store by license key
  await kv.set(`license:${license.key}`, license);

  // Store by session ID for quick lookup
  await kv.set(`session:${license.stripeSessionId}`, license.key);

  // Store by email for recovery (use a set to allow multiple licenses per email)
  await kv.sadd(`email:${license.email}`, license.key);

  console.log('License stored:', license.key);
}

/**
 * Get license by key
 */
export async function getLicense(key: string): Promise<License | null> {
  return await kv.get(`license:${key}`);
}

/**
 * Get license by Stripe session ID
 */
export async function getLicenseBySession(sessionId: string): Promise<License | null> {
  const licenseKey = await kv.get<string>(`session:${sessionId}`);

  if (!licenseKey) {
    return null;
  }

  return await getLicense(licenseKey);
}

/**
 * Get all licenses for an email
 */
export async function getLicensesByEmail(email: string): Promise<License[]> {
  const keys = await kv.smembers(`email:${email}`);

  if (!keys || keys.length === 0) {
    return [];
  }

  const licenses: License[] = [];

  for (const key of keys) {
    const license = await getLicense(key as string);
    if (license) {
      licenses.push(license);
    }
  }

  return licenses;
}

/**
 * Update license activation count
 */
export async function incrementActivation(key: string): Promise<boolean> {
  const license = await getLicense(key);

  if (!license || !license.active) {
    return false;
  }

  if (license.activations >= license.maxActivations) {
    return false; // Max activations reached
  }

  license.activations += 1;
  await kv.set(`license:${key}`, license);

  return true;
}

/**
 * Deactivate a license
 */
export async function deactivateLicense(key: string): Promise<boolean> {
  const license = await getLicense(key);

  if (!license) {
    return false;
  }

  license.active = false;
  await kv.set(`license:${key}`, license);

  return true;
}

/**
 * Get all license keys (for admin dashboard)
 */
export async function getAllLicenseKeys(): Promise<string[]> {
  // Scan for all license keys (SCAN is better than KEYS for production)
  const keys: string[] = [];
  let cursor = 0;

  do {
    const result = await kv.scan(cursor, { match: 'license:*', count: 100 });
    cursor = result[0];
    keys.push(...result[1]);
  } while (cursor !== 0);

  // Remove the "license:" prefix
  return keys.map(k => k.replace('license:', ''));
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
  const keys = await getAllLicenseKeys();

  let active = 0;
  let inactive = 0;
  let totalActivations = 0;

  for (const key of keys) {
    const license = await getLicense(key);
    if (license) {
      if (license.active) {
        active++;
      } else {
        inactive++;
      }
      totalActivations += license.activations;
    }
  }

  return {
    total: keys.length,
    active,
    inactive,
    totalActivations,
  };
}
```

## Étape 5 : Tester localement (5 min)

Pour tester localement, il faut les variables d'environnement KV :

```bash
cd landing

# Télécharger les variables depuis Vercel
npx vercel env pull .env.local

# Vérifier que les variables KV sont présentes
cat .env.local | grep KV
```

Puis tester :

```bash
npm run dev
```

## Étape 6 : Déployer (1 min)

```bash
git add landing/
git commit -m "feat: Migrate to Vercel KV for license storage"
git push
```

Le déploiement Vercel se fera automatiquement.

## Structure des données dans Redis

```
# Par clé de licence
license:HIPPO-A1B2-C3D4-E5F6 → { key, email, stripeSessionId, ... }

# Par session Stripe (pour lookup rapide)
session:cs_test_xxx → "HIPPO-A1B2-C3D4-E5F6"

# Par email (set pour supporter plusieurs licences)
email:user@example.com → Set["HIPPO-A1B2-C3D4-E5F6", "HIPPO-X9Y8-Z7W6-V5U4"]
```

## Avantages de cette structure

1. **Lookup rapide par clé** : O(1)
2. **Lookup rapide par session** : O(1) + O(1) = O(2)
3. **Lookup par email** : O(n) où n = nombre de licences de cet email
4. **Support multi-licences** : Un email peut avoir plusieurs licences

## API supplémentaires disponibles

Après cette migration, vous aurez accès à :

```typescript
// Récupérer toutes les licences d'un email
const licenses = await getLicensesByEmail('user@example.com');

// Récupérer toutes les clés (pour admin)
const allKeys = await getAllLicenseKeys();

// Stats globales
const stats = await getLicenseStats();
// { total: 42, active: 40, inactive: 2, totalActivations: 87 }
```

## Tester la migration

### Test 1 : Créer une licence via webhook

1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Envoyer un événement test `checkout.session.completed`
3. Vérifier les logs Vercel
4. Vérifier dans Vercel KV (onglet "Data") que la licence est créée

### Test 2 : Récupérer une licence

```bash
# Dans la console Vercel KV
GET license:HIPPO-XXXX-XXXX-XXXX
```

### Test 3 : Vérifier l'API

```bash
curl -X POST https://hippomind.org/api/verify-license \
  -H "Content-Type: application/json" \
  -d '{"key": "HIPPO-XXXX-XXXX-XXXX"}'
```

## Coûts

**Plan gratuit Vercel KV** :
- 256 MB de stockage
- 3000 commandes/jour
- 30 GB de bande passante

**Estimation** :
- 1 licence = ~500 bytes
- 256 MB = ~500,000 licences
- Largement suffisant pour démarrer !

## Prochaines étapes après migration

Une fois la BDD en place, vous pourrez :

1. ✅ Implémenter un dashboard admin
2. ✅ Créer une API de récupération de licence par email
3. ✅ Tracker les activations réelles
4. ✅ Désactiver des licences à distance si nécessaire
5. ✅ Générer des statistiques de ventes

## Alternative : Vercel Postgres

Si vous préférez une base SQL relationnelle :

```bash
# Installer
npm install @vercel/postgres

# Créer la table
CREATE TABLE licenses (
  key VARCHAR(20) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  product_name VARCHAR(100),
  price INTEGER,
  currency VARCHAR(3),
  created_at TIMESTAMP DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  activations INTEGER DEFAULT 0,
  max_activations INTEGER DEFAULT 3
);

CREATE INDEX idx_email ON licenses(email);
CREATE INDEX idx_session ON licenses(stripe_session_id);
```

**Avantages PostgreSQL** :
- Requêtes SQL complexes
- Relations entre tables
- Transactions ACID
- Familier si vous connaissez SQL

**Inconvénients** :
- Plus complexe à setup
- Plus cher (5€/mois minimum)

**Recommandation** : Commencer avec KV, migrer vers Postgres si nécessaire plus tard.

---

**Temps total estimé** : ~30-45 minutes

**Difficulté** : ⭐⭐☆☆☆ (Facile)
