# Guide développeur LocalMind

## Architecture

LocalMind est une application Electron monorepo avec 4 packages :

```
/packages
  /shared      # Types, constantes, utilitaires partagés
  /main        # Processus principal Electron
  /preload     # Bridge IPC sécurisé
  /renderer    # Interface React
```

## Stack technique

- **Electron** : Container desktop
- **React** : Interface utilisateur
- **React-Konva** : Rendu Canvas 2D
- **Zustand** : Gestion d'état
- **TypeScript** : Typage strict
- **Tailwind CSS** : Styling
- **i18next** : Internationalisation
- **Vite** : Build tool
- **electron-store** : Stockage des préférences

## Installation

```bash
# Installer les dépendances
npm install

# Mode développement
npm run dev

# Build production
npm run build

# Créer les installateurs
npm run dist
```

## Structure des packages

### shared

Types et utilitaires communs :
- Types TypeScript pour le format .mindmap
- Constantes (thèmes, layouts, etc.)
- Validation et migration de documents
- Générateur UUID

### main

Processus principal Electron :
- Gestion de la fenêtre
- Handlers IPC (fichiers, préférences)
- Stockage des préférences (electron-store)
- Dialogues natifs (open/save)

### preload

Bridge sécurisé entre main et renderer :
- Expose une API restreinte au renderer
- `contextIsolation` activé
- Pas d'accès direct à Node.js depuis le renderer

### renderer

Interface React :
- Components : Canvas, Toolbar, etc.
- Stores Zustand : mindmap.store, ui.store
- Hooks personnalisés : useFileOperations, useKeyboardShortcuts, useAutosave
- i18n : FR/EN

## Développement

### Ajouter une fonctionnalité

1. **Shared** : Ajouter les types si nécessaire
2. **Main** : Ajouter le handler IPC si communication nécessaire
3. **Preload** : Exposer la fonction via l'API
4. **Renderer** : Implémenter l'UI et la logique

### Modifier le format .mindmap

1. Incrémenter `FILE_FORMAT_VERSION` dans `shared/src/constants.ts`
2. Mettre à jour les types dans `shared/src/types/mindmap.ts`
3. Ajouter la logique de migration dans `shared/src/utils/validation.ts`
4. Tester la rétrocompatibilité

### Ajouter un thème

1. Ajouter le thème dans `shared/src/constants.ts` → `THEMES`
2. Ajouter les couleurs Tailwind dans `renderer/tailwind.config.js`
3. Ajouter la traduction dans `renderer/src/i18n/locales/*.json`

## Stores Zustand

### mindmap.store

Gère l'état du document :
- Document courant
- Historique undo/redo
- Opérations CRUD sur les nœuds
- Sélection

### ui.store

Gère l'état de l'interface :
- Thème actuel
- Zoom/pan
- Recherche
- Mini-map

## IPC Channels

Communication sécurisée via preload :

```typescript
// Main → Renderer
window.electronAPI.fileSave(path, data)
window.electronAPI.fileOpen(path)
window.electronAPI.prefsGet(key)
window.electronAPI.prefsSet(key, value)
```

Voir `shared/src/types/ipc.ts` pour la liste complète.

## Tests

### Tests unitaires (Vitest)

```bash
npm test
```

Tester :
- Stores Zustand
- Utilitaires (UUID, validation)
- Logique métier

### Tests E2E (Playwright)

```bash
npm run test:e2e
```

Tester :
- Création/édition de carte
- Sauvegarde/chargement
- Export
- Raccourcis clavier

## Build & Distribution

### Build

```bash
npm run build
```

Produit :
- `packages/main/dist/` : JS du processus principal
- `packages/preload/dist/` : JS du preload
- `packages/renderer/dist/` : HTML/CSS/JS de l'UI

### Distribution

```bash
npm run dist          # Toutes plateformes
npm run dist:mac      # macOS uniquement
npm run dist:win      # Windows uniquement
npm run dist:linux    # Linux uniquement
```

Produit des installateurs dans `dist-electron/`.

## Sécurité

### Bonnes pratiques appliquées

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- Pas d'`eval()` ou `Function()`
- Validation des entrées utilisateur
- Pas de dépendances réseau

### IPC sécurisé

- Whitelist stricte des channels
- Validation des arguments
- Pas d'exécution de code arbitraire

## Performance

### Optimisations Canvas

- Batching des renders Konva
- Throttling du pan/zoom
- `requestAnimationFrame` pour les animations
- Layers séparés (edges vs nodes)

### Optimisations React

- Selectors Zustand pour éviter re-renders
- `React.memo` sur composants lourds
- Lazy loading des composants

### Objectif

60 fps sur des cartes jusqu'à 2000 nœuds.

## Conventions de code

### Commits

Format Conventional Commits :

```
feat: Add search functionality
fix: Correct node deletion bug
docs: Update keyboard shortcuts
refactor: Simplify store logic
```

### TypeScript

- `strict: true`
- Pas de `any` (sauf cas exceptionnels)
- Interfaces pour les objets publics
- Types pour les fonctions internes

### React

- Functional components uniquement
- Hooks personnalisés pour la logique réutilisable
- Props interfaces explicites

## Roadmap

Fonctionnalités futures :
- Vue outline (arborescence textuelle)
- Templates de cartes
- Système de plugins
- Collaboration LAN
- Import/export FreeMind

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'feat: Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Propriétaire - Tous droits réservés
