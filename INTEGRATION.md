# 🔗 Intégration Landing Page ↔️ App Desktop

## Vue d'ensemble

Votre projet MindMap contient maintenant **2 parties indépendantes** :

```
/MindMap
├── packages/              # 🖥️ Application Desktop (Tauri)
│   ├── renderer/         # React frontend
│   ├── shared/           # Types partagés
│   └── ...
├── src-tauri/            # Backend Tauri
├── landing/              # 🌐 Landing Page (Next.js)
└── docs/                 # Documentation
```

## 🔄 Flux Utilisateur

```
1. Utilisateur visite landing page (web)
   ↓
2. Clique sur "Download" (macOS/Windows/Linux)
   ↓
3. Télécharge l'installateur (.dmg, .exe, .AppImage)
   ↓
4. Installe HippoMind (app desktop)
   ↓
5. Lance l'app → WelcomeScreen.tsx s'affiche
   ↓
6. Commence à créer des mind maps (100% offline)
```

## 📦 Distribution

### Landing Page (Web)
- **Hébergement** : Vercel / Netlify / Static hosting
- **URL** : https://localmind.app
- **But** : Marketing, SEO, téléchargements
- **Technologie** : Next.js (React SSR)
- **Mise à jour** : `git push` → déploiement automatique

### App Desktop (Native)
- **Distribution** : Fichiers téléchargeables (DMG, exe, AppImage)
- **Hébergement des builds** : GitHub Releases / CDN
- **But** : Application locale, offline
- **Technologie** : Tauri + React
- **Mise à jour** : Release manuelle ou auto-update Tauri

## 🔗 Liens entre Landing et App

### 1. Liens de Téléchargement

Dans `landing/components/Downloads.tsx`, pointer vers vos builds :

```tsx
// Option 1 : GitHub Releases (gratuit)
href="https://github.com/vous/localmind/releases/latest/download/HippoMind-macOS.dmg"

// Option 2 : CDN personnalisé
href="https://releases.localmind.app/v1.0.0/HippoMind-macOS.dmg"

// Option 3 : Vercel Blob Storage
href="https://localmind.app/api/download/mac"
```

### 2. Build de l'App Desktop

Quand vous créez une nouvelle version :

```bash
# 1. Build l'app desktop
cd /Users/clement/Dev/MindMap
npm run dist:mac    # Crée DMG dans dist-electron/
npm run dist:win    # Crée exe
npm run dist:linux  # Crée AppImage

# 2. Uploader les builds
# - GitHub Releases (recommandé)
# - Ou votre CDN

# 3. Mettre à jour les liens dans landing/
cd landing
# Éditer components/Downloads.tsx avec les nouvelles URLs
```

### 3. Versioning

Gardez les versions synchronisées :

**App Desktop** (`package.json`) :
```json
{
  "version": "1.0.0"
}
```

**Landing Page** (`landing/components/Downloads.tsx`) :
```tsx
<p className="text-gray-600">Version 1.0.0 • Released October 2025</p>
```

## 🎨 Cohérence Visuelle

Les deux interfaces partagent les mêmes **couleurs et style** :

### Gradients Bleu-Violet

**Landing Page** (`landing/app/globals.css`) :
```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**App Desktop** (`packages/renderer/src/components/WelcomeScreen.tsx`) :
```tsx
// Utilise déjà des gradients bleu-violet similaires
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

### Logo

Le logo doit être identique partout :

```
/MindMap
├── landing/public/logo.svg           # Landing page
└── packages/renderer/public/logo.svg # App desktop
```

### Polices

Les deux utilisent des polices system :
- **Landing** : system-ui, -apple-system, BlinkMacSystemFont
- **App** : Même chose via Tailwind

## 🔄 Workflow de Release

### Processus Complet

```bash
# 1. Finaliser les changements dans l'app
cd /Users/clement/Dev/MindMap
git add .
git commit -m "feat: nouvelle fonctionnalité X"
git tag v1.1.0
git push origin main --tags

# 2. Build l'app pour toutes les plateformes
npm run dist:mac
npm run dist:win
npm run dist:linux

# 3. Créer GitHub Release
# - Aller sur github.com/vous/localmind/releases
# - "Draft a new release"
# - Uploader les DMG, exe, AppImage
# - Publier

# 4. Mettre à jour la landing page
cd landing
# Éditer components/Downloads.tsx avec les nouvelles URLs
# Mettre à jour numéro de version

# 5. Déployer la landing
git add .
git commit -m "chore: update download links to v1.1.0"
git push origin main
# Vercel déploie automatiquement
```

## 📊 Analytics & Tracking

### Suivre les Téléchargements

**Option 1 : Via Backend API**

Créer `landing/app/api/download/[platform]/route.ts` :

```typescript
export async function GET(request: Request, { params }: { params: { platform: string } }) {
  // 1. Log le téléchargement (analytics, DB)
  await trackDownload(params.platform);

  // 2. Rediriger vers le vrai fichier
  const urls = {
    mac: 'https://github.com/.../HippoMind-macOS.dmg',
    windows: 'https://github.com/.../HippoMind-Windows.exe',
    linux: 'https://github.com/.../HippoMind-Linux.AppImage',
  };

  return Response.redirect(urls[params.platform]);
}
```

**Option 2 : Analytics Events**

Dans `landing/components/Downloads.tsx` :

```tsx
<a
  href="..."
  onClick={() => {
    // Google Analytics
    gtag('event', 'download', {
      platform: 'mac',
      version: '1.0.0'
    });

    // Ou Plausible
    plausible('Download', { props: { platform: 'mac' } });
  }}
>
  Download
</a>
```

## 🔐 Auto-Update (Optionnel)

Tauri supporte les mises à jour automatiques :

### 1. Configurer Tauri Updater

`src-tauri/tauri.conf.json` :
```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://releases.localmind.app/{{target}}/{{current_version}}"
    ],
    "dialog": true,
    "pubkey": "YOUR_PUBLIC_KEY"
  }
}
```

### 2. Héberger les Updates

Créer un endpoint dans la landing page :

`landing/app/api/updates/[target]/[version]/route.ts`

Retourne un JSON avec la dernière version :
```json
{
  "version": "1.1.0",
  "url": "https://releases.localmind.app/HippoMind-1.1.0.dmg",
  "signature": "...",
  "notes": "- Nouvelle fonctionnalité X\n- Bug fix Y"
}
```

## 🌐 Redirection depuis l'App vers la Landing

Dans l'app desktop, vous pouvez créer des liens vers la landing :

```tsx
// packages/renderer/src/components/Help.tsx
<a
  href="https://localmind.app/docs"
  target="_blank"
  rel="noopener noreferrer"
>
  Documentation
</a>

<a href="https://localmind.app/support">
  Support
</a>

<a href="https://localmind.app/blog">
  Blog & Updates
</a>
```

## 📱 Deep Links (Futur)

Pour ouvrir l'app depuis la landing page :

```tsx
// Landing page
<a href="localmind://open?file=example.mindmap">
  Open in HippoMind
</a>
```

Nécessite configuration dans Tauri :
```json
{
  "tauri": {
    "bundle": {
      "deeplink": {
        "schemes": ["localmind"]
      }
    }
  }
}
```

## 🔄 Sync Code Commun (Optionnel)

Si vous voulez partager du code entre landing et app :

```bash
# Créer package partagé
mkdir shared-ui
cd shared-ui
npm init -y

# Components réutilisables
# - Logo
# - Colors/Theme
# - Typography
```

Puis importer dans les deux projets :
```json
{
  "dependencies": {
    "@localmind/shared-ui": "file:../shared-ui"
  }
}
```

## 🎯 Checklist Intégration

- [ ] Landing page déployée sur domaine
- [ ] Liens de téléchargement configurés
- [ ] Logo identique dans landing et app
- [ ] Couleurs cohérentes
- [ ] Versioning synchronisé
- [ ] Analytics configuré pour tracking downloads
- [ ] GitHub Releases configuré
- [ ] Process de release documenté
- [ ] Auto-update configuré (optionnel)
- [ ] Liens depuis app vers landing (support, docs)

## 🚀 Résumé

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Landing Page (Web)  →  App Desktop (Native)   │
│  ==================     ====================    │
│                                                 │
│  • Marketing            • Mind Mapping          │
│  • SEO                  • 100% Offline          │
│  • Downloads            • Fast Performance      │
│  • Documentation        • Native Features       │
│  • Support              • Data Privacy          │
│                                                 │
│  Next.js + Vercel      Tauri + React           │
│  https://localmind.app  Local installation     │
│                                                 │
└─────────────────────────────────────────────────┘
```

Les deux sont **indépendants** mais **complémentaires** :
- La landing page **amène des utilisateurs**
- L'app desktop **fournit la valeur**

---

**Note** : Cette séparation est idéale car :
- ✅ Landing page = SEO, marketing, rapide à mettre à jour
- ✅ App desktop = offline, performance, vie privée
- ✅ Pas de conflit entre les deux builds
- ✅ Workflow de release indépendant
