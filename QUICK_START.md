# Guide de Reprise Rapide - HippoMind

## 🚀 Pour reprendre dans quelques jours

### Contexte actuel (28 oct 2025)

Vous avez travaillé sur le **système de paiement et de génération de licences** pour HippoMind.

**État actuel** : Le système fonctionne mais avec des limitations temporaires (pas de BDD persistante).

### Ce qui fonctionne ✅

- ✅ Paiement Stripe via checkout
- ✅ Redirection après paiement vers `/en/success`
- ✅ Génération de clés de licence déterministes (HIPPO-XXXX-XXXX-XXXX)
- ✅ Affichage de la clé sur la page success
- ✅ Support multilingue (EN/FR)
- ✅ Build réussi

### Ce qui ne fonctionne pas encore ❌

- ❌ Persistance des licences (pas de BDD)
- ❌ Envoi d'email avec la clé
- ❌ Webhook Stripe peut-être non configuré
- ❌ Variables d'environnement Vercel peut-être manquantes

## 📋 Checklist avant de commencer

### 1. Vérifier l'état du déploiement

```bash
# Vérifier si les derniers changements sont déployés
curl -I https://www.hippomind.org/en/success
# Devrait retourner 200 OK
```

### 2. Vérifier les variables Vercel

Se connecter sur https://vercel.com et vérifier que ces variables existent :
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

### 3. Vérifier le webhook Stripe

Aller sur https://dashboard.stripe.com/webhooks et vérifier qu'il existe un endpoint pour `https://hippomind.org/api/webhook/stripe`.

## 🔧 Prochaines étapes recommandées

### Étape 1 : Migrer vers une base de données (2-3h)

**Pourquoi** : Les licences ne sont pas sauvegardées actuellement.

**Recommandation** : Utiliser Vercel KV (Redis)

**Guide rapide** :
```bash
# 1. Créer une instance Vercel KV sur le dashboard
# 2. Connecter au projet landing

# 3. Installer le client
cd landing
npm install @vercel/kv

# 4. Modifier lib/db.ts
```

**Code exemple** : Voir section "Migration BDD" dans PAYMENT_SYSTEM_DOCS.md

### Étape 2 : Ajouter l'envoi d'email (1-2h)

**Pourquoi** : L'utilisateur perd sa clé s'il ferme la page.

**Recommandation** : Utiliser Resend

**Guide rapide** :
```bash
# 1. Créer compte sur resend.com
# 2. Obtenir API key

# 3. Installer
cd landing
npm install resend

# 4. Ajouter dans webhook/stripe/route.ts
```

### Étape 3 : Tester en production (30min)

1. Faire un vrai paiement de test
2. Vérifier la redirection
3. Vérifier l'affichage de la clé
4. Vérifier la réception de l'email (après étape 2)

## 🐛 Si vous rencontrez des problèmes

### Problème : 404 sur /success

**Solution** : Vérifier que le déploiement inclut bien :
- `localePrefix: 'always'` dans `i18n/routing.ts`
- URLs en `/en/success` dans `api/checkout/route.ts`

### Problème : Redirection vers /en/

**Cause probable** : Erreur dans la page success (BDD, Stripe, etc.)

**Debug** :
1. Ouvrir les logs Vercel
2. Chercher l'erreur exacte
3. La page devrait maintenant afficher une erreur détaillée au lieu de rediriger

### Problème : Build échoue

**Cause probable** : Variables d'environnement manquantes

**Solution** : Le build devrait maintenant fonctionner sans clés Stripe grâce au placeholder.

## 📁 Fichiers modifiés récemment

```
landing/
├── i18n/routing.ts                    # localePrefix: 'always'
├── middleware.ts                      # Matcher simplifié
├── app/
│   ├── api/
│   │   └── checkout/route.ts         # URLs en /en/success
│   └── [locale]/
│       └── success/page.tsx          # Meilleure gestion d'erreur
├── lib/
│   ├── license.ts                    # Hash déterministe
│   ├── db.ts                         # Skip sur Vercel
│   └── stripe.ts                     # Placeholder pour build
```

**⚠️ IMPORTANT** : Ces fichiers ont été modifiés mais **pas encore commités** !

## 💾 Commiter les changements

Avant de faire quoi que ce soit d'autre, commiter les changements :

```bash
cd /Users/clement/Dev/MindMap

# Vérifier les changements
git status

# Ajouter tous les changements du landing
git add landing/

# Créer le commit
git commit -m "Fix: Payment redirect and license generation system

- Change localePrefix to 'always' for consistent routing
- Fix success page redirect (was going to /en/ instead of showing license)
- Implement deterministic license key generation (SHA-256 hash of session_id)
- Skip file storage on Vercel (read-only filesystem)
- Improve error handling on success page (display instead of silent redirect)
- Allow build without Stripe keys (use placeholder)

Resolves issue where users got 404 or redirect after payment.
License keys are now generated consistently from session_id."

# Push
git push
```

## 📞 Ressources utiles

- **Documentation complète** : `PAYMENT_SYSTEM_DOCS.md`
- **Template email Gumroad** : `GUMROAD_EMAIL_TEMPLATE.md`
- **Logs Vercel** : https://vercel.com/dashboard (onglet Logs)
- **Dashboard Stripe** : https://dashboard.stripe.com/

## ⏱️ Estimation du temps restant

| Tâche | Temps estimé | Priorité |
|-------|--------------|----------|
| Migrer vers BDD (Vercel KV) | 2-3h | 🔴 HAUTE |
| Ajouter envoi email (Resend) | 1-2h | 🔴 HAUTE |
| Configurer webhook Stripe | 30min | 🔴 HAUTE |
| Vérifier variables Vercel | 15min | 🔴 HAUTE |
| Tests en production | 30min | 🔴 HAUTE |
| Dashboard admin | 4-6h | 🟡 MOYENNE |
| Système de récupération | 2-3h | 🟡 MOYENNE |
| Analytics | 1-2h | 🟢 BASSE |

**Total pour un système complet** : ~15-20h

**Total pour un MVP fonctionnel** : ~5-7h (uniquement priorité HAUTE)

## 🎯 Objectif immédiat suggéré

**Quand vous reprenez** :

1. ✅ Commiter les changements actuels (5min)
2. ✅ Déployer sur Vercel (automatique après push)
3. ✅ Tester avec l'URL de test que vous aviez (2min)
4. ✅ Si ça marche, passer à la BDD (2-3h)
5. ✅ Ajouter les emails (1-2h)
6. ✅ Test complet (30min)

**Après ça, vous aurez un système de paiement 100% fonctionnel !** 🎉

---

Bon courage pour la reprise ! 💪
