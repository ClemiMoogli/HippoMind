# HippoMind - Documentation du Système de Paiement

## Vue d'ensemble du projet

HippoMind est une application de mind mapping offline avec un système de paiement Stripe et de génération de licences.

### Architecture du projet

```
MindMap/
├── landing/                    # Site web Next.js (hippomind.org)
│   ├── app/
│   │   ├── [locale]/          # Pages internationalisées (en/fr)
│   │   │   ├── page.tsx       # Page d'accueil
│   │   │   ├── success/       # Page de succès après paiement
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── checkout/      # Création de session Stripe
│   │       ├── webhook/stripe/# Réception des événements Stripe
│   │       └── verify-license/# Vérification des licences
│   ├── lib/
│   │   ├── stripe.ts          # Configuration Stripe
│   │   ├── license.ts         # Génération de licences
│   │   └── db.ts              # Stockage des licences (fichier JSON)
│   └── middleware.ts          # Gestion i18n (next-intl)
├── packages/
│   ├── main/                  # Process principal Electron
│   ├── renderer/              # Interface utilisateur
│   └── shared/                # Code partagé
└── PAYMENT_SYSTEM_DOCS.md    # Ce fichier
```

## Flux de paiement actuel

### 1. Achat sur le site web

```
Utilisateur visite hippomind.org
    ↓
Clique sur "Acheter" (section pricing)
    ↓
Appel API POST /api/checkout
    ↓
Création d'une session Stripe Checkout
    ↓
Redirection vers Stripe (paiement)
```

**Fichier concerné** : `landing/app/api/checkout/route.ts`

**URLs de redirection configurées** :
- Success: `https://hippomind.org/en/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel: `https://hippomind.org/en#pricing`

### 2. Après le paiement

```
Paiement réussi sur Stripe
    ↓
Redirection vers /en/success?session_id=xxx
    ↓
Middleware next-intl gère la locale
    ↓
Page success récupère la session Stripe
    ↓
Vérifie le statut du paiement
    ↓
Génère une clé de licence (déterministe)
    ↓
Affiche la clé à l'utilisateur
```

**Fichier concerné** : `landing/app/[locale]/success/page.tsx`

### 3. Webhook Stripe (optionnel)

En parallèle, Stripe envoie un webhook à `/api/webhook/stripe` :

```
Événement checkout.session.completed
    ↓
Vérification de la signature Stripe
    ↓
Génération de la licence
    ↓
Stockage de la licence (actuellement désactivé sur Vercel)
    ↓
(TODO: Envoi d'email avec la clé)
```

**Fichier concerné** : `landing/app/api/webhook/stripe/route.ts`

## Système de génération de licences

### Format des clés

```
HIPPO-XXXX-XXXX-XXXX
```

Exemple : `HIPPO-A1B2-C3D4-E5F6`

### Génération déterministe

Les clés sont générées à partir d'un hash SHA-256 du `session_id` Stripe, ce qui garantit :
- **Même session = même clé** (important car pas de BDD persistante sur Vercel)
- **Unicité** (basé sur l'ID de session unique Stripe)
- **Reproductibilité** (rechargement de la page affiche toujours la même clé)

**Code** : `landing/lib/license.ts:26-36`

```typescript
export function generateLicenseKeyFromSession(sessionId: string): string {
  const hash = createHash('sha256').update(sessionId).digest('hex');
  const chars = hash.toUpperCase();
  const part1 = chars.substring(0, 4);
  const part2 = chars.substring(4, 8);
  const part3 = chars.substring(8, 12);
  return `HIPPO-${part1}-${part2}-${part3}`;
}
```

### Propriétés d'une licence

```typescript
interface License {
  key: string;                 // HIPPO-XXXX-XXXX-XXXX
  email: string;               // Email du client
  stripeSessionId: string;     // ID de session Stripe
  stripeCustomerId?: string;   // ID client Stripe (optionnel)
  productName: string;         // "HippoMind"
  price: number;               // Prix payé (en centimes)
  currency: string;            // "usd", "eur", etc.
  createdAt: string;           // ISO timestamp
  active: boolean;             // true
  activations: number;         // Nombre d'activations actuelles
  maxActivations: number;      // 3 (limite)
}
```

## Configuration i18n (Internationalization)

Le site utilise **next-intl** pour gérer l'anglais et le français.

### Configuration actuelle

**Fichier** : `landing/i18n/routing.ts`

```typescript
export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always'  // Toutes les URLs ont un préfixe (/en/ ou /fr/)
});
```

### Structure des URLs

- Anglais : `https://hippomind.org/en/...`
- Français : `https://hippomind.org/fr/...`

Le middleware (`landing/middleware.ts`) intercepte toutes les requêtes et gère automatiquement :
- Détection de la langue préférée (cookies, headers)
- Redirection vers la bonne locale
- Exclusion des routes API et fichiers statiques

## Problèmes résolus récemment (28 oct 2025)

### ✅ Problème 1 : Erreur 404 sur /success

**Symptôme** : Après paiement, l'utilisateur était redirigé vers une page 404.

**Cause** : Configuration `localePrefix: 'as-needed'` créait une ambiguïté de routing. La page était dans `/[locale]/success` mais l'URL utilisait `/success` sans locale.

**Solution** :
- Changé vers `localePrefix: 'always'`
- Mis à jour les URLs Stripe pour utiliser `/en/success`
- Simplifié le middleware matcher

### ✅ Problème 2 : Redirection vers /en/ au lieu d'afficher la licence

**Symptôme** : La page success redirige immédiatement vers `/en/` sans afficher la licence.

**Cause** : Système de fichiers en lecture seule sur Vercel. L'application essayait d'écrire dans `data/licenses.json`, ce qui causait une erreur et déclenchait une redirection.

**Solution** :
1. Désactivation du stockage fichier sur Vercel (`if (process.env.VERCEL)`)
2. Génération déterministe des clés (basée sur hash du session_id)
3. Meilleure gestion d'erreur (affichage au lieu de redirection silencieuse)

### ✅ Problème 3 : Clé différente à chaque rechargement

**Symptôme** : Rafraîchir la page générait une nouvelle clé de licence.

**Cause** : Utilisation de `nanoid()` qui génère des IDs aléatoires.

**Solution** : Hash SHA-256 du session_id pour une génération déterministe.

### ✅ Problème 4 : Impossible de build sans clés Stripe

**Symptôme** : `npm run build` échouait avec "Missing STRIPE_SECRET_KEY".

**Cause** : Import strict des modules Stripe au build time.

**Solution** : Utilisation d'un placeholder pour permettre le build (`'sk_test_placeholder'`).

## Problèmes en cours / Limitations

### ⚠️ 1. Pas de persistance des licences

**Problème** : Les licences ne sont pas stockées dans une base de données.

**Impact** :
- Impossible de lister toutes les licences vendues
- Impossible de désactiver une licence à distance
- Pas de suivi des activations
- L'API `/api/verify-license` ne fonctionne probablement pas correctement

**État** : Temporairement contourné par génération déterministe, mais **nécessite une vraie BDD en production**.

### ⚠️ 2. Pas d'envoi d'email automatique

**Problème** : L'utilisateur ne reçoit pas d'email avec sa clé de licence.

**Impact** :
- Si l'utilisateur ferme la page, il perd sa clé
- Pas de backup automatique de la licence

**État** : TODO (voir section "À faire" ci-dessous).

### ⚠️ 3. Webhook Stripe peut-être non configuré

**Problème** : Le webhook endpoint existe mais n'est peut-être pas enregistré sur Stripe.

**Impact** :
- Les événements Stripe ne sont peut-être pas reçus
- La génération de licence via webhook ne se fait pas

**État** : À vérifier sur le dashboard Stripe.

### ⚠️ 4. Variables d'environnement Stripe sur Vercel

**Problème** : Les clés Stripe doivent être configurées sur Vercel.

**Variables requises** :
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://hippomind.org
```

**État** : À vérifier dans les settings Vercel.

### ⚠️ 5. Session de test vs production

**Problème** : Le session_id utilisé dans l'URL semble être une session de test (`cs_test_...`).

**Impact** : Peut ne pas fonctionner avec les clés de production Stripe.

**État** : À tester avec un vrai paiement en production.

## Variables d'environnement

### Fichier .env.local (local)

```env
# Site
NEXT_PUBLIC_SITE_URL=https://hippomind.org
NEXT_PUBLIC_CONTACT_EMAIL=support@hippomind.org

# Downloads
NEXT_PUBLIC_DOWNLOAD_MAC=https://github.com/clement-jny/MindMap/releases/latest/download/HippoMind-macOS.dmg
NEXT_PUBLIC_DOWNLOAD_WINDOWS=https://github.com/clement-jny/MindMap/releases/latest/download/HippoMind-Windows.exe
NEXT_PUBLIC_DOWNLOAD_LINUX=https://github.com/clement-jny/MindMap/releases/latest/download/HippoMind-Linux.AppImage

# Stripe (à configurer)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Variables Vercel (production)

**À configurer dans** : Settings > Environment Variables

Mêmes variables que ci-dessus, mais avec les clés de **production** Stripe.

## À faire (TODO)

### Priorité HAUTE 🔴

#### 1. Migrer vers une vraie base de données

**Options** :
- **Vercel KV** (Redis) - Simple, intégré à Vercel
- **Vercel Postgres** - Base relationnelle complète
- **Supabase** - Alternative gratuite avec PostgreSQL
- **PlanetScale** - MySQL serverless

**Étapes** :
1. Créer la base de données
2. Définir le schéma (table `licenses`)
3. Remplacer `landing/lib/db.ts` pour utiliser la BDD
4. Migrer les fonctions d'écriture/lecture

**Fichiers à modifier** :
- `landing/lib/db.ts`
- Éventuellement ajouter un client de BDD (pg, @vercel/kv, etc.)

#### 2. Implémenter l'envoi d'email

**Options** :
- **Resend** - Recommandé, très simple
- **SendGrid** - Populaire, gratuit jusqu'à 100 emails/jour
- **Postmark** - Excellente délivrabilité

**Étapes** :
1. Créer un compte sur Resend (ou autre)
2. Obtenir une clé API
3. Créer un template d'email
4. Ajouter l'envoi dans le webhook Stripe

**Fichiers à modifier** :
- `landing/app/api/webhook/stripe/route.ts` (ligne 71-76)
- Créer `landing/lib/email.ts` pour l'envoi

**Template email suggéré** :
```
Subject: Your HippoMind License Key 🎉

Hi there,

Thank you for purchasing HippoMind!

Your license key:
HIPPO-XXXX-XXXX-XXXX

Download links:
- macOS: [link]
- Windows: [link]
- Linux: [link]

Need help? Contact support@hippomind.org

Best regards,
The HippoMind Team
```

#### 3. Configurer le webhook Stripe sur le dashboard

**Étapes** :
1. Aller sur https://dashboard.stripe.com/webhooks
2. Ajouter un endpoint : `https://hippomind.org/api/webhook/stripe`
3. Sélectionner l'événement : `checkout.session.completed`
4. Copier le signing secret (`whsec_...`)
5. Ajouter à Vercel : `STRIPE_WEBHOOK_SECRET=whsec_...`

#### 4. Vérifier les variables d'environnement Vercel

**Checklist** :
- [ ] `STRIPE_SECRET_KEY` (clé de production `sk_live_...`)
- [ ] `STRIPE_PRICE_ID` (ID du produit)
- [ ] `STRIPE_WEBHOOK_SECRET` (secret du webhook)
- [ ] `NEXT_PUBLIC_SITE_URL=https://hippomind.org`
- [ ] Toutes les variables `NEXT_PUBLIC_DOWNLOAD_*`

### Priorité MOYENNE 🟡

#### 5. Améliorer la page d'erreur

**Actuellement** : Affiche le message d'erreur brut.

**À améliorer** :
- Message plus user-friendly
- Ne pas exposer les détails techniques en production
- Logger les erreurs dans un service (Sentry, LogRocket, etc.)

#### 6. Ajouter un système de récupération de licence

**Cas d'usage** : L'utilisateur a perdu sa clé de licence.

**Solution possible** :
- Page `/recover-license` avec formulaire email
- Recherche dans la BDD par email
- Renvoie la clé par email (avec vérification)

#### 7. Dashboard admin pour gérer les licences

**Fonctionnalités** :
- Lister toutes les licences vendues
- Voir les activations
- Désactiver/réactiver une licence
- Rechercher par email ou clé

**Technologies suggérées** :
- Next.js Admin (simple route protégée)
- Ou service externe comme Retool, Forest Admin

#### 8. Tests automatisés

**À tester** :
- Génération déterministe des clés
- Validation du format de clé
- Flux de paiement complet (tests E2E)
- API de vérification de licence

### Priorité BASSE 🟢

#### 9. Analytics et tracking

**Métriques à suivre** :
- Taux de conversion (visiteurs → achats)
- Abandons de panier
- Source des visiteurs
- Temps moyen avant achat

**Outils** :
- Google Analytics
- Plausible (privacy-friendly)
- Mixpanel

#### 10. Optimisations SEO

- Meta tags dynamiques
- Sitemap XML
- robots.txt
- Schema.org markup

#### 11. Support multidevise

Actuellement fixé sur USD. Permettre EUR, GBP, etc.

## Comment tester le système

### Test local (avec session de test)

1. Démarrer le serveur :
```bash
cd landing
npm run dev
```

2. Créer une session de test Stripe manuellement ou via l'API

3. Accéder à :
```
http://localhost:3000/en/success?session_id=cs_test_...
```

### Test en production

1. Aller sur https://hippomind.org
2. Cliquer sur "Buy Now"
3. Utiliser une carte de test Stripe : `4242 4242 4242 4242`
4. Vérifier que la page success s'affiche avec la clé

## Commandes utiles

```bash
# Build du site
cd landing
npm run build

# Démarrer en dev
npm run dev

# Démarrer en production
npm start

# Build de l'app Electron
cd /Users/clement/Dev/MindMap
npm run build

# Vérifier les types TypeScript
cd landing
npm run typecheck
```

## Ressources et liens

### Documentation externe
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Vercel Deployment](https://vercel.com/docs)

### Dashboards
- **Stripe Dashboard** : https://dashboard.stripe.com/
- **Vercel Dashboard** : https://vercel.com/dashboard
- **GitHub Repo** : https://github.com/ClemiMoogli/HippoMind (ou clement-jny/MindMap)

### Fichiers importants modifiés récemment

| Fichier | Description | Dernière modif |
|---------|-------------|----------------|
| `landing/i18n/routing.ts` | Config i18n | ✅ localePrefix: 'always' |
| `landing/middleware.ts` | Middleware next-intl | ✅ Matcher simplifié |
| `landing/app/api/checkout/route.ts` | Création session Stripe | ✅ URLs en /en/ |
| `landing/app/[locale]/success/page.tsx` | Page après paiement | ✅ Gestion d'erreur améliorée |
| `landing/lib/license.ts` | Génération de licences | ✅ Hash déterministe |
| `landing/lib/db.ts` | Stockage licences | ✅ Skip sur Vercel |
| `landing/lib/stripe.ts` | Config Stripe | ✅ Placeholder pour build |

## Contact et support

**Email** : support@hippomind.org
**Développeur** : Clement (vous !)

---

**Dernière mise à jour** : 28 octobre 2025
**Version du système** : v1.0 (première version du système de paiement)
**Status** : ⚠️ Fonctionnel mais nécessite migration BDD et emails
