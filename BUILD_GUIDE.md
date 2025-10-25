# 🏗️ Guide de Build - HippoMind

## Vue d'ensemble

Sur **Mac**, vous ne pouvez compiler que pour **macOS**. Pour Windows et Linux, vous avez 2 options :
1. **GitHub Actions** (automatique, gratuit) ← **Recommandé**
2. Machine virtuelle / Cloud

---

## Option 1 : Build Local macOS Uniquement (Simple)

### Build macOS

```bash
cd /Users/clement/Dev/MindMap

# Build pour macOS (Universal: Intel + Apple Silicon)
npm run dist:mac
```

**Résultat** :
- `dist-electron/HippoMind-1.0.0.dmg` (~100-200 MB)
- Compatible Apple Silicon (M1/M2/M3) ET Intel

### Créer la GitHub Release

1. Aller sur https://github.com/ClemiMoogli/nodeflow/releases
2. Cliquer "Draft a new release"
3. Tag : `v1.0.0`
4. Title : `HippoMind 1.0.0`
5. Description :
   ```markdown
   ## 🎉 HippoMind v1.0.0 - First Release

   ### ✨ Features
   - 100% Offline mind mapping
   - Support jusqu'à 2000 nodes
   - 4 thèmes (Light, Dark, Sepia, Slate)
   - Autosave toutes les 30 secondes
   - Undo/Redo illimité
   - FR/EN interface

   ### 📥 Downloads
   - **macOS** : HippoMind-1.0.0.dmg (Universal - Intel + Apple Silicon)
   - **Windows** : Coming soon
   - **Linux** : Coming soon

   ### 💻 macOS Installation
   1. Télécharger le DMG
   2. Double-cliquer sur le fichier
   3. Glisser HippoMind vers Applications
   4. Lancer depuis le Launchpad
   ```

6. **Attacher le DMG** : Glisser `dist-electron/HippoMind-1.0.0.dmg`
7. Publish release

**Avantages** :
- ✅ Rapide (5 minutes)
- ✅ Pas de configuration complexe
- ✅ Utilisateurs Mac peuvent télécharger immédiatement

**Inconvénients** :
- ❌ Windows et Linux doivent attendre

---

## Option 2 : GitHub Actions (Automatique pour Tout) ⭐

**C'est la meilleure option !** GitHub compile automatiquement sur macOS, Windows ET Linux.

### Configuration

J'ai déjà créé le fichier `.github/workflows/release.yml` pour vous ! Il est prêt à utiliser.

### Comment l'utiliser

```bash
cd /Users/clement/Dev/MindMap

# 1. Commit le workflow
git add .github/workflows/release.yml
git commit -m "Add automated release workflow"
git push

# 2. Créer un tag de version
git tag v1.0.0

# 3. Pusher le tag (déclenche automatiquement le workflow)
git push --tags
```

**Ce qui se passe automatiquement** :

1. ✅ GitHub Actions démarre 3 jobs en parallèle :
   - macOS-latest → Compile le DMG
   - Windows-latest → Compile l'exe
   - Ubuntu-latest → Compile AppImage + deb

2. ✅ Chaque job :
   - Installe Node.js
   - Installe Rust (pour Tauri)
   - Installe les dépendances
   - Build l'app
   - Upload les artifacts

3. ✅ Crée automatiquement une GitHub Release avec les 3 fichiers

**Temps total** : ~15-20 minutes (tout automatique)

### Vérifier le Workflow

1. Aller sur https://github.com/ClemiMoogli/nodeflow/actions
2. Vous verrez "Release" en cours d'exécution
3. Attendre que les 3 jobs soient ✅ verts
4. Aller dans Releases → v1.0.0 sera créée avec les 3 fichiers

### Avantages

- ✅ Gratuit (GitHub Actions gratuit pour repos publics)
- ✅ Automatique
- ✅ Toutes les plateformes
- ✅ Reproductible (même environnement à chaque fois)
- ✅ Pas besoin de VMs locales

---

## Option 3 : Machines Virtuelles (Avancé)

Si vous voulez compiler localement pour Windows/Linux :

### Pour Windows

1. **Installer Windows** :
   - Parallels Desktop (payant, ~80€)
   - UTM (gratuit, mais moins performant)
   - Boot Camp (gratuit, mais redémarrage nécessaire)

2. **Sur Windows** :
   ```bash
   # Installer Node.js, Rust, dependencies
   npm install
   npm run dist:win
   ```

### Pour Linux

1. **Installer Ubuntu** :
   - UTM (gratuit)
   - VirtualBox (gratuit)
   - Docker (plus complexe)

2. **Sur Ubuntu** :
   ```bash
   sudo apt-get update
   sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev
   npm install
   npm run dist:linux
   ```

**Inconvénients** :
- ❌ Long à setup
- ❌ Prend beaucoup d'espace disque
- ❌ Pas automatique

---

## Recommandation

### Pour votre Premier Release

**Utilisez GitHub Actions (Option 2)** :

```bash
# 1. Commit le workflow
git add .github/workflows/release.yml
git commit -m "Add CI/CD workflow for releases"
git push

# 2. Créer la release
git tag v1.0.0
git push --tags

# 3. Attendre 15 minutes
# 4. Vérifier https://github.com/ClemiMoogli/nodeflow/releases

# 5. Les 3 fichiers seront là :
# - HippoMind-1.0.0.dmg
# - HippoMind-1.0.0.exe
# - HippoMind-1.0.0.AppImage
```

### Workflow Habituel

Quand vous voulez sortir une nouvelle version :

```bash
# 1. Faire vos changements
git add .
git commit -m "feat: nouvelle fonctionnalité X"

# 2. Mettre à jour la version dans package.json
npm version patch  # 1.0.0 → 1.0.1
# ou
npm version minor  # 1.0.0 → 1.1.0
# ou
npm version major  # 1.0.0 → 2.0.0

# 3. Push avec le tag
git push --follow-tags

# 4. GitHub Actions compile automatiquement
# 5. Release créée automatiquement
```

---

## Tester Localement Avant Release

Avant de créer une release publique, testez le build :

```bash
# Build macOS
npm run dist:mac

# Installer le DMG localement
open dist-electron/HippoMind-1.0.0.dmg

# Tester l'app
# - Lancer
# - Créer une mindmap
# - Tester toutes les features
# - Vérifier que tout fonctionne

# Si OK → Créer la release GitHub
```

---

## URLs de Téléchargement

Une fois la release créée, les URLs seront :

```
https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.dmg
https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.exe
https://github.com/ClemiMoogli/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.AppImage
```

Ou pour toujours pointer vers la dernière version :

```
https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-macOS.dmg
https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-Windows.exe
https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-Linux.AppImage
```

⚠️ **Attention** : Pour `/latest/`, les noms de fichiers doivent être **constants** (pas de version dans le nom).

---

## Mettre à Jour la Landing Page

Une fois la release créée, mettez à jour `landing/components/Downloads.tsx` :

```tsx
// Ligne ~84-120
href={
  platform.name === 'mac'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-macOS.dmg'
    : platform.name === 'windows'
    ? 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-Windows.exe'
    : 'https://github.com/ClemiMoogli/nodeflow/releases/latest/download/HippoMind-Linux.AppImage'
}
```

---

## Checklist Avant Release

- [ ] Code testé localement
- [ ] Version bumped dans `package.json`
- [ ] CHANGELOG.md mis à jour (optionnel)
- [ ] Build local testé sur Mac
- [ ] Workflow GitHub Actions configuré
- [ ] Tag créé et pushé
- [ ] Release créée sur GitHub
- [ ] Builds téléchargés et testés
- [ ] Landing page mise à jour avec les liens
- [ ] Annonce faite (Twitter, ProductHunt, etc.)

---

## Résumé Rapide

**Vous êtes sur Mac → Utilisez GitHub Actions**

1. ✅ Commit `.github/workflows/release.yml`
2. ✅ `git tag v1.0.0 && git push --tags`
3. ✅ Attendre 15 min
4. ✅ 3 builds créés automatiquement (macOS + Windows + Linux)
5. ✅ Mettre à jour la landing page avec les liens

**Temps total** : 20 minutes (dont 15 minutes d'attente automatique)

C'est la méthode utilisée par 99% des apps open-source ! 🚀
