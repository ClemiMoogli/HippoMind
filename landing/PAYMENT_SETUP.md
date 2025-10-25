# 💳 Configuration du Système de Paiement

## Vue d'ensemble

HippoMind est un **achat unique à 19€/$19**. Vous avez besoin d'un système pour :
1. Accepter les paiements
2. Générer des licences uniques
3. Valider les licences dans l'app

## Options de Paiement

### 🥇 Option 1 : Gumroad (Le Plus Simple)

**Parfait pour débuter !**

#### Avantages
- ✅ Setup en 10 minutes
- ✅ Gestion des taxes automatique (TVA EU, sales tax US)
- ✅ Support Stripe + PayPal intégré
- ✅ Génération de clés de licence
- ✅ Emails automatiques
- ✅ Dashboard analytics
- ✅ Pas de code backend nécessaire

#### Inconvénients
- ❌ Commission : 10% + frais Stripe/PayPal
- ❌ Branding Gumroad visible
- ❌ Moins de flexibilité

#### Configuration

1. **Créer un compte** : https://gumroad.com/

2. **Créer un produit** :
   - Type : "Digital Product"
   - Nom : "HippoMind - Mind Mapping App"
   - Prix : 19€ ou $19
   - Description : Copiez depuis `messages/en.json` → `pricing.features`

3. **Activer les License Keys** :
   - Settings → Advanced
   - Cocher "Generate a unique license key per sale"
   - Format : `NFXXX-XXXXX-XXXXX-XXXXX`

4. **Configurer le lien de paiement** :
   - Vous obtenez une URL : `https://votreusername.gumroad.com/l/nodeflow`

5. **Intégrer dans la landing page** :

Éditez `landing/components/Pricing.tsx` (ligne ~90) :

```tsx
<a
  href="https://votreusername.gumroad.com/l/nodeflow"
  className="block w-full py-4 px-6 text-center bg-gradient-to-r from-blue-600 to-purple-600..."
>
  {t('cta')} {/* "Get HippoMind Now" */}
</a>
```

6. **Webhook pour notifications** (optionnel) :
   - Gumroad → Settings → Advanced → Webhooks
   - URL : `https://votresite.com/api/webhooks/gumroad`
   - Événements : "sale"

#### Validation de Licence dans l'App

Dans votre app Tauri, créez un écran de licence :

```typescript
// packages/renderer/src/components/LicenseDialog.tsx
async function validateLicense(key: string) {
  const response = await fetch(
    `https://api.gumroad.com/v2/licenses/verify`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: 'VOTRE_PRODUCT_ID',
        license_key: key,
        increment_uses_count: false
      })
    }
  );

  const data = await response.json();
  return data.success; // true si valide
}
```

**Coûts** :
- 10% de commission
- Ex : Vente à 19€ → Vous recevez ~15.39€ après commission + frais Stripe

---

### 🥈 Option 2 : LemonSqueezy

**Alternative moderne à Gumroad**

#### Avantages
- ✅ Interface moderne
- ✅ Commission : 5% (moins que Gumroad)
- ✅ Taxes gérées (TVA EU)
- ✅ Webhooks robustes
- ✅ API complète
- ✅ Licences intégrées

#### Configuration

Très similaire à Gumroad :

1. Créer compte : https://lemonsqueezy.com/
2. Créer un produit "Software License"
3. Prix : 19€/$19
4. Activer license keys

**Intégration landing** :

```tsx
<a href="https://votrestore.lemonsqueezy.com/buy/product-id">
  Get HippoMind Now
</a>
```

**API de validation** :

```typescript
const response = await fetch(
  'https://api.lemonsqueezy.com/v1/licenses/validate',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ license_key: key })
  }
);
```

**Coûts** :
- 5% + frais Stripe
- Ex : Vente à 19€ → Vous recevez ~16.30€

---

### 🥉 Option 3 : Paddle

**Pour scale (500+ ventes/mois)**

#### Avantages
- ✅ Merchant of Record (ils gèrent TOUT : TVA, taxes, facturation)
- ✅ Support multi-devises
- ✅ Protection fraude intégrée
- ✅ Récupération de paiements échoués
- ✅ Très professionnel

#### Inconvénients
- ❌ Setup plus complexe
- ❌ Commission ~5-10%
- ❌ Approbation manuelle du compte

**À utiliser quand** : Vous dépassez 10k€/mois de revenus

---

### 🛠️ Option 4 : Stripe Custom

**Contrôle total, mais plus de travail**

#### Configuration

1. **Créer compte Stripe** : https://stripe.com/

2. **Créer un produit** :
   - Dashboard → Products → Add Product
   - Nom : "HippoMind License"
   - Prix : 19€

3. **Créer une Payment Page** :
   - Products → HippoMind → Payment Links
   - Create link
   - URL : `https://buy.stripe.com/xxxxx`

4. **Ou intégrer Stripe Checkout** :

```typescript
// landing/app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price: 'price_xxxxx', // Prix ID de Stripe
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'https://nodeflow.app/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://nodeflow.app/pricing',
    metadata: {
      product: 'nodeflow-license'
    }
  });

  return Response.json({ url: session.url });
}
```

Landing page button :

```tsx
<button
  onClick={async () => {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const { url } = await res.json();
    window.location.href = url;
  }}
>
  Get HippoMind Now
</button>
```

5. **Générer des Licenses** :

Après paiement réussi, via webhook :

```typescript
// landing/app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import crypto from 'crypto';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Générer une clé de licence unique
    const licenseKey = crypto.randomBytes(16).toString('hex').toUpperCase();
    const formattedKey = `NF-${licenseKey.slice(0,4)}-${licenseKey.slice(4,8)}-${licenseKey.slice(8,12)}`;

    // Sauvegarder dans DB
    await db.licenses.create({
      key: formattedKey,
      email: session.customer_email,
      stripeSessionId: session.id,
      active: true,
      createdAt: new Date()
    });

    // Envoyer email avec la clé
    await sendEmail(session.customer_email, formattedKey);
  }

  return Response.json({ received: true });
}
```

**Avantages** :
- ✅ Commission la plus basse (2.9% + 0.25€)
- ✅ Contrôle total
- ✅ Branding 100% vous

**Inconvénients** :
- ❌ Vous devez gérer la TVA vous-même
- ❌ Plus de code à écrire
- ❌ Base de données requise

**Coûts** :
- 2.9% + 0.25€ par transaction
- Ex : Vente à 19€ → Vous recevez ~18.20€

---

## Système de Licence dans l'App

### Structure Recommandée

```typescript
// packages/shared/src/types/license.ts
export interface License {
  key: string;
  email: string;
  activatedAt: Date;
  verified: boolean;
}
```

### Écran d'activation

```tsx
// packages/renderer/src/components/LicenseActivation.tsx
import { useState } from 'react';

export function LicenseActivation() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);

  async function activate() {
    setLoading(true);
    try {
      // Appel API pour vérifier
      const valid = await validateLicense(key);

      if (valid) {
        // Sauvegarder localement
        await window.electron.store.set('license', {
          key,
          verified: true,
          activatedAt: new Date()
        });

        alert('License activated! 🎉');
      } else {
        alert('Invalid license key');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="license-dialog">
      <h2>Activate HippoMind</h2>
      <input
        type="text"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="NF-XXXX-XXXX-XXXX"
      />
      <button onClick={activate} disabled={loading}>
        {loading ? 'Verifying...' : 'Activate'}
      </button>
    </div>
  );
}
```

### Vérification au démarrage

```typescript
// packages/renderer/src/App.tsx
useEffect(() => {
  async function checkLicense() {
    const license = await window.electron.store.get('license');

    if (!license || !license.verified) {
      // Afficher l'écran de licence
      setShowLicenseDialog(true);
    }
  }

  checkLicense();
}, []);
```

### Offline-first

**Important** : HippoMind est offline-first. La validation doit être **une seule fois** :

1. User achète → Reçoit clé par email
2. User entre la clé dans l'app → Validation online
3. Clé sauvegardée localement
4. App fonctionne offline pour toujours

**Pas de vérification continue !** (sinon pas vraiment offline)

---

## Comparaison des Options

| Critère | Gumroad | LemonSqueezy | Paddle | Stripe |
|---------|---------|--------------|--------|--------|
| **Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Commission** | 10% | 5% | 5-10% | 2.9% |
| **TVA gérée** | ✅ | ✅ | ✅ | ❌ |
| **Licences** | ✅ | ✅ | ✅ | Manuel |
| **API** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Temps setup** | 10 min | 15 min | 1-2h | 2-4h |

---

## Ma Recommandation

### Pour Débuter : **Gumroad**

Pourquoi :
- ✅ 10 minutes de setup
- ✅ Tout est géré (TVA, emails, licences)
- ✅ Vous pouvez lancer **aujourd'hui**

Passez à Stripe/LemonSqueezy quand :
- Vous avez 100+ ventes
- Vous voulez réduire les commissions
- Vous voulez plus de contrôle

---

## Checklist

- [ ] Compte créé (Gumroad/LemonSqueezy/Stripe)
- [ ] Produit créé (nom, prix, description)
- [ ] License keys activées
- [ ] Lien de paiement obtenu
- [ ] CTA dans Pricing.tsx mis à jour
- [ ] Écran d'activation créé dans l'app
- [ ] Validation de licence implémentée
- [ ] Tests avec une vraie transaction
- [ ] Emails de confirmation testés

---

## Workflow Complet

```
1. User visite landing page
   ↓
2. Clique "Get HippoMind Now" (19€)
   ↓
3. Redirigé vers Gumroad/Stripe
   ↓
4. Paie avec carte/PayPal
   ↓
5. Reçoit email avec :
   - Clé de licence : NF-XXXX-XXXX-XXXX
   - Liens de téléchargement
   ↓
6. Télécharge et installe HippoMind
   ↓
7. Lance l'app → Écran "Enter license"
   ↓
8. Entre la clé → Validation online
   ↓
9. Clé sauvegardée localement
   ↓
10. App déverrouillée pour toujours (offline)
```

---

**Questions ?** Consultez [INTEGRATION.md](../INTEGRATION.md) pour l'intégration complète landing ↔️ app ↔️ paiement.
