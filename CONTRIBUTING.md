# Guide de contribution

Merci de votre intérêt pour HippoMind !

## Code de conduite

Soyez respectueux et constructif dans vos interactions.

## Comment contribuer

### Signaler un bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Créez une issue avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs actuel
   - Version de l'application et OS
   - Captures d'écran si pertinent

### Proposer une fonctionnalité

1. Créez une issue de type "Feature Request"
2. Décrivez clairement :
   - Le besoin / cas d'usage
   - La solution proposée
   - Des alternatives envisagées

### Contribuer du code

1. **Fork** le projet
2. **Clone** votre fork
3. **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
4. **Installer** : `npm install`
5. **Développer** avec tests
6. **Tester** : `npm test`
7. **Commit** : Format Conventional Commits
   ```
   feat: Add search functionality
   fix: Correct node deletion
   docs: Update README
   ```
8. **Push** : `git push origin feature/ma-fonctionnalite`
9. **Pull Request** vers `main`

### Standards de code

- **TypeScript strict**
- **ESLint** : Pas d'erreurs
- **Prettier** : Format automatique
- **Tests** : Ajoutez des tests pour les nouvelles fonctionnalités
- **Documentation** : Mettez à jour les docs si nécessaire

### Architecture

Consultez [docs/developer-guide.md](./docs/developer-guide.md) pour comprendre l'architecture.

### Tests

```bash
# Unitaires
npm test

# E2E
npm run test:e2e

# TypeCheck
npm run typecheck

# Lint
npm run lint
```

### Développement

```bash
# Mode dev avec hot-reload
npm run dev

# Build
npm run build

# Distribution
npm run dist
```

## Revue de code

Les Pull Requests seront revues selon :
- Qualité du code
- Tests
- Documentation
- Conformité aux standards
- Impact sur les performances

## Licence

En contribuant, vous acceptez que votre code soit sous la même licence que le projet.

Merci ! 🎉
