# 📋 Landing Page - TODO List

## 🔴 Priorité Haute (Avant Lancement)

- [ ] **Remplacer le mockup SVG par des screenshots réels**
  - Prendre screenshots de l'app HippoMind
  - Optimiser en WebP (tools: Squoosh, TinyPNG)
  - Ajouter dans `/public/screenshots/`
  - Mettre à jour `components/Demo.tsx`

- [ ] **Configurer les liens de téléchargement réels**
  - Héberger les builds (DMG, exe, AppImage)
  - Mettre à jour les URLs dans `components/Downloads.tsx`
  - Tester les téléchargements

- [ ] **Ajouter logo et favicon**
  - Créer ou exporter logo HippoMind (SVG + PNG)
  - Générer favicons (https://realfavicongenerator.net/)
  - Ajouter dans `/public/`
  - Mettre à jour `app/[locale]/layout.tsx`

- [ ] **Créer OG image (OpenGraph)**
  - Design 1200x630px avec titre "HippoMind"
  - Inclure tagline et visuel
  - Ajouter dans `/public/og-image.png`
  - Configurer metadata dans layout.tsx

- [ ] **Créer pages légales**
  - Privacy Policy (`app/[locale]/privacy/page.tsx`)
  - Terms of Service (`app/[locale]/terms/page.tsx`)
  - Consulter un avocat si nécessaire
  - Mettre à jour liens dans Footer

## 🟡 Priorité Moyenne (Post-Lancement)

- [ ] **Analytics**
  - Configurer Google Analytics OU Plausible
  - Tracker conversions (clics sur Download)
  - Setup goals/events

- [ ] **Menu mobile**
  - Implémenter hamburger menu dans Navbar
  - Animation slide-in
  - Navigation mobile smooth

- [ ] **Blog/News section** (optionnel)
  - Setup MDX pour articles
  - Page `/blog` avec liste d'articles
  - RSS feed

- [ ] **Testimonials/Reviews**
  - Collecter reviews utilisateurs
  - Créer `components/Testimonials.tsx`
  - Ajouter entre Pricing et Downloads

- [ ] **Video demo**
  - Créer screencast de l'app (30-60s)
  - Héberger sur YouTube ou Vimeo
  - Embed dans section Demo

- [ ] **Newsletter signup**
  - Intégrer Mailchimp/ConvertKit/Buttondown
  - Formulaire dans Footer ou section dédiée
  - Double opt-in GDPR compliant

## 🟢 Priorité Basse (Améliorations)

- [ ] **Dark mode toggle**
  - Ajouter bouton theme switcher
  - Persister préférence (localStorage)
  - Sync avec system preference

- [ ] **Animations améliorées**
  - Parallaxe plus prononcé
  - Micro-interactions sur CTAs
  - Loading states

- [ ] **A/B Testing**
  - Tester variantes de CTA text
  - Tester couleurs de boutons
  - Optimiser conversion rate

- [ ] **Locales additionnelles**
  - Espagnol (ES)
  - Allemand (DE)
  - Italien (IT)
  - Créer `messages/es.json`, etc.

- [ ] **Comparaison détaillée concurrents**
  - Page `/comparison` dédiée
  - Tableau feature-by-feature
  - Screenshots side-by-side

- [ ] **Changelog public**
  - Page `/changelog`
  - Historique des versions
  - RSS feed des releases

- [ ] **Documentation intégrée**
  - `/docs` avec guides
  - Searchable knowledge base
  - Videos tutorials

## 🔧 Technique

- [ ] **Tests E2E**
  - Setup Playwright ou Cypress
  - Tests de navigation
  - Tests de changement de langue
  - Tests de responsive

- [ ] **Lighthouse optimisations**
  - Viser score > 95 pour tous
  - Performance
  - Accessibility
  - Best Practices
  - SEO

- [ ] **Sitemap.xml automatique**
  - Installer `next-sitemap`
  - Configurer génération auto
  - Submit à Google Search Console

- [ ] **robots.txt**
  - Créer `/public/robots.txt`
  - Permettre indexation
  - Link vers sitemap

- [ ] **Monitoring**
  - Setup Sentry pour error tracking
  - Setup uptime monitoring (UptimeRobot, Pingdom)
  - Alerts email/Slack

- [ ] **CDN et caching**
  - Configurer headers cache (déjà fait sur Vercel)
  - Optimize images lazy loading
  - Preload critical resources

## 📊 Marketing

- [ ] **Social media cards**
  - Créer variations OG images
  - Twitter card
  - LinkedIn preview

- [ ] **Landing page variants**
  - Version spécifique pour Product Hunt launch
  - Version pour Reddit/HN
  - Variant avec pricing highlight

- [ ] **Email templates**
  - Welcome email
  - Download confirmation
  - Update notifications

## ✅ Fait

- [x] Setup Next.js 15 avec App Router
- [x] Configuration Tailwind CSS 4
- [x] i18n FR/EN avec next-intl
- [x] Hero section avec parallaxe
- [x] Section Features (9 features)
- [x] Section Demo avec mockup animé
- [x] Section Pricing avec comparaison
- [x] Section Downloads (macOS/Windows/Linux)
- [x] FAQ avec accordéons
- [x] Footer complet
- [x] Navbar fixe avec language switcher
- [x] Animations Framer Motion
- [x] Responsive mobile/tablet/desktop
- [x] Configuration Vercel
- [x] Documentation README
- [x] Guide complet LANDING_GUIDE.md

---

**Mise à jour** : 2025-10-23
