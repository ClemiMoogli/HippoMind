# 📚 HippoMind - Index de Documentation

## Bienvenue !

Cette documentation couvre tout le **système de paiement et de licences** pour HippoMind.

**Dernière mise à jour** : 28 octobre 2025

---

## 🚀 Par où commencer ?

### Si vous reprenez après une pause

👉 **[QUICK_START.md](./QUICK_START.md)** - Guide de reprise rapide (5 min de lecture)

Ce guide vous indique :
- ✅ Ce qui fonctionne actuellement
- ❌ Ce qui reste à faire
- 🎯 Les prochaines étapes recommandées
- 📋 Checklist de vérification

### Si vous voulez comprendre le système en détail

👉 **[PAYMENT_SYSTEM_DOCS.md](./PAYMENT_SYSTEM_DOCS.md)** - Documentation complète

Ce guide couvre :
- Architecture du projet
- Flux de paiement complet
- Système de génération de licences
- Configuration i18n
- Problèmes résolus et en cours
- Variables d'environnement
- Liste complète des TODOs

---

## 🔧 Guides de mise en œuvre

### 1. Migrer vers une base de données

👉 **[DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)**

**Temps estimé** : 30-45 minutes
**Difficulté** : ⭐⭐☆☆☆ Facile

Ce guide vous montre comment :
- Créer une instance Vercel KV (Redis)
- Remplacer le système de fichiers par Redis
- Tester la migration
- Structure des données recommandée

**Pourquoi le faire ?**
- ❌ Actuellement, les licences ne sont pas sauvegardées
- ✅ Avec Redis, vous aurez une vraie persistance

### 2. Configurer l'envoi d'emails automatique

👉 **[EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md)**

**Temps estimé** : 45-60 minutes
**Difficulté** : ⭐⭐⭐☆☆ Moyen

Ce guide vous montre comment :
- Créer un compte Resend
- Configurer votre domaine (DNS)
- Créer le template d'email
- Intégrer dans le webhook Stripe
- Tester en production

**Pourquoi le faire ?**
- ❌ Actuellement, l'utilisateur perd sa clé s'il ferme la page
- ✅ Avec les emails, backup automatique de la licence

---

## 📊 État du projet

### ✅ Ce qui fonctionne

| Fonctionnalité | État | Fichier principal |
|----------------|------|-------------------|
| Paiement Stripe | ✅ OK | `landing/app/api/checkout/route.ts` |
| Redirection après paiement | ✅ OK | Config i18n + middleware |
| Génération de clés déterministes | ✅ OK | `landing/lib/license.ts` |
| Affichage de la clé | ✅ OK | `landing/app/[locale]/success/page.tsx` |
| Support EN/FR | ✅ OK | `landing/i18n/` |
| Build production | ✅ OK | - |

### ⚠️ Limitations actuelles

| Problème | Impact | Solution |
|----------|--------|----------|
| Pas de BDD | Licences non sauvegardées | → DATABASE_MIGRATION_GUIDE.md |
| Pas d'emails | Utilisateur perd sa clé | → EMAIL_SETUP_GUIDE.md |
| Webhook non configuré ? | Événements Stripe perdus | → Configurer sur dashboard Stripe |
| Variables Vercel manquantes ? | Système ne fonctionne pas | → Vérifier dans settings Vercel |

### 🎯 Prochaines priorités

1. **🔴 HAUTE** : Migrer vers Vercel KV (30-45 min)
2. **🔴 HAUTE** : Ajouter envoi d'emails (45-60 min)
3. **🔴 HAUTE** : Configurer webhook Stripe (15 min)
4. **🔴 HAUTE** : Vérifier variables Vercel (10 min)
5. **🟡 MOYENNE** : Dashboard admin (4-6h)
6. **🟡 MOYENNE** : Système de récupération de licence (2-3h)

---

## 📁 Structure du projet

```
MindMap/
├── DOCUMENTATION_INDEX.md          ← Vous êtes ici
├── QUICK_START.md                  ← Guide de reprise rapide
├── PAYMENT_SYSTEM_DOCS.md          ← Documentation complète
├── DATABASE_MIGRATION_GUIDE.md     ← Guide migration BDD
├── EMAIL_SETUP_GUIDE.md            ← Guide envoi emails
├── GUMROAD_EMAIL_TEMPLATE.md       ← Template email Gumroad
│
├── landing/                         ← Site web Next.js
│   ├── app/
│   │   ├── [locale]/               ← Pages internationalisées
│   │   │   ├── page.tsx            ← Landing page
│   │   │   ├── success/            ← Page après paiement
│   │   │   └── layout.tsx
│   │   └── api/
│   │       ├── checkout/           ← Création session Stripe
│   │       ├── webhook/stripe/     ← Réception événements
│   │       └── verify-license/     ← Vérification licences
│   ├── lib/
│   │   ├── stripe.ts               ← Config Stripe
│   │   ├── license.ts              ← Génération licences
│   │   └── db.ts                   ← Stockage (à migrer)
│   └── middleware.ts               ← i18n next-intl
│
└── packages/                        ← App Electron
    ├── main/
    ├── renderer/
    └── shared/
```

---

## 🔗 Liens utiles

### Dashboards et outils

- **Vercel** : https://vercel.com/dashboard
- **Stripe Dashboard** : https://dashboard.stripe.com/
- **Stripe Webhooks** : https://dashboard.stripe.com/webhooks
- **Site web** : https://hippomind.org
- **GitHub** : https://github.com/ClemiMoogli/HippoMind

### Documentation externe

- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js App Router](https://nextjs.org/docs/app)
- [next-intl](https://next-intl-docs.vercel.app/)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Resend](https://resend.com/docs)

---

## 🛠️ Commandes rapides

```bash
# Démarrer le dev local
cd landing
npm run dev

# Build production
npm run build

# Vérifier les types
npm run typecheck

# Télécharger les variables d'environnement Vercel
npx vercel env pull .env.local

# Tester le webhook Stripe en local
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

---

## 💡 Conseils

### Pour reprendre efficacement

1. ✅ Lire [QUICK_START.md](./QUICK_START.md) (5 min)
2. ✅ Vérifier l'état du déploiement Vercel
3. ✅ Tester avec l'URL de session de test
4. ✅ Commiter les changements actuels si pas encore fait
5. ✅ Choisir la prochaine tâche (BDD ou emails)

### Pour déboguer

- **404 sur /success** : Vérifier le middleware et routing
- **Redirection vers /en/** : Vérifier les logs Vercel pour l'erreur exacte
- **Clé différente à chaque fois** : Vérifier que le hash déterministe est utilisé
- **Build échoue** : Vérifier que le placeholder Stripe est en place

### Pour tester

**Test rapide en production** :
```bash
curl -I https://www.hippomind.org/en/success
# Doit retourner 200 OK
```

**Test avec session Stripe** :
```
https://www.hippomind.org/en/success?session_id=cs_test_b1CZsYWEFZSkOh3TBFKtYexSpf1n9il13pwvX4n1LogY7kK26Xevco0zmh
```

---

## 📝 Fichiers modifiés récemment (non commités)

Ces fichiers ont été modifiés le 28 octobre 2025 :

- `landing/i18n/routing.ts` - localePrefix: 'always'
- `landing/middleware.ts` - Matcher simplifié
- `landing/app/api/checkout/route.ts` - URLs en /en/success
- `landing/app/[locale]/success/page.tsx` - Gestion d'erreur améliorée
- `landing/lib/license.ts` - Hash déterministe
- `landing/lib/db.ts` - Skip sur Vercel
- `landing/lib/stripe.ts` - Placeholder pour build

**⚠️ IMPORTANT** : N'oubliez pas de commiter ces changements !

```bash
git add landing/
git commit -m "Fix: Payment redirect and license generation system"
git push
```

---

## 📞 Support

**Email** : support@hippomind.org
**Développeur** : Clement

---

## 🗺️ Roadmap suggérée

### Phase 1 : Système fonctionnel (1 semaine)
- [x] Paiement Stripe
- [x] Génération de licences
- [x] Page success
- [ ] Base de données (30-45 min)
- [ ] Emails automatiques (45-60 min)
- [ ] Tests complets (1-2h)

### Phase 2 : Amélioration UX (1 semaine)
- [ ] Dashboard admin
- [ ] Récupération de licence par email
- [ ] Analytics
- [ ] Page FAQ
- [ ] Documentation utilisateur

### Phase 3 : Scaling (quand nécessaire)
- [ ] Coupon codes
- [ ] Pricing tiers (différents plans)
- [ ] Système d'affiliation
- [ ] Support multidevise avancé

---

**Dernière mise à jour** : 28 octobre 2025
**Version documentation** : 1.0
**Status système** : ⚠️ Fonctionnel mais nécessite BDD et emails

Bon courage pour la reprise ! 🚀
