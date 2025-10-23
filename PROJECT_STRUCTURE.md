# Structure du projet NodeFlow

```
MindMap/
│
├── packages/                           # Monorepo packages
│   │
│   ├── shared/                         # 📦 Types & utilitaires partagés
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── mindmap.ts          # Types du format .mindmap
│   │   │   │   └── ipc.ts              # Types IPC
│   │   │   ├── utils/
│   │   │   │   ├── uuid.ts             # Générateur UUID v4
│   │   │   │   ├── validation.ts       # Validation & migration
│   │   │   │   └── __tests__/          # Tests unitaires
│   │   │   ├── constants.ts            # Constantes globales
│   │   │   └── index.ts                # Exports
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── main/                           # ⚡ Processus principal Electron
│   │   ├── src/
│   │   │   ├── index.ts                # Entry point
│   │   │   ├── ipc.ts                  # Handlers IPC
│   │   │   └── preferences.ts          # electron-store
│   │   ├── dist/                       # Build output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── preload/                        # 🔒 Bridge sécurisé
│   │   ├── src/
│   │   │   └── index.ts                # API exposée au renderer
│   │   ├── dist/                       # Build output
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── renderer/                       # 🎨 Interface React
│       ├── src/
│       │   ├── components/
│       │   │   ├── Canvas.tsx          # Canvas Konva
│       │   │   └── Toolbar.tsx         # Barre d'outils
│       │   ├── store/
│       │   │   ├── mindmap.store.ts    # État document
│       │   │   └── ui.store.ts         # État UI
│       │   ├── hooks/
│       │   │   ├── useFileOperations.ts
│       │   │   ├── useKeyboardShortcuts.ts
│       │   │   └── useAutosave.ts
│       │   ├── i18n/
│       │   │   ├── index.ts            # Config i18next
│       │   │   └── locales/
│       │   │       ├── fr.json         # Français
│       │   │       └── en.json         # English
│       │   ├── styles/
│       │   │   └── index.css           # Tailwind CSS
│       │   ├── types/
│       │   │   └── window.d.ts         # Types window.electronAPI
│       │   ├── App.tsx                 # Composant racine
│       │   └── main.tsx                # Entry point
│       ├── dist/                       # Build output (Vite)
│       ├── index.html                  # HTML template
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/                            # 🛠 Scripts utilitaires
│   └── dev.js                          # Script de développement
│
├── docs/                               # 📚 Documentation
│   ├── user-guide.md                   # Guide utilisateur
│   ├── developer-guide.md              # Guide développeur
│   ├── keyboard-shortcuts.md           # Raccourcis clavier
│   └── file-format.md                  # Format .mindmap
│
├── e2e/                                # 🧪 Tests E2E
│   └── basic.spec.ts                   # Tests Playwright
│
├── assets/                             # 🎨 Ressources
│   └── README.md                       # Guide icônes
│
├── dist-electron/                      # 📦 Build final (ignoré)
│   ├── mac/
│   ├── win/
│   └── linux/
│
├── node_modules/                       # 📦 Dépendances (ignoré)
│
├── .eslintrc.json                      # Configuration ESLint
├── .prettierrc.json                    # Configuration Prettier
├── .gitignore                          # Git ignore
├── .nvmrc                              # Version Node.js
│
├── package.json                        # Config root
├── package-lock.json                   # Lock file
├── pnpm-workspace.yaml                 # Config pnpm (optionnel)
├── tsconfig.json                       # Config TypeScript root
├── vitest.config.ts                    # Config Vitest
├── playwright.config.ts                # Config Playwright
│
├── README.md                           # 📄 Vue d'ensemble
├── SUMMARY.md                          # 📊 Résumé complet
├── QUICKSTART.md                       # 🚀 Démarrage rapide
├── CONTRIBUTING.md                     # 🤝 Guide contribution
├── LICENSE                             # 📜 Licence
└── PROJECT_STRUCTURE.md                # 📁 Ce fichier
```

## Taille des packages

| Package | Rôle | Dépendances principales |
|---------|------|------------------------|
| **shared** | Types & utils | Aucune (pure TS) |
| **main** | Processus Electron | electron-store |
| **preload** | Bridge IPC | Aucune |
| **renderer** | Interface UI | React, Konva, Zustand, Tailwind |

## Fichiers clés

### Configuration

- `package.json` : Scripts NPM, workspaces, electron-builder
- `tsconfig.json` : Configuration TypeScript racine
- `.eslintrc.json` : Règles de lint
- `vitest.config.ts` : Tests unitaires
- `playwright.config.ts` : Tests E2E

### Code principal

- `packages/main/src/index.ts` : Création fenêtre Electron
- `packages/main/src/ipc.ts` : Communication main ↔ renderer
- `packages/preload/src/index.ts` : API sécurisée exposée
- `packages/renderer/src/App.tsx` : Application React
- `packages/renderer/src/components/Canvas.tsx` : Canvas Konva

### Stores (état)

- `packages/renderer/src/store/mindmap.store.ts` : Document, nodes, undo/redo
- `packages/renderer/src/store/ui.store.ts` : Theme, zoom, pan, search

## Flux de données

```
User Input
    ↓
Canvas / Toolbar (React)
    ↓
Zustand Store (mindmap.store / ui.store)
    ↓
Local State Update
    ↓
[Si fichier] → electronAPI (preload)
    ↓
IPC Channel
    ↓
Main Process Handler (ipc.ts)
    ↓
File System (fs) / electron-store
```

## Processus de build

1. **Shared** : `tsc` → `dist/`
2. **Main** : `tsc` → `dist/`
3. **Preload** : `tsc` → `dist/`
4. **Renderer** : `vite build` → `dist/`
5. **electron-builder** : Package → `dist-electron/`

## Points d'entrée

- **Development** : `scripts/dev.js` → Vite server + Electron
- **Production** : `packages/main/dist/index.js` (dans l'app packagée)
- **Renderer** : `packages/renderer/index.html` → `/src/main.tsx`

## Communication IPC

```
Renderer (React)
    ↓ window.electronAPI.fileSave()
Preload (contextBridge)
    ↓ ipcRenderer.invoke('file:save')
Main (ipcMain.handle)
    ↓ fs.writeFile()
```

## Extensions recommandées (VS Code)

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- React Developer Tools
