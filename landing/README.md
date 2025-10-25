# HippoMind Landing Page

Landing page moderne et dynamique pour HippoMind - l'application de mind mapping 100% offline.

## 🚀 Fonctionnalités

- ✨ **Design moderne** avec gradients animés et effets parallaxe
- 🌐 **Bilingue FR/EN** avec next-intl
- 📱 **100% Responsive** - optimisé mobile, tablette, desktop
- ⚡ **Performance optimale** - Next.js 15 + Tailwind CSS 4
- 🎨 **Animations fluides** avec Framer Motion
- 🎯 **SEO optimisé**

## 📦 Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **i18n**: next-intl
- **TypeScript**: Configuration stricte

## 🛠️ Installation

```bash
npm install
```

## 🏃 Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

La landing page supporte automatiquement FR/EN :
- EN: http://localhost:3000
- FR: http://localhost:3000/fr

## 🏗️ Build

```bash
npm run build
npm run start
```

## 📁 Structure

```
landing/
├── app/
│   ├── [locale]/          # Pages localisées
│   │   ├── layout.tsx     # Layout avec i18n
│   │   └── page.tsx       # Page principale
│   └── globals.css        # Styles globaux + animations
├── components/
│   ├── Hero.tsx           # Section Hero avec parallaxe
│   ├── Features.tsx       # Grille de fonctionnalités
│   ├── Demo.tsx           # Démo avec animation
│   ├── Pricing.tsx        # Tarification + comparaison
│   ├── Downloads.tsx      # Téléchargements multi-plateformes
│   ├── FAQ.tsx            # Questions fréquentes
│   └── Footer.tsx         # Footer avec liens
├── i18n/
│   ├── request.ts         # Configuration next-intl
│   └── routing.ts         # Routing i18n
├── messages/
│   ├── en.json            # Traductions EN
│   └── fr.json            # Traductions FR
├── middleware.ts          # Middleware i18n
└── next.config.ts         # Configuration Next.js
```

## 🎨 Sections

1. **Hero** - Titre accrocheur avec effet parallaxe et CTA
2. **Features** - 9 fonctionnalités principales avec icônes et animations
3. **Demo** - Aperçu visuel de l'application
4. **Pricing** - Tarification 19€/$ avec comparaison concurrence
5. **Downloads** - Boutons de téléchargement macOS/Windows/Linux
6. **FAQ** - 6 questions fréquentes avec accordéons
7. **Footer** - Navigation + sélecteur de langue

## 🌍 Traductions

Pour ajouter/modifier les traductions, éditez :
- `messages/en.json` (Anglais)
- `messages/fr.json` (Français)

## 🎯 Déploiement

### Vercel (Recommandé)

```bash
vercel
```

### Netlify

```bash
npm run build
# Deploy le dossier .next/
```

### Build statique

Pour générer un export statique, décommentez dans `next.config.ts` :

```typescript
const nextConfig: NextConfig = {
  output: 'export', // Activer l'export statique
  images: { unoptimized: true },
};
```

**Note**: L'export statique est incompatible avec le middleware i18n. Pour l'i18n statique, utilisez une approche différente ou déployez sur Vercel.

## 🔗 Liens

- **App Desktop**: `../packages` (HippoMind application)
- **Documentation**: Voir `/docs` à la racine du projet

## 📝 TODO

- [ ] Ajouter screenshots réels de l'application
- [ ] Configurer les liens de téléchargement réels (DMG, exe, AppImage)
- [ ] Ajouter Google Analytics / Plausible
- [ ] Optimiser les images (WebP, lazy loading)
- [ ] Ajouter testimonials/reviews
- [ ] Créer page blog (optionnel)

## 📄 Licence

Propriétaire - HippoMind © 2025
