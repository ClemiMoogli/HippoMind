# 📥 Configuration des Téléchargements

## Vue d'ensemble

Actuellement, les boutons de téléchargement pointent vers des liens factices (`#download-mac`, etc.). Voici comment configurer les vrais liens de téléchargement.

## Option 1 : GitHub Releases (Recommandé - Gratuit)

### Avantages
- ✅ Gratuit et illimité
- ✅ Pas de serveur à gérer
- ✅ CDN automatique (rapide partout)
- ✅ Gestion des versions intégrée
- ✅ Historique des releases

### Configuration

#### 1. Créer un repo GitHub pour HippoMind

```bash
# Si pas déjà fait
cd /Users/clement/Dev/MindMap
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/nodeflow.git
git push -u origin main
```

#### 2. Build les installateurs

```bash
# macOS
npm run dist:mac
# → Crée dist-electron/HippoMind-x.x.x.dmg

# Windows (si sur Windows)
npm run dist:win
# → Crée dist-electron/HippoMind-x.x.x.exe

# Linux
npm run dist:linux
# → Crée dist-electron/HippoMind-x.x.x.AppImage
```

#### 3. Créer une GitHub Release

1. Aller sur https://github.com/VOTRE_USERNAME/nodeflow/releases
2. Cliquer sur "Draft a new release"
3. Tag version : `v1.0.0`
4. Release title : `HippoMind 1.0.0`
5. Description :
   ```markdown
   ## 🎉 First Release

   ### Features
   - 100% Offline mind mapping
   - Support jusqu'à 2000 nodes
   - 4 thèmes (Light, Dark, Sepia, Slate)
   - Autosave toutes les 30 secondes
   - Undo/Redo illimité

   ### Downloads
   - **macOS** : HippoMind-1.0.0.dmg (Apple Silicon + Intel)
   - **Windows** : HippoMind-1.0.0.exe (64-bit)
   - **Linux** : HippoMind-1.0.0.AppImage

   ### Installation
   - **macOS** : Double-cliquer sur le DMG, glisser vers Applications
   - **Windows** : Lancer l'exe, suivre l'installateur
   - **Linux** : Rendre exécutable (`chmod +x`), lancer
   ```

6. **Attacher les fichiers** :
   - Glisser-déposer les DMG, exe, AppImage

7. Cliquer "Publish release"

#### 4. Récupérer les URLs

Une fois publié, faites clic-droit sur chaque fichier → "Copy link address"

Vous obtiendrez des URLs du type :
```
https://github.com/VOTRE_USERNAME/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.dmg
https://github.com/VOTRE_USERNAME/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.exe
https://github.com/VOTRE_USERNAME/nodeflow/releases/download/v1.0.0/HippoMind-1.0.0.AppImage
```

**Astuce** : Pour toujours pointer vers la dernière version, utilisez `/latest/` :
```
https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-macOS.dmg
```

#### 5. Mettre à jour la landing page

Éditez `landing/components/Downloads.tsx` :

```tsx
// Ligne ~84-120 environ
<motion.a
  key={platform.name}
  href={
    platform.name === 'mac'
      ? 'https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-macOS.dmg'
      : platform.name === 'windows'
      ? 'https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-Windows.exe'
      : 'https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-Linux.AppImage'
  }
  // ... reste du code
>
```

Ou mieux, utilisez des variables d'environnement dans `.env.local` :

```bash
NEXT_PUBLIC_DOWNLOAD_MAC=https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-macOS.dmg
NEXT_PUBLIC_DOWNLOAD_WINDOWS=https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-Windows.exe
NEXT_PUBLIC_DOWNLOAD_LINUX=https://github.com/VOTRE_USERNAME/nodeflow/releases/latest/download/HippoMind-Linux.AppImage
```

Puis dans `Downloads.tsx` :

```tsx
href={
  platform.name === 'mac'
    ? process.env.NEXT_PUBLIC_DOWNLOAD_MAC
    : platform.name === 'windows'
    ? process.env.NEXT_PUBLIC_DOWNLOAD_WINDOWS
    : process.env.NEXT_PUBLIC_DOWNLOAD_LINUX
}
```

---

## Option 2 : Serveur Personnel / CDN

### Hébergement sur votre serveur

1. **Louer un serveur** (DigitalOcean, Hetzner, OVH)
2. **Uploader les fichiers** via SFTP
3. **Configurer nginx** :

```nginx
server {
    listen 80;
    server_name releases.nodeflow.app;

    location /downloads/ {
        alias /var/www/nodeflow/releases/;
        autoindex off;
    }
}
```

4. **URLs** : `https://releases.nodeflow.app/downloads/HippoMind-macOS.dmg`

### Avantages
- ✅ Contrôle total
- ✅ Pas de limite de bande passante (selon hébergeur)
- ✅ URLs personnalisées

### Inconvénients
- ❌ Coût mensuel (~5-20€/mois)
- ❌ Maintenance requise
- ❌ Pas de CDN (sauf config supplémentaire)

---

## Option 3 : Cloudflare R2 / AWS S3

### Avantages
- ✅ Pas de frais de sortie (R2)
- ✅ CDN intégré (rapide partout)
- ✅ Scalable à l'infini

### Configuration Cloudflare R2

1. Aller sur https://dash.cloudflare.com/
2. Créer un bucket R2 : `nodeflow-releases`
3. Uploader les fichiers
4. Configurer un domaine personnalisé : `releases.nodeflow.app`
5. URLs publiques : `https://releases.nodeflow.app/HippoMind-macOS.dmg`

### Coûts
- Stockage : 0.015€/GB/mois
- Téléchargements : **0€** (pas de frais de sortie)

Exemple : 100 MB × 3 fichiers = 300 MB = **~0.005€/mois** 🤯

---

## Option 4 : Vercel Blob Storage

Si votre landing est sur Vercel, utilisez Vercel Blob :

```typescript
// landing/app/api/download/[platform]/route.ts
import { put } from '@vercel/blob';

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  const urls = {
    mac: 'https://xxxxx.public.blob.vercel-storage.com/HippoMind-macOS.dmg',
    windows: 'https://xxxxx.public.blob.vercel-storage.com/HippoMind-Windows.exe',
    linux: 'https://xxxxx.public.blob.vercel-storage.com/HippoMind-Linux.AppImage',
  };

  // Redirect vers le fichier
  return Response.redirect(urls[params.platform as keyof typeof urls]);
}
```

### Avantages
- ✅ Intégré avec Vercel
- ✅ CDN automatique
- ✅ Simple à configurer

### Coûts
- 1 GB gratuit/mois
- Puis ~0.15€/GB

---

## Tracking des Téléchargements

Pour suivre combien de fois chaque plateforme est téléchargée :

### Option 1 : Via API Route

Créer `landing/app/api/download/[platform]/route.ts` :

```typescript
export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  const { platform } = params;

  // 1. Logger le téléchargement (base de données, analytics, etc.)
  console.log(`Download: ${platform} at ${new Date().toISOString()}`);

  // Optionnel : Sauvegarder dans une DB
  // await db.downloads.create({ platform, timestamp: new Date() });

  // 2. Rediriger vers GitHub Release
  const urls = {
    mac: 'https://github.com/.../HippoMind-macOS.dmg',
    windows: 'https://github.com/.../HippoMind-Windows.exe',
    linux: 'https://github.com/.../HippoMind-Linux.AppImage',
  };

  return Response.redirect(urls[platform as keyof typeof urls]);
}
```

Puis dans `Downloads.tsx`, pointer vers `/api/download/mac` au lieu de l'URL directe.

### Option 2 : Google Analytics

```tsx
<a
  href="https://github.com/.../HippoMind-macOS.dmg"
  onClick={() => {
    // Track avec Google Analytics
    gtag('event', 'download', {
      event_category: 'Downloads',
      event_label: 'macOS',
      value: 1
    });
  }}
>
  Download
</a>
```

### Option 3 : Plausible Analytics

```tsx
onClick={() => {
  plausible('Download', { props: { platform: 'macOS' } });
}}
```

---

## Checklist

- [ ] Builds créés (DMG, exe, AppImage)
- [ ] GitHub Release publiée (ou autre hébergement)
- [ ] URLs de téléchargement copiées
- [ ] `Downloads.tsx` mis à jour avec les vraies URLs
- [ ] Variables d'environnement configurées (optionnel)
- [ ] Tracking configuré (optionnel)
- [ ] Testé les téléchargements sur chaque plateforme

---

## Recommandation Finale

**Pour débuter : GitHub Releases**

C'est :
- ✅ Gratuit
- ✅ Simple
- ✅ Professionnel
- ✅ Utilisé par 99% des apps desktop open-source

Une fois que vous avez des milliers de téléchargements/mois, migrez vers Cloudflare R2 pour économiser sur la bande passante.

---

**Questions ?** Consultez [INTEGRATION.md](../INTEGRATION.md) pour plus d'infos sur l'intégration landing ↔️ app.
