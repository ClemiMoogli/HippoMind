# ⚡ Quick Start - Landing Page NodeFlow

## 🚀 Lancer en 30 secondes

```bash
cd /Users/clement/Dev/MindMap/landing
npm run dev
```

Ouvrez **http://localhost:3000**

C'est tout ! 🎉

## 🌐 Tester les Langues

- **Anglais** : http://localhost:3000
- **Français** : http://localhost:3000/fr

Cliquez sur EN/FR dans la navbar pour changer de langue.

## 📱 Tester le Responsive

1. Ouvrez http://localhost:3000
2. Ouvrez DevTools (F12 ou Cmd+Opt+I)
3. Cliquez sur l'icône mobile (Cmd+Shift+M)
4. Testez différentes tailles :
   - iPhone : 375px
   - iPad : 768px
   - Desktop : 1440px

## 🎨 Ce que vous Verrez

### 1. Hero Section
- Fond dégradé animé bleu-violet
- Orbes flottants
- Titre "Your Mind Maps, 100% Offline"
- Bouton "Download for Free"
- Prix "One-time purchase: $19"

### 2. Features Section
- 9 cartes de fonctionnalités
- Icônes colorées
- Animations au scroll
- Hover effects

### 3. Demo Section
- Mockup de l'application
- Animation SVG de mind map
- Badges flottants "60 FPS" et "100% Offline"

### 4. Pricing Section
- Card de pricing avec liste de features
- Prix 19€ ou $19
- Tableau de comparaison vs concurrents
- CTA "Get NodeFlow Now"

### 5. Downloads Section
- 3 boutons : macOS / Windows / Linux
- Icônes de plateformes
- Animations hover

### 6. FAQ Section
- 6 questions fréquentes
- Accordéons interactifs
- Animations d'ouverture/fermeture

### 7. Footer
- Logo et navigation
- Sélecteur de langue EN/FR
- Liens support et legal

## ✏️ Modifier le Contenu

### Changer le Texte Français

Éditez `messages/fr.json` :

```json
{
  "hero": {
    "title": "Votre nouveau titre"
  }
}
```

Sauvegardez → La page se met à jour automatiquement ! ⚡

### Changer le Texte Anglais

Éditez `messages/en.json`

### Changer les Couleurs

Éditez `app/globals.css` :

```css
.gradient-text {
  background: linear-gradient(135deg, #VOS_COULEURS);
}
```

## 🏗️ Build pour Production

```bash
npm run build
npm run start
```

Ouvrez http://localhost:3000 pour voir la version optimisée.

## 🚀 Déployer sur Vercel (2 minutes)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
vercel

# 3. Suivre les instructions
# - Login avec GitHub
# - Confirmer le projet
# - Attendre le déploiement
```

Votre landing page sera live avec une URL du type :
`https://localmind-landing.vercel.app`

## 📂 Fichiers Importants

```
landing/
├── app/[locale]/page.tsx       # Page principale (éditer l'ordre des sections)
├── components/                  # Tous les composants (éditer individuellement)
├── messages/en.json            # Textes anglais
├── messages/fr.json            # Textes français
├── app/globals.css             # Couleurs et animations
├── tailwind.config.ts          # Configuration Tailwind
└── next.config.ts              # Configuration Next.js
```

## 🎯 Actions Rapides

### Changer l'Ordre des Sections

Éditez `app/[locale]/page.tsx` :

```tsx
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Demo />        {/* ← Déplacer vers le haut */}
      <Features />    {/* ← ou vers le bas */}
      <Pricing />
      <Downloads />
      <FAQ />
      <Footer />
    </main>
  );
}
```

### Cacher une Section

Commentez simplement :

```tsx
{/* <FAQ /> */}  {/* ← FAQ cachée */}
```

### Ajouter vos Screenshots

1. Mettez vos images dans `public/screenshots/`
2. Éditez `components/Demo.tsx`
3. Remplacez le SVG mockup par :

```tsx
<Image
  src="/screenshots/app-screenshot.png"
  alt="NodeFlow App"
  width={1200}
  height={675}
/>
```

## 🐛 Problèmes Courants

### Port 3000 déjà utilisé ?

```bash
npm run dev -- -p 3001
```

### Changements non visibles ?

1. Rafraîchir la page (Cmd+R)
2. Vider le cache (Cmd+Shift+R)
3. Redémarrer le serveur (Ctrl+C puis `npm run dev`)

### Erreur de module ?

```bash
rm -rf node_modules .next
npm install
npm run dev
```

## 📚 Documentation Complète

- **Guide Complet** : [LANDING_GUIDE.md](LANDING_GUIDE.md)
- **Toutes les Commandes** : [COMMANDS.md](COMMANDS.md)
- **TODO List** : [TODO.md](TODO.md)
- **Intégration** : [../INTEGRATION.md](../INTEGRATION.md)

## ✅ Checklist Avant Déploiement

- [ ] Testé en local (http://localhost:3000)
- [ ] Testé FR et EN
- [ ] Testé sur mobile (DevTools)
- [ ] Screenshots réels ajoutés
- [ ] Liens de téléchargement configurés
- [ ] Logo et favicon ajoutés
- [ ] Build réussi (`npm run build`)

## 🎉 C'est Prêt !

Votre landing page est **fonctionnelle** et **prête à déployer** !

**Temps de setup** : ✅ Déjà fait !
**Temps de personnalisation** : 30 minutes
**Temps de déploiement** : 2 minutes

---

**Prochaine étape** : Ajouter vos screenshots et déployer ! 🚀

Questions ? Consultez [LANDING_GUIDE.md](LANDING_GUIDE.md)
