# 🎯 Guide de Configuration Stripe pour HippoMind

## ✅ Tout le code est prêt !

J'ai déjà créé tout le code nécessaire. Il vous reste juste à configurer Stripe et ajouter les clés.

---

## 📋 Étape 1 : Créer votre compte Stripe (5 min)

1. **Allez sur** : https://dashboard.stripe.com/register
2. **Créez un compte** avec votre email
3. **Vérifiez votre email**
4. Vous serez automatiquement en **mode Test** (parfait pour débuter)

---

## 📦 Étape 2 : Créer le produit HippoMind (3 min)

1. Dans le dashboard : https://dashboard.stripe.com/test/products
2. Cliquez **"Add product"**
3. Remplissez :

```
Name: HippoMind - Lifetime License
Description: Privacy-first mind mapping app. One-time purchase, lifetime access.

Pricing:
  - Model: Standard pricing
  - Price: 19.00 EUR
  - Billing: One time
  - Tax behavior: Inclusive (TTC)
```

4. Cliquez **"Save product"**

5. **Copiez le Price ID** qui apparaît (commence par `price_...`)
   - Exemple : `price_1QR2AbCD3EfGH4IJ5k6LmNO7`

---

## 🔑 Étape 3 : Récupérer vos clés API (2 min)

1. Allez sur : https://dashboard.stripe.com/test/apikeys
2. Vous verrez deux clés :

**Publishable key** (publique) :
```
pk_test_51...
```

**Secret key** (secrète) ⚠️ :
```
sk_test_51...
```

**⚠️ IMPORTANT** : Ne partagez JAMAIS la Secret key !

---

## 🎣 Étape 4 : Configurer le Webhook (5 min)

Pour que Stripe nous notifie des paiements :

1. Allez sur : https://dashboard.stripe.com/test/webhooks
2. Cliquez **"Add endpoint"**
3. Remplissez :

```
Endpoint URL: https://hippomind.org/api/webhook/stripe
Description: HippoMind license generation

Events to listen to:
  - checkout.session.completed
```

4. Cliquez **"Add endpoint"**

5. **Copiez le Signing secret** (commence par `whsec_...`)

---

## ⚙️ Étape 5 : Ajouter les clés dans le projet

### **A. Dans /landing/.env.local** (pour développement local)

Créez/éditez le fichier `landing/.env.local` :

```bash
# Stripe Keys (TEST MODE)
STRIPE_SECRET_KEY=sk_test_51... # Votre Secret Key
STRIPE_WEBHOOK_SECRET=whsec_... # Votre Webhook Secret
STRIPE_PRICE_ID=price_1QR2... # Votre Price ID

# Site URLs
NEXT_PUBLIC_SITE_URL=https://hippomind.org
NEXT_PUBLIC_CONTACT_EMAIL=support@hippomind.org

# Download URLs
NEXT_PUBLIC_DOWNLOAD_MAC=https://github.com/ClemiMoogli/HippoMind/releases/latest/download/HippoMind_1.0.0_aarch64.dmg
NEXT_PUBLIC_DOWNLOAD_WINDOWS=https://github.com/ClemiMoogli/HippoMind/releases/latest/download/HippoMind_1.0.0_x64-setup.exe
NEXT_PUBLIC_DOWNLOAD_LINUX=https://github.com/ClemiMoogli/HippoMind/releases/latest/download/HippoMind_1.0.0_amd64.AppImage
```

### **B. Sur Vercel** (pour production)

1. Allez sur : https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** → **Environment Variables**
4. Ajoutez ces variables (pour Production, Preview, Development) :

```
STRIPE_SECRET_KEY = sk_test_51...
STRIPE_WEBHOOK_SECRET = whsec_...
STRIPE_PRICE_ID = price_1QR2...
```

---

## 🧪 Étape 6 : Tester en local

1. **Lancez le serveur** :
```bash
cd landing
npm run dev
```

2. **Ouvrez** : http://localhost:3000

3. **Cliquez** sur "Get HippoMind Now" dans la section Pricing

4. **Vous devriez être redirigé** vers Stripe Checkout

5. **Utilisez une carte de test Stripe** :
```
Numéro : 4242 4242 4242 4242
Date : N'importe quelle date future
CVC : N'importe quel 3 chiffres
```

6. **Complétez le paiement**

7. **Vous devriez être redirigé** vers `/success` avec votre clé de licence !

---

## 🚀 Étape 7 : Déployer sur Vercel

```bash
git add -A
git commit -m "feat: Integrate Stripe payment system"
git push origin main
```

Vercel va automatiquement déployer avec les nouvelles variables d'environnement !

---

## 🎨 Étape 8 : Tester avec l'app HippoMind

1. **Achetez** via la landing page (mode test)
2. **Copiez** la clé de licence reçue
3. **Téléchargez et installez** HippoMind
4. **Lancez** l'app
5. **Entrez** la clé de licence
6. **Vérifiez** que la validation fonctionne ✅

---

## 📊 Avantages de cette solution Stripe

✅ **Prix TTC** : 19 EUR taxes incluses
✅ **Commission basse** : 2.9% + 0.25€ (vs 10% Gumroad)
✅ **Multi-devises** : EUR, USD, etc.
✅ **Branding** : 100% HippoMind, pas de mention Stripe
✅ **Contrôle total** : Génération de licences, emails, etc.
✅ **Base de données simple** : Fichier JSON (suffit pour des milliers de licences)

---

## 🔐 Sécurité

- ✅ Secret Key jamais exposée au client
- ✅ Webhook signature vérifiée
- ✅ Licences stockées côté serveur
- ✅ Limite d'activation (3 devices par défaut)

---

## 💰 Coûts

**Par vente à 19 EUR :**
- Commission Stripe : 2.9% = 0.55€
- Frais fixes : 0.25€
- **Vous recevez** : ~18.20€

**vs Gumroad :**
- Commission : 10% = 1.90€
- **Vous recevez** : ~16.55€
- **Différence** : +1.65€ par vente avec Stripe ! 💰

---

## 🆘 En cas de problème

### Erreur "Missing STRIPE_SECRET_KEY"
→ Vérifiez que `.env.local` existe et contient la clé

### Webhook ne fonctionne pas
→ En local, utilisez Stripe CLI : https://stripe.com/docs/stripe-cli

### Licence non générée
→ Vérifiez les logs du webhook dans Stripe Dashboard

---

## 📚 Prochaines étapes

Une fois que tout fonctionne en mode test :

1. **Activez le mode Live** dans Stripe
2. **Récupérez les clés Live** (pk_live_... et sk_live_...)
3. **Mettez à jour** les variables d'environnement sur Vercel
4. **Testez un vrai achat**
5. **Lancez** ! 🚀

---

**Besoin d'aide ?** Dites-moi où vous en êtes !
