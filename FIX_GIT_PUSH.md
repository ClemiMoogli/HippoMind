# 🔧 Fix Git Push - Fichiers Trop Gros

## Problème

GitHub rejette le push car des fichiers de build (> 100 MB) sont dans l'historique Git :
- `src-tauri/target/debug/deps/libobjc2_app_kit-d4f5e5e6e8784dcc.rlib` (141 MB)
- Et d'autres fichiers dans `src-tauri/target/`

Ces fichiers ne devraient **jamais** être dans Git (ils sont déjà dans `.gitignore`).

## Solution 1 : Recommencer avec un Nouveau Commit (Simple)

Si vous venez juste de créer le repo et que ce premier commit n'a pas encore été pushé avec succès :

```bash
# 1. Annuler le dernier commit (garder les fichiers)
git reset --soft HEAD~1

# 2. Supprimer les fichiers de build
rm -rf src-tauri/target/
rm -rf node_modules/
rm -rf landing/node_modules/
rm -rf landing/.next/
rm -rf dist/
rm -rf dist-electron/

# 3. Recommiter (les fichiers dans .gitignore seront ignorés)
git add .
git commit -m "Initial commit - HippoMind app + landing page"

# 4. Push
git push -u origin main
```

## Solution 2 : Nettoyer l'Historique (Si déjà pushé ailleurs)

Si vous avez déjà partagé le repo avec d'autres personnes :

```bash
# Utiliser BFG Repo-Cleaner (plus simple que git-filter-branch)
brew install bfg

# Nettoyer les gros fichiers
bfg --delete-files "*.rlib"
bfg --delete-files "*.rmeta"
bfg --delete-folders "target"

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (attention, casse l'historique)
git push -f origin main
```

## Solution 3 : Repo Frais (Recommandé si Aucun Historique Important)

Le plus simple si c'est un nouveau repo :

```bash
# 1. Sauvegarder les changements récents
cp -r /Users/clement/Dev/MindMap /Users/clement/Dev/MindMap-backup

# 2. Supprimer le repo Git local
cd /Users/clement/Dev/MindMap
rm -rf .git

# 3. Nettoyer les fichiers de build
rm -rf src-tauri/target/
rm -rf node_modules/
rm -rf landing/node_modules/
rm -rf landing/.next/
rm -rf dist/
rm -rf dist-electron/
rm -rf packages/*/node_modules/
rm -rf packages/*/.next/

# 4. Recréer le repo propre
git init
git add .
git commit -m "Initial commit - HippoMind app + landing page"

# 5. Connecter à GitHub
git remote add origin https://github.com/ClemiMoogli/nodeflow.git
git branch -M main

# 6. Force push (écrase l'historique distant)
git push -f origin main
```

## Vérifier Avant de Pusher

```bash
# Vérifier la taille du commit
git count-objects -vH

# Lister les gros fichiers
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -n 20

# Vérifier que target/ n'est pas tracké
git ls-files | grep target
# → Doit être vide !
```

## Après le Fix

Une fois que le push réussit :

```bash
# 1. Vérifier sur GitHub
open https://github.com/ClemiMoogli/nodeflow

# 2. Vérifier la taille du repo
# Settings → (en bas) → Repository size should be < 100 MB

# 3. Continuer avec les GitHub Releases
# Voir DOWNLOAD_SETUP.md
```

## Pour Éviter à l'Avenir

Votre `.gitignore` est déjà correct :

```
src-tauri/target/
node_modules/
dist/
dist-electron/
.next/
```

Mais **avant chaque commit**, vérifiez :

```bash
# Voir ce qui va être commité
git status

# Si vous voyez "target/" ou "node_modules/", ne commitez PAS !
# Vérifiez votre .gitignore
```

## Ma Recommandation

Utilisez **Solution 3** (Repo Frais) car :
- ✅ Le plus simple et rapide
- ✅ Historique propre dès le départ
- ✅ Pas de gros fichiers cachés dans l'historique
- ✅ Le repo fera ~10-20 MB au lieu de 600+ MB

**Temps estimé** : 5 minutes

---

## Commandes à Copier-Coller (Solution 3)

```bash
cd /Users/clement/Dev/MindMap

# Nettoyer
rm -rf .git
rm -rf src-tauri/target/
rm -rf node_modules/
rm -rf landing/node_modules/
rm -rf landing/.next/
rm -rf dist/
rm -rf dist-electron/
rm -rf packages/*/node_modules/

# Recréer
git init
git add .
git commit -m "Initial commit - HippoMind app + landing page"
git remote add origin https://github.com/ClemiMoogli/nodeflow.git
git branch -M main
git push -f origin main
```

Ça va marcher ! 🎉
