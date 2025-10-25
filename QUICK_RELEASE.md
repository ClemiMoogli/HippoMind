# 🚀 Quick Release Guide - HippoMind

## Ce Dont Vous Avez Besoin (Checklist)

- [x] Git push réussi (fix fait ✅)
- [x] Landing page fonctionnelle (http://localhost:3000 ✅)
- [x] GitHub Actions workflow créé (`.github/workflows/release.yml` ✅)
- [ ] Première release créée
- [ ] Landing page mise à jour avec vrais liens de téléchargement

---

## 🎯 Étapes pour Créer Votre Première Release

### 1️⃣ Commit le Workflow GitHub Actions (1 minute)

```bash
cd /Users/clement/Dev/MindMap

git add .github/workflows/release.yml
git commit -m "Add automated release workflow"
git push
```

### 2️⃣ Créer et Pusher un Tag (30 secondes)

```bash
# Créer le tag v1.0.0
git tag v1.0.0

# Pusher le tag (déclenche automatiquement GitHub Actions)
git push --tags
```

### 3️⃣ Attendre que GitHub Actions Compile (15 minutes)

1. Aller sur https://github.com/ClemiMoogli/nodeflow/actions
2. Vous verrez "Release" avec 3 jobs en cours :
   - 🍎 macos-latest
   - 🪟 windows-latest
   - 🐧 ubuntu-latest

3. **Attendre que les 3 deviennent verts ✅**

Pendant ce temps, allez prendre un café ☕

### 4️⃣ Vérifier la Release (1 minute)

1. Aller sur https://github.com/ClemiMoogli/nodeflow/releases
2. Vous verrez "v1.0.0" avec 3 fichiers :
   - ✅ HippoMind-1.0.0.dmg (~100-200 MB)
   - ✅ HippoMind-1.0.0.exe (~50-100 MB)
   - ✅ HippoMind-1.0.0.AppImage (~100-150 MB)

### 5️⃣ Télécharger et Tester le DMG (5 minutes)

```bash
# Télécharger depuis GitHub
open https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.dmg

# Installer localement
# Double-cliquer sur le DMG
# Glisser vers Applications
# Lancer l'app

# Tester :
# - Créer une mindmap
# - Ajouter des nodes
# - Tester undo/redo
# - Changer de thème
# - Fermer et rouvrir (autosave)
```

### 6️⃣ Mettre à Jour la Landing Page (2 minutes)

Éditer `landing/components/Downloads.tsx` :

```tsx
// Ligne ~84-120, remplacer les href="#download-mac" par :

href={
  platform.name === 'mac'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.dmg'
    : platform.name === 'windows'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.exe'
    : 'https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.AppImage'
}
```

Ou mieux, utilisez `/latest/` pour toujours pointer vers la dernière version :

```tsx
href={
  platform.name === 'mac'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-1.0.0.dmg'
    : platform.name === 'windows'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-1.0.0.exe'
    : 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-1.0.0.AppImage'
}
```

Commit et push :

```bash
cd landing
git add components/Downloads.tsx
git commit -m "Update download links to v1.0.0"
git push
```

### 7️⃣ Déployer la Landing Page (1 minute)

Si vous n'avez pas encore déployé sur Vercel :

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd /Users/clement/Dev/MindMap/landing
vercel

# Suivre les instructions
# → Votre landing sera live sur https://nodeflow.vercel.app
```

Ou connecter votre repo GitHub à Vercel (auto-deploy à chaque push) :
1. Aller sur https://vercel.com
2. "Add New Project"
3. Importer "ClemiMoogli/nodeflow"
4. Root Directory : `landing`
5. Deploy

---

## ✅ Résultat Final

Après ces étapes, vous aurez :

✅ **App desktop disponible** :
- https://github.com/ClemiMoogli/nodeflow/releases

✅ **Landing page live** :
- https://nodeflow.vercel.app (ou votre domaine)

✅ **Boutons de téléchargement fonctionnels** :
- Cliquer sur "Download" → Télécharge le DMG/exe/AppImage

---

## 🔄 Pour les Prochaines Versions

Quand vous voulez sortir v1.0.1, v1.1.0, etc. :

```bash
cd /Users/clement/Dev/MindMap

# 1. Faire vos changements
git add .
git commit -m "feat: nouvelle fonctionnalité X"

# 2. Bump la version
npm version patch  # 1.0.0 → 1.0.1

# 3. Push avec tags
git push --follow-tags

# 4. GitHub Actions compile automatiquement
# 5. Nouvelle release créée automatiquement
# 6. Si vous utilisez /latest/, les liens se mettent à jour automatiquement
```

---

## ⏱️ Temps Total Estimé

- ✅ Commit workflow : 1 min
- ✅ Créer tag : 30 sec
- ⏳ GitHub Actions compile : 15 min (automatique)
- ✅ Tester le build : 5 min
- ✅ Mettre à jour landing : 2 min
- ✅ Déployer landing : 1 min

**Total : ~25 minutes** (dont 15 min d'attente)

---

## 🎉 Vous Êtes Prêt !

Lancez la première commande :

```bash
cd /Users/clement/Dev/MindMap
git add .github/workflows/release.yml
git commit -m "Add automated release workflow"
git push
git tag v1.0.0
git push --tags
```

Puis attendez 15 minutes et vérifiez https://github.com/ClemiMoogli/nodeflow/releases ! 🚀

---

## 📚 Documentation de Référence

- **BUILD_GUIDE.md** - Détails complets sur les builds
- **DOWNLOAD_SETUP.md** - Options d'hébergement
- **PAYMENT_SETUP.md** - Système de paiement
- **landing/LANDING_GUIDE.md** - Guide de la landing page

Bon lancement ! 🎊
