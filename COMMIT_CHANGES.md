# 📝 Guide de Commit des Changements

## Changements actuels non commités

Les fichiers suivants ont été modifiés et doivent être commités :

### Code modifié
- ✅ `landing/lib/license.ts` - Génération déterministe des clés
- ✅ `landing/lib/db.ts` - Skip stockage fichier sur Vercel
- ✅ `landing/lib/stripe.ts` - Placeholder pour build
- ✅ `landing/app/[locale]/success/page.tsx` - Meilleure gestion d'erreur

### Documentation créée
- 📚 `PAYMENT_SYSTEM_DOCS.md` - Documentation complète du système
- 🚀 `QUICK_START.md` - Guide de reprise rapide
- 🗄️ `DATABASE_MIGRATION_GUIDE.md` - Guide migration vers Vercel KV
- 📧 `EMAIL_SETUP_GUIDE.md` - Guide configuration emails
- 📚 `DOCUMENTATION_INDEX.md` - Index de toute la documentation
- 📝 `COMMIT_CHANGES.md` - Ce fichier

## Commande pour commiter

```bash
# Se placer à la racine du projet
cd /Users/clement/Dev/MindMap

# Vérifier les changements
git status

# Ajouter tous les changements
git add landing/lib/license.ts \
        landing/lib/db.ts \
        landing/lib/stripe.ts \
        landing/app/[locale]/success/page.tsx \
        PAYMENT_SYSTEM_DOCS.md \
        QUICK_START.md \
        DATABASE_MIGRATION_GUIDE.md \
        EMAIL_SETUP_GUIDE.md \
        DOCUMENTATION_INDEX.md \
        COMMIT_CHANGES.md

# Ou plus simplement (ajoute tout)
git add .

# Créer le commit
git commit -m "Fix: Improve license generation and error handling

Core changes:
- Implement deterministic license key generation using SHA-256 hash
- Skip file storage on Vercel (read-only filesystem issue)
- Add placeholder Stripe key to allow builds without credentials
- Improve error page on /success (display errors instead of silent redirect)

Documentation:
- Add complete payment system documentation
- Add quick start guide for resuming work
- Add database migration guide (Vercel KV)
- Add email setup guide (Resend)
- Add documentation index

This fixes the issue where:
- License keys were different on each page reload
- System crashed when trying to write to filesystem on Vercel
- Builds failed without Stripe credentials
- Users got redirected to /en/ instead of seeing their license

Next steps:
- Migrate to Vercel KV for persistence
- Setup Resend for automatic emails
- Configure Stripe webhook on dashboard"

# Vérifier le commit
git log -1 --stat

# Pousser vers GitHub
git push origin main
```

## Vérification avant de pousser

### ✅ Checklist

Avant de faire `git push`, vérifiez :

- [ ] Le build fonctionne : `cd landing && npm run build`
- [ ] Les types sont corrects : `cd landing && npm run typecheck`
- [ ] Les fichiers de documentation sont lisibles
- [ ] Pas de secrets/clés API dans les fichiers commités
- [ ] Les liens dans la documentation sont valides

### Test rapide du build

```bash
cd landing
npm run build
```

Si le build réussit ✅, vous pouvez pusher en toute sécurité.

## Après le push

### Déploiement automatique

Vercel va automatiquement :
1. Détecter le nouveau commit
2. Lancer un build
3. Déployer sur https://hippomind.org (si le build réussit)

**Durée** : ~2-3 minutes

### Vérifier le déploiement

1. Aller sur https://vercel.com/dashboard
2. Voir l'onglet "Deployments"
3. Cliquer sur le déploiement en cours
4. Vérifier les logs

### Tester en production

Une fois déployé :

```bash
# Tester la route success
curl -I https://www.hippomind.org/en/success
# Devrait retourner 200 OK

# Tester avec une vraie session (celle de vos tests)
# Ouvrir dans le navigateur :
# https://www.hippomind.org/en/success?session_id=cs_test_b1CZsYWEFZSkOh3TBFKtYexSpf1n9il13pwvX4n1LogY7kK26Xevco0zmh
```

## Résumé des changements

### Ce qui a été corrigé

1. **Génération de clés déterministe** ✅
   - Avant : Clé aléatoire à chaque fois (nanoid)
   - Après : Hash SHA-256 du session_id (toujours la même)

2. **Problème de filesystem Vercel** ✅
   - Avant : Crash en essayant d'écrire dans data/licenses.json
   - Après : Skip le stockage si on est sur Vercel

3. **Build sans Stripe keys** ✅
   - Avant : Erreur "Missing STRIPE_SECRET_KEY"
   - Après : Placeholder permet le build

4. **Gestion d'erreur** ✅
   - Avant : Redirection silencieuse vers /en/
   - Après : Affichage de l'erreur avec détails

### Ce qui reste à faire

Voir [QUICK_START.md](./QUICK_START.md) pour la liste complète, mais en résumé :

1. **🔴 HAUTE** - Migrer vers Vercel KV (30-45 min)
2. **🔴 HAUTE** - Setup Resend pour les emails (45-60 min)
3. **🔴 HAUTE** - Configurer webhook Stripe (15 min)

## Notes importantes

### Variables d'environnement Vercel

Assurez-vous que ces variables sont configurées sur Vercel :

```env
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_...)
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=https://hippomind.org
NEXT_PUBLIC_DOWNLOAD_MAC=https://...
NEXT_PUBLIC_DOWNLOAD_WINDOWS=https://...
NEXT_PUBLIC_DOWNLOAD_LINUX=https://...
```

### Secrets à NE JAMAIS commiter

- ❌ Clés Stripe (STRIPE_SECRET_KEY)
- ❌ Secrets webhook (STRIPE_WEBHOOK_SECRET)
- ❌ Clés API (RESEND_API_KEY)
- ❌ Tokens Vercel

Les fichiers `.env.local` sont déjà dans `.gitignore`, donc aucun risque.

## En cas de problème après le push

### Si le build échoue sur Vercel

1. Vérifier les logs de build sur Vercel
2. Vérifier que toutes les dépendances sont installées
3. Vérifier les variables d'environnement

### Si le site est down

```bash
# Rollback vers le commit précédent
git revert HEAD
git push origin main
```

### Si vous avez oublié des fichiers

```bash
# Ajouter les fichiers manquants
git add <fichier>

# Amender le dernier commit
git commit --amend --no-edit

# Force push (seulement si vous êtes seul sur le projet !)
git push --force origin main
```

---

## Commande tout-en-un

Si vous voulez juste tout commiter rapidement :

```bash
cd /Users/clement/Dev/MindMap && \
git add . && \
git commit -m "Fix: License generation and docs" && \
git push origin main
```

**⚠️ Attention** : Cette commande ajoute TOUS les fichiers modifiés. Vérifiez `git status` avant !

---

**Prêt à commiter ?** Copiez-collez les commandes ci-dessus ! 🚀
