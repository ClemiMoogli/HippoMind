# Format de fichier .mindmap

## Vue d'ensemble

Les fichiers LocalMind utilisent l'extension `.mindmap` et contiennent du JSON valide encodé en UTF-8.

## Version actuelle : 1.0.0

### Structure

```json
{
  "version": "1.0.0",
  "meta": {
    "title": "Titre de la carte",
    "createdAt": "2025-10-15T09:00:00Z",
    "modifiedAt": "2025-10-15T09:30:00Z",
    "app": "LocalMind",
    "appVersion": "1.0.0",
    "locale": "fr"
  },
  "theme": {
    "name": "dark",
    "node": {
      "shape": "pill",
      "bg": "#1f2937",
      "fg": "#f9fafb",
      "border": "#374151"
    }
  },
  "layout": {
    "type": "balanced",
    "spacing": {
      "sibling": 40,
      "level": 80
    }
  },
  "rootId": "uuid-root",
  "nodes": {
    "uuid-root": {
      "id": "uuid-root",
      "text": "Sujet principal",
      "pos": { "x": 0, "y": 0 },
      "size": { "w": 180, "h": 48 },
      "style": {},
      "data": { "notes": "", "tags": [] },
      "children": ["uuid-a", "uuid-b"]
    }
  }
}
```

## Champs

### version
Version du format de fichier (semantic versioning).

### meta
Métadonnées du document :
- `title` : Titre de la carte
- `createdAt` : Date de création (ISO 8601)
- `modifiedAt` : Date de dernière modification (ISO 8601)
- `app` : Nom de l'application
- `appVersion` : Version de l'application
- `locale` : Langue (fr, en, etc.)

### theme
Configuration du thème :
- `name` : Nom du thème (light, dark, sepia, slate)
- `node.shape` : Forme des nœuds (pill, rounded-rect)
- `node.bg` : Couleur de fond
- `node.fg` : Couleur du texte
- `node.border` : Couleur de la bordure

### layout
Configuration de la disposition :
- `type` : Type de layout (balanced, radial)
- `spacing.sibling` : Espacement entre nœuds frères
- `spacing.level` : Espacement entre niveaux

### rootId
ID du nœud racine (UUID v4).

### nodes
Dictionnaire de tous les nœuds, indexés par ID.

#### Structure d'un nœud :
- `id` : Identifiant unique (UUID v4)
- `text` : Texte du nœud
- `pos` : Position absolue `{ x: number, y: number }`
- `size` : Dimensions `{ w: number, h: number }`
- `style` : Surcharges de style (bg, fg, border, badge)
- `data` : Données additionnelles (notes, tags)
- `children` : Tableau d'IDs des nœuds enfants

## Relations parent-enfant

Les arêtes sont implicites via le champ `children`. Pour trouver le parent d'un nœud, cherchez le nœud dont `children` contient son ID.

## Migrations

Lors de l'ouverture d'un fichier avec une version différente, l'application applique automatiquement les migrations nécessaires.

## Rétrocompatibilité

LocalMind garantit la lecture des fichiers des versions précédentes (1.x.x).
