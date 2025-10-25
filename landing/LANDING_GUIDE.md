# 🚀 HippoMind Landing Page - Guide Complet

## ✅ Ce qui a été créé

Vous avez maintenant une landing page moderne et professionnelle pour HippoMind ! Voici tout ce qui a été implémenté :

### 🎨 Design & Animations

✅ **Hero Section avec Parallaxe**
- Gradient animé bleu-violet (cohérent avec votre app)
- Orbes flottants avec animations
- Effet parallaxe au scroll
- CTA prominent "Download for Free"
- Prix affiché : 19€/19$ (achat unique)

✅ **Section Features**
- 9 fonctionnalités principales avec icônes
- Animations au scroll (fade-in séquentiel)
- Cards avec hover effects et gradients
- Responsive grid (1/2/3 colonnes)

✅ **Section Demo**
- Mockup de l'application avec effet parallaxe
- Animation SVG de mind map avec nœuds connectés
- Badges flottants "60 FPS" et "100% Offline"

✅ **Section Pricing**
- Card de pricing avec features liste
- Tableau de comparaison vs concurrence
- Prix : 19€ (FR) / $19 (EN)
- CTA vers téléchargement

✅ **Section Downloads**
- 3 cards pour macOS / Windows / Linux
- Icônes de plateformes
- Hover effects et animations
- Liens de téléchargement (à configurer)

✅ **FAQ Accordéon**
- 6 questions fréquentes
- Animation d'ouverture/fermeture smooth
- Questions sur prix, offline, données, multi-devices, support, remboursement

✅ **Footer Complet**
- Logo et tagline
- Navigation par sections
- Liens vers docs et support
- Legal (Privacy, Terms)

✅ **Navbar Fixe**
- Transparente au top, devient opaque au scroll
- Navigation smooth vers sections
- Sélecteur de langue EN/FR
- CTA "Get Started"
- Responsive (hamburger menu prévu)

### 🌍 i18n (Internationalisation)

✅ **Bilingue FR/EN complet**
- `messages/fr.json` - Toutes les traductions FR
- `messages/en.json` - Toutes les traductions EN
- Middleware pour détection automatique
- Sélecteur de langue dans navbar et footer
- URLs : `/` (EN par défaut) et `/fr` (Français)

### 🛠️ Stack Technique

✅ **Next.js 15** (App Router)
- App Router avec support i18n
- Middleware pour routing multilingue
- TypeScript strict
- Configuration optimisée

✅ **Tailwind CSS 4**
- Animations custom (gradient, float, pulse)
- Glass morphism effects
- Gradients animés
- Scrollbar personnalisée
- Dark mode support

✅ **Framer Motion**
- Parallaxe scroll effects
- Animations on scroll (InView)
- Smooth transitions
- Orbes flottants animés

✅ **next-intl**
- Gestion complète i18n
- Routing automatique
- Messages structurés

### 📁 Structure du Projet

```
landing/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Layout avec i18n
│   │   └── page.tsx            # Page principale
│   └── globals.css             # Styles + animations
├── components/
│   ├── Navbar.tsx              # Navigation fixe
│   ├── Hero.tsx                # Hero avec parallaxe
│   ├── Features.tsx            # Grille features
│   ├── Demo.tsx                # Démo animée
│   ├── Pricing.tsx             # Tarifs + comparaison
│   ├── Downloads.tsx           # Téléchargements
│   ├── FAQ.tsx                 # Questions fréquentes
│   └── Footer.tsx              # Footer complet
├── i18n/
│   ├── request.ts              # Config next-intl
│   └── routing.ts              # Routing i18n
├── messages/
│   ├── en.json                 # 🇬🇧 Traductions EN
│   └── fr.json                 # 🇫🇷 Traductions FR
├── middleware.ts               # Middleware i18n
├── next.config.ts              # Config Next.js
├── tailwind.config.ts          # Config Tailwind + animations
├── README.md                   # Documentation
├── LANDING_GUIDE.md           # Ce fichier
├── .env.example                # Variables d'environnement
└── vercel.json                 # Config déploiement
```

## 🏃 Démarrage Rapide

### 1. Lancer en développement

```bash
cd landing
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

### 2. Tester les langues

- **Anglais** : http://localhost:3000
- **Français** : http://localhost:3000/fr

### 3. Build de production

```bash
npm run build
npm run start
```

## 🎯 Prochaines Étapes

### 📸 Assets à Ajouter

1. **Screenshots de l'app**
   - Remplacer le mockup SVG dans [Demo.tsx](components/Demo.tsx)
   - Ajouter dans `/public/screenshots/`
   - Formats recommandés : PNG optimisés ou WebP

2. **Logo**
   - Ajouter `/public/logo.svg` ou `/public/logo.png`
   - Mettre à jour la navbar

3. **Favicon et meta images**
   - `/public/favicon.ico`
   - `/public/og-image.png` (1200x630px pour OpenGraph)
   - Mettre à jour dans [layout.tsx](app/[locale]/layout.tsx)

### 🔗 Liens de Téléchargement

Éditer [Downloads.tsx](components/Downloads.tsx) pour pointer vers les vrais liens :

```tsx
// Remplacer les href="#download-{platform}" par :
href="https://releases.localmind.app/HippoMind-macOS.dmg"
href="https://releases.localmind.app/HippoMind-Windows.exe"
href="https://releases.localmind.app/HippoMind-Linux.AppImage"
```

Ou utiliser les variables d'environnement dans `.env.local` :

```bash
NEXT_PUBLIC_DOWNLOAD_MAC=https://...
NEXT_PUBLIC_DOWNLOAD_WINDOWS=https://...
NEXT_PUBLIC_DOWNLOAD_LINUX=https://...
```

### 📊 Analytics (Optionnel)

Pour suivre les visites et conversions :

1. **Google Analytics**
   ```tsx
   // Ajouter dans app/[locale]/layout.tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   <GoogleAnalytics gaId="G-XXXXXXXXXX" />
   ```

2. **Plausible Analytics** (recommandé, privacy-friendly)
   ```tsx
   <Script
     defer
     data-domain="localmind.app"
     src="https://plausible.io/js/script.js"
   />
   ```

### 🎨 Personnalisation

#### Changer les couleurs

Éditer [tailwind.config.ts](tailwind.config.ts) et [globals.css](app/globals.css) :

```css
/* Remplacer les gradients bleu-violet par vos couleurs */
.gradient-bg {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

#### Ajouter des sections

Créer un nouveau composant dans `/components/` et l'ajouter dans [page.tsx](app/[locale]/page.tsx) :

```tsx
import YourNewSection from '@/components/YourNewSection';

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <YourNewSection /> {/* 👈 Ici */}
      ...
    </main>
  );
}
```

#### Modifier les traductions

Éditer [messages/fr.json](messages/fr.json) et [messages/en.json](messages/en.json) :

```json
{
  "hero": {
    "title": "Votre nouveau titre",
    "subtitle": "Votre nouveau sous-titre"
  }
}
```

## 🚀 Déploiement

### Option 1 : Vercel (Recommandé - Gratuit)

1. Installer Vercel CLI :
   ```bash
   npm i -g vercel
   ```

2. Déployer :
   ```bash
   cd landing
   vercel
   ```

3. Suivre les instructions (connecter GitHub, configurer domaine)

4. **Domaine custom** : Configurer dans Vercel Dashboard
   - Ajouter `localmind.app`
   - Configurer DNS (CNAME vers Vercel)

### Option 2 : Netlify

1. Build :
   ```bash
   npm run build
   ```

2. Déployer via Netlify CLI ou interface web
   - Build command : `npm run build`
   - Publish directory : `.next`

### Option 3 : Serveur traditionnel

```bash
npm run build
npm run start # Port 3000 par défaut
```

Utiliser PM2 pour process management :
```bash
pm2 start npm --name "localmind-landing" -- start
```

## 🔧 Configuration Avancée

### SEO Metadata

Éditer [layout.tsx](app/[locale]/layout.tsx) :

```tsx
export const metadata = {
  title: 'HippoMind - Your Mind Maps, 100% Offline',
  description: 'The mind mapping app that respects your privacy...',
  openGraph: {
    title: 'HippoMind',
    description: '...',
    url: 'https://localmind.app',
    siteName: 'HippoMind',
    images: [
      {
        url: 'https://localmind.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HippoMind',
    description: '...',
    images: ['https://localmind.app/og-image.png'],
  },
}
```

### Robots.txt et Sitemap

Créer `/public/robots.txt` :
```
User-agent: *
Allow: /
Sitemap: https://localmind.app/sitemap.xml
```

Générer sitemap automatiquement avec Next.js :
```bash
npm install next-sitemap
```

### Performance

- ✅ Images optimisées avec next/image
- ✅ Lazy loading des composants
- ✅ Code splitting automatique (Next.js)
- ✅ CSS minifié (Tailwind)
- ✅ Animations GPU-accelerated

## 📱 Responsive

Tous les composants sont responsive :
- **Mobile** : < 768px (menu hamburger, stack vertical)
- **Tablet** : 768px - 1024px (grid 2 colonnes)
- **Desktop** : > 1024px (grid 3 colonnes)

Tester avec :
```bash
npm run dev
# Ouvrir DevTools > Toggle device toolbar (Cmd+Shift+M)
```

## 🐛 Troubleshooting

### Erreur : "Middleware cannot be used with output: export"

✅ **Solution** : Le middleware est nécessaire pour l'i18n. Pour un site statique pur, désactiver le middleware et utiliser une approche différente, OU déployer sur Vercel/Netlify qui supportent le middleware.

### Erreur : Module not found 'framer-motion'

```bash
cd landing
npm install
```

### Port 3000 déjà utilisé

```bash
npm run dev -- -p 3001  # Utiliser port 3001
```

## 📊 Checklist Avant Lancement

- [ ] Screenshots réels ajoutés dans Demo.tsx
- [ ] Logo et favicon configurés
- [ ] Liens de téléchargement mis à jour
- [ ] Variables d'environnement configurées (.env.local)
- [ ] Métadonnées SEO complétées (title, description, OG images)
- [ ] Analytics configuré (GA ou Plausible)
- [ ] Testé sur mobile/tablet/desktop
- [ ] Testé dans Chrome, Firefox, Safari
- [ ] Build de production testé (`npm run build`)
- [ ] Domaine configuré (DNS pointant vers Vercel/Netlify)
- [ ] Certificat SSL activé (automatique sur Vercel/Netlify)
- [ ] Contact email configuré dans Footer
- [ ] Legal pages créées (Privacy Policy, Terms)

## 🎉 Félicitations !

Votre landing page HippoMind est prête ! Vous avez :

- ✅ Design moderne avec parallaxe et animations
- ✅ i18n FR/EN complet
- ✅ Responsive mobile/desktop
- ✅ Performance optimisée
- ✅ SEO-friendly
- ✅ Prêt pour le déploiement

**Prochaine étape** : Ajouter vos screenshots réels et déployer sur Vercel ! 🚀

---

**Besoin d'aide ?**
- 📖 [Documentation Next.js](https://nextjs.org/docs)
- 🌐 [Documentation next-intl](https://next-intl-docs.vercel.app/)
- 🎨 [Documentation Framer Motion](https://www.framer.com/motion/)
- 💨 [Documentation Tailwind CSS](https://tailwindcss.com/docs)
