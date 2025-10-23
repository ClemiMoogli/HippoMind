# 🛠️ Landing Page - Commandes Utiles

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Ou avec pnpm (plus rapide)
pnpm install
```

## 🏃 Développement

```bash
# Lancer le serveur de développement
npm run dev

# Sur un port différent
npm run dev -- -p 3001

# Avec Turbopack (expérimental, plus rapide)
npm run dev --turbo
```

**URLs:**
- Anglais : http://localhost:3000
- Français : http://localhost:3000/fr

## 🏗️ Build & Production

```bash
# Build de production
npm run build

# Lancer en mode production (après build)
npm run start

# Build + Start en une commande
npm run build && npm run start
```

## 🧹 Linting & Formatting

```bash
# Linter (ESLint)
npm run lint

# Fix automatiquement
npm run lint -- --fix

# Type checking (TypeScript)
npm run type-check

# Format code (Prettier) - à ajouter
npm run format

# Vérifier formatting
npm run format:check
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installation Vercel CLI
npm i -g vercel

# Premier déploiement
vercel

# Déploiement production
vercel --prod

# Preview deployment
vercel
```

### Build pour autre hébergeur

```bash
# Build statique (nécessite de retirer middleware)
npm run build

# Le dossier .next/ contient le build
```

## 🧪 Tests (à configurer)

```bash
# Tests unitaires (à setup)
npm run test

# Tests E2E avec Playwright (à setup)
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Analyse & Optimisation

```bash
# Analyser la taille du bundle
npm run build
npx @next/bundle-analyzer

# Lighthouse CI
npx lighthouse http://localhost:3000 --view

# Check performance
npm run build && npm run start
# Puis Lighthouse dans DevTools
```

## 🌐 i18n

```bash
# Extraire les clés de traduction manquantes (à configurer)
# npm run i18n:extract

# Valider les traductions
# npm run i18n:validate
```

## 🧰 Utilitaires

```bash
# Nettoyer node_modules et cache
rm -rf node_modules .next
npm install

# Nettoyer cache Next.js
rm -rf .next

# Mettre à jour les dépendances
npm update

# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour vers latest
npx npm-check-updates -u
npm install

# Audit de sécurité
npm audit

# Fix vulnérabilités
npm audit fix
```

## 📝 Génération de fichiers

```bash
# Créer un nouveau composant
mkdir components/MyComponent
touch components/MyComponent/index.tsx

# Créer une nouvelle page
touch app/[locale]/my-page/page.tsx

# Créer un nouveau message i18n
# Éditer messages/en.json et messages/fr.json
```

## 🔍 Debug

```bash
# Mode debug Next.js
NODE_OPTIONS='--inspect' npm run dev

# Verbose logging
DEBUG=* npm run dev

# Afficher config Next.js
npx next info
```

## 📦 Package Management

```bash
# Installer une dépendance
npm install package-name

# Installer en dev
npm install -D package-name

# Désinstaller
npm uninstall package-name

# Lister dépendances
npm list --depth=0

# Vérifier taille des packages
npx bundle-phobia package-name
```

## 🎨 Tailwind

```bash
# Générer fichier de config complet
npx tailwindcss init --full

# Watch et compile CSS (normalement automatique)
npx tailwindcss -i ./app/globals.css -o ./output.css --watch
```

## 🔧 Git

```bash
# Ajouter les fichiers du landing
git add landing/

# Commit
git commit -m "feat: add landing page"

# Push
git push origin main

# Créer une branche pour développement
git checkout -b landing/improvements
```

## 🌍 Environnement

```bash
# Copier l'exemple
cp .env.example .env.local

# Éditer les variables
nano .env.local

# Les variables NEXT_PUBLIC_* sont exposées au client
# Les autres sont server-side only
```

## 📊 Monitoring

```bash
# Check build size
npm run build
# Regarder .next/analyze/client.html

# Performance monitoring
npm run build && npm run start
# Utiliser Lighthouse ou WebPageTest
```

## 🚨 Troubleshooting

```bash
# Erreur port déjà utilisé
lsof -ti:3000 | xargs kill -9

# Reset complet
rm -rf node_modules .next package-lock.json
npm install

# Vérifier version Node.js
node -v  # Doit être >= 18.x

# Clear cache npm
npm cache clean --force
```

## 📚 Documentation

```bash
# Ouvrir docs Next.js
open https://nextjs.org/docs

# Ouvrir docs Tailwind
open https://tailwindcss.com/docs

# Ouvrir docs Framer Motion
open https://www.framer.com/motion/

# Ouvrir docs next-intl
open https://next-intl-docs.vercel.app/
```

## 🎯 Raccourcis Recommandés

Ajouter dans votre `package.json` :

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "rm -rf .next node_modules",
    "fresh": "npm run clean && npm install",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

## 🔗 Liens Rapides

- **Local Dev** : http://localhost:3000
- **Vercel Dashboard** : https://vercel.com/dashboard
- **Next.js Docs** : https://nextjs.org/docs
- **Tailwind Docs** : https://tailwindcss.com/docs
- **Framer Motion** : https://www.framer.com/motion

---

💡 **Astuce** : Ajoutez ces commandes à vos alias shell :

```bash
# Dans ~/.zshrc ou ~/.bashrc
alias ldev="cd /path/to/landing && npm run dev"
alias lbuild="cd /path/to/landing && npm run build"
alias ldeploy="cd /path/to/landing && vercel --prod"
```
