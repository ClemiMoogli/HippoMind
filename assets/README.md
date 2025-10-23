# Assets

Ce dossier contient les ressources pour l'application :

## Icônes requises

Pour une distribution complète, ajoutez les fichiers suivants :

- `icon.icns` : Icône macOS (512x512@2x)
- `icon.ico` : Icône Windows (256x256)
- `icon.png` : Icône Linux (512x512)

## Création des icônes

### Depuis un SVG ou PNG source

1. Créer une icône 1024x1024 px
2. Utiliser des outils comme :
   - [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
   - [png2icons](https://www.npmjs.com/package/png2icons)
   - Ou manuellement avec des outils système

### macOS (.icns)

```bash
# Nécessite iconutil (macOS uniquement)
mkdir icon.iconset
sips -z 16 16     icon-1024.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon-1024.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon-1024.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon-1024.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon-1024.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon-1024.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon-1024.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

### Windows (.ico)

Utiliser un outil comme ImageMagick :

```bash
convert icon-1024.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Association de fichier .mindmap

Les icônes sont également utilisées pour l'association de fichier définie dans `package.json` → `build.fileAssociations`.

## Placeholder

En l'absence d'icônes personnalisées, Electron utilisera des icônes par défaut.
