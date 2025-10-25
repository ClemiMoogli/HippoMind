# Options de Trial pour HippoMind

## Option 1 : Pas de trial (RECOMMANDÉ pour 19€)

**Supprimez simplement le bouton "Skip Trial"**

Dans `LicenseDialog.tsx`, retirez :
- Ligne 17 : `const [showTrialMode, setShowTrialMode] = useState(false);`
- Lignes 60-71 : La fonction `handleTrialMode()`
- Lignes 73-103 : Le JSX `if (showTrialMode)`
- Lignes 250-255 : Le bouton "Skip (Trial Mode)"

---

## Option 2 : Trial limité dans le temps (7 jours)

### Modifier `packages/renderer/src/utils/license.ts` :

```typescript
export function isTrialExpired(): boolean {
  const license = getSavedLicense();
  if (!license || license.key !== 'TRIAL-MODE') return false;

  const trialDays = 7;
  const activatedAt = new Date(license.activatedAt);
  const expiresAt = new Date(activatedAt.getTime() + trialDays * 24 * 60 * 60 * 1000);

  return new Date() > expiresAt;
}

export function getTrialDaysRemaining(): number {
  const license = getSavedLicense();
  if (!license || license.key !== 'TRIAL-MODE') return 0;

  const trialDays = 7;
  const activatedAt = new Date(license.activatedAt);
  const expiresAt = new Date(activatedAt.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const msRemaining = expiresAt.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
}
```

### Modifier `App.tsx` :

```typescript
import { isLicensed, isTrialExpired } from './utils/license';

// Dans le composant :
const [showLicenseDialog, setShowLicenseDialog] = useState(
  !isLicensed() || isTrialExpired()
);

// Vérifier périodiquement
useEffect(() => {
  const checkTrial = setInterval(() => {
    if (isTrialExpired()) {
      setShowLicenseDialog(true);
    }
  }, 60000); // Vérifier chaque minute

  return () => clearInterval(checkTrial);
}, []);
```

### Afficher un banner avec jours restants :

```typescript
// Dans App.tsx ou Toolbar.tsx
import { getTrialDaysRemaining } from './utils/license';

const daysRemaining = getTrialDaysRemaining();

{daysRemaining > 0 && (
  <div className="bg-yellow-500 text-white px-4 py-2 text-center">
    Trial mode: {daysRemaining} days remaining
    <a href="https://hippomind.org" className="ml-2 underline">
      Purchase License
    </a>
  </div>
)}
```

---

## Option 3 : Trial avec limitations fonctionnelles

### Limiter le nombre de mind maps (ex: 3 max)

```typescript
// Dans createDefaultDocument.ts ou Toolbar.tsx
import { isLicensed, getSavedLicense } from './utils/license';

function canCreateNewMap(): boolean {
  const license = getSavedLicense();

  // Si licensed, pas de limite
  if (license && license.verified && license.key !== 'TRIAL-MODE') {
    return true;
  }

  // Si trial, limite à 3 maps
  const tabs = useTabsStore.getState().tabs;
  return tabs.length < 3;
}

// Utilisation :
const handleNewMap = () => {
  if (!canCreateNewMap()) {
    alert('Trial version limited to 3 mind maps. Purchase a license to unlock unlimited maps!');
    return;
  }

  // ... créer la map
};
```

### Limiter le nombre de nœuds par map (ex: 50 max)

```typescript
// Dans mindmap.store.ts
import { getSavedLicense } from '../utils/license';

// Dans la fonction addNode :
addNode: (parentId, data) => {
  const license = getSavedLicense();
  const isTrial = license?.key === 'TRIAL-MODE';

  if (isTrial) {
    const nodeCount = Object.keys(get().document.nodes).length;
    if (nodeCount >= 50) {
      alert('Trial version limited to 50 nodes. Purchase a license for unlimited nodes!');
      return;
    }
  }

  // ... ajouter le nœud
}
```

### Désactiver l'export en trial

```typescript
// Dans Toolbar.tsx
const handleExport = () => {
  const license = getSavedLicense();
  if (license?.key === 'TRIAL-MODE') {
    alert('Export is not available in trial mode. Purchase a license to unlock this feature!');
    return;
  }

  // ... export
};
```

---

## Comparaison des options

| Option | Avantages | Inconvénients |
|--------|-----------|---------------|
| **1. Pas de trial** | ✅ Simple<br>✅ Pas de code<br>✅ Standard pour produits à 19€ | ❌ Moins de conversions potentielles |
| **2. Trial 7 jours** | ✅ Laisse tester<br>✅ Urgence (7 jours)<br>✅ Fonctionnalités complètes | ⚠️ Peut être contourné (clear localStorage) |
| **3. Trial limité** | ✅ Montre la valeur<br>✅ Incite à acheter | ❌ Frustrant si limites trop basses<br>❌ Plus de code |

---

## Ma recommandation

Pour un produit à **19€ one-time**, je recommande **Option 1 : Pas de trial**.

**Pourquoi ?**
- Prix bas → les gens achètent facilement
- Gumroad permet les remboursements (60 jours)
- Moins de support client ("comment prolonger le trial ?")
- Vous avez déjà une landing page avec démo

**Alternative** : Créer une **vidéo démo** de 2-3 min sur la landing page pour montrer l'app en action.

---

## Implémentation rapide (Option 1)

Voulez-vous que je retire le code Trial maintenant ?
