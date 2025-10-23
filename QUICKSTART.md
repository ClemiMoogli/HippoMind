# Quick Start Guide

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Vérifier que tout compile
npm run build
```

## Développement

### Lancer l'application en mode dev

```bash
npm run dev
```

Cela va :
1. Démarrer le serveur Vite (port 5173)
2. Compiler main et preload en mode watch
3. Lancer Electron

**Note :** Attendez quelques secondes que la compilation initiale se termine.

### Structure de développement

```
packages/
├── shared/       # Types partagés
│   └── src/
│       ├── types/       # Types TypeScript
│       ├── constants.ts # Constantes globales
│       └── utils/       # Utilitaires
│
├── main/         # Processus principal Electron
│   └── src/
│       ├── index.ts     # Entry point
│       ├── ipc.ts       # Handlers IPC
│       └── preferences.ts
│
├── preload/      # Bridge sécurisé
│   └── src/
│       └── index.ts     # API exposée au renderer
│
└── renderer/     # Interface React
    └── src/
        ├── components/  # Composants React
        ├── store/       # Stores Zustand
        ├── hooks/       # Custom hooks
        ├── i18n/        # Traductions
        └── styles/      # CSS
```

## Tests

```bash
# Tests unitaires
npm test

# Tests E2E (à implémenter)
npm run test:e2e

# TypeCheck
npm run typecheck

# Lint
npm run lint
```

## Build & Distribution

```bash
# Build production
npm run build

# Créer les installateurs
npm run dist        # Tous les OS
npm run dist:mac    # macOS uniquement
npm run dist:win    # Windows uniquement
npm run dist:linux  # Linux uniquement
```

Les installateurs seront dans `dist-electron/`.

## Prochaines étapes de développement

### 1. Mini-map

Créer un composant `MiniMap.tsx` dans `packages/renderer/src/components/` :

```tsx
export function MiniMap() {
  // Afficher un aperçu miniature du canvas
  // Rectangle représentant le viewport
  // Clic pour naviguer
}
```

Ajouter dans `App.tsx`.

### 2. Recherche

Créer `Search.tsx` :

```tsx
export function Search() {
  // Input avec Ctrl+F
  // Filtrer nodes par texte
  // Naviguer entre résultats
}
```

Utiliser `useUIStore` pour l'état.

### 3. Export

Créer `packages/main/src/export.ts` :

```typescript
// Export PNG : Canvas to dataURL
// Export SVG : Konva toSVG()
// Export PDF : jsPDF + Canvas
```

Ajouter handlers IPC et boutons UI.

### 4. Icônes

Placer dans `assets/` :
- `icon.icns` (macOS)
- `icon.ico` (Windows)
- `icon.png` (Linux)

Taille recommandée : 1024x1024

### 5. Édition inline

Dans `Canvas.tsx`, sur double-clic :
- Afficher un `<input>` HTML par-dessus
- Sauvegarder sur Enter ou blur

## Debugging

### Outils de développement

En mode dev, DevTools s'ouvrent automatiquement.

### Logs

- **Main process** : Terminal
- **Renderer** : DevTools Console

### Hot-reload

- **Renderer** : Hot Module Replacement (HMR) automatique
- **Main/Preload** : Recompilation automatique, mais nécessite redémarrage Electron

## Problèmes courants

### L'app ne démarre pas

1. Vérifier que les dépendances sont installées : `npm install`
2. Vérifier que tout compile : `npm run build`
3. Essayer de relancer : `npm run dev`

### Erreurs TypeScript

```bash
# Nettoyer et rebuild
rm -rf packages/*/dist
npm run build
```

### Canvas ne s'affiche pas

Vérifier dans DevTools :
- État Zustand (extension React DevTools)
- Erreurs console
- Taille du container

## Ressources

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev)
- [Konva Docs](https://konvajs.org/docs/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Support

Pour toute question :
1. Consulter [docs/developer-guide.md](./docs/developer-guide.md)
2. Ouvrir une issue GitHub
3. Consulter les logs

Bon développement ! 🚀
