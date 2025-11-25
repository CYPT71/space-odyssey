# 🎓 Guide du Débutant - Deep Space Observatory

## 📚 Table des Matières

1. [Structure du Projet](#structure-du-projet)
2. [Fichiers Principaux](#fichiers-principaux)
3. [Comment Ajouter une Fonctionnalité](#comment-ajouter-une-fonctionnalité)
4. [Concepts Clés](#concepts-clés)
5. [Dépannage](#dépannage)

## 📁 Structure du Projet

```
theme/assets/js/
├── config/              # Configuration
│   └── constants.js     # Constantes (vitesses, physique, etc.)
│
├── core/                # Utilitaires de base
│   ├── reactive.js      # Système de réactivité
│   └── events.js        # Gestion d'événements
│
├── entities/            # Objets 3D
│   ├── ship-model.js    # Modèle du vaisseau
│   └── procedural-planets.js  # Génération de planètes
│
├── systems/             # Systèmes de jeu
│   ├── ship-controls.js # Contrôles du vaisseau
│   ├── camera-controller.js  # Caméra smooth follow
│   ├── particles.js     # Étoiles et particules
│   ├── audio.js         # Sons
│   ├── ui.js            # Interface utilisateur
│   └── galaxy-manager.js # Gestion des galaxies
│
├── infrastructure/      # Infrastructure Three.js
│   └── scene-setup.js   # Initialisation de la scène
│
└── space-scene.js       # ⭐ FICHIER PRINCIPAL
```

## 🎯 Fichiers Principaux

### `space-scene.js` - Le Chef d'Orchestre

C'est le **point d'entrée** de l'application. Il :
- Initialise tous les systèmes
- Lance la boucle d'animation
- Coordonne les modules

**Structure** :
```javascript
// 1. IMPORTS - Charger les modules
import { createShip } from './entities/ship-model.js';

// 2. INITIALIZATION - Créer les objets
const ship = createShip(scene);

// 3. ANIMATION LOOP - Boucle de jeu
function animate() {
    // Mettre à jour tout
    requestAnimationFrame(animate);
}
```

### `entities/ship-model.js` - Le Vaisseau

Crée le modèle 3D du vaisseau.

**Exemple** :
```javascript
export function createShip(scene) {
    const shipGroup = new THREE.Group();
    // ... création de la géométrie
    scene.add(shipGroup);
    return { shipGroup, updateLighting };
}
```

### `systems/ship-controls.js` - Les Contrôles

Gère les touches du clavier pour piloter le vaisseau.

**Touches** :
- `Z/S` : Tangage (pitch)
- `Q/D` : Roulis (roll)
- `A/E` : Lacet (yaw)
- `Space/Shift` : Warp +/-

### `systems/camera-controller.js` - La Caméra

Fait suivre la caméra au vaisseau avec un léger retard.

**Principe** :
```javascript
// Position cible = derrière le vaisseau
const targetPos = offset.clone().applyMatrix4(ship.matrixWorld);

// Interpolation douce (lerp)
camera.position.lerp(targetPos, 0.05);
```

## 🚀 Comment Ajouter une Fonctionnalité

### Exemple : Ajouter un Compteur de Distance

**1. Créer le module** (`systems/distance-tracker.js`)

```javascript
/**
 * Tracks total distance traveled
 */
export function createDistanceTracker() {
    let totalDistance = 0;
    let lastPosition = null;

    const update = (currentPosition) => {
        if (lastPosition) {
            const distance = currentPosition.distanceTo(lastPosition);
            totalDistance += distance;
        }
        lastPosition = currentPosition.clone();
    };

    const getTotal = () => totalDistance;

    return { update, getTotal };
}
```

**2. Importer dans `space-scene.js`**

```javascript
import { createDistanceTracker } from './systems/distance-tracker.js';

// Initialisation
const distanceTracker = createDistanceTracker();
```

**3. Utiliser dans la boucle d'animation**

```javascript
function animate() {
    // ...
    distanceTracker.update(shipGroup.position);
    console.log('Distance:', distanceTracker.getTotal());
    // ...
}
```

## 💡 Concepts Clés

### 1. Three.js Basics

**Scene** : Le conteneur de tous les objets 3D
```javascript
const scene = new THREE.Scene();
```

**Camera** : Le point de vue
```javascript
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
```

**Renderer** : Dessine la scène
```javascript
renderer.render(scene, camera);
```

### 2. Boucle d'Animation

```javascript
function animate() {
    requestAnimationFrame(animate); // Rappel à 60 FPS
    
    // 1. Mettre à jour la logique
    shipControls.update();
    
    // 2. Dessiner
    renderer.render(scene, camera);
}
```

### 3. Système de Modules

**Export** (dans le module) :
```javascript
export function createMySystem() {
    return { update, reset };
}
```

**Import** (dans space-scene.js) :
```javascript
import { createMySystem } from './systems/my-system.js';
const mySystem = createMySystem();
```

### 4. Lerp (Interpolation Linéaire)

Transition douce entre deux valeurs :
```javascript
// 0.1 = 10% vers la cible à chaque frame
camera.position.lerp(targetPosition, 0.1);
```

## 🔧 Dépannage

### Le vaisseau n'apparaît pas
- Vérifier que `createShip()` est appelé
- Vérifier que le vaisseau est ajouté à la scène
- Vérifier les matériaux (emissive pour visibilité)

### Les contrôles ne fonctionnent pas
- Vérifier que `shipControls.update()` est appelé dans `animate()`
- Vérifier la console pour les erreurs
- Tester avec `console.log()` dans `handleKeyDown`

### La caméra ne suit pas
- Vérifier que `cameraController.update()` est appelé
- Vérifier l'offset de la caméra
- Ajuster le `lerpFactor` (plus petit = plus lent)

### Performance lente
- Réduire le nombre de planètes procédurales
- Vérifier le nombre de particules
- Utiliser les DevTools (Performance tab)

## 📖 Ressources

- [Three.js Documentation](https://threejs.org/docs/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Code Architecture README](theme/assets/js/README.md)

## 🎯 Prochaines Étapes

1. Lire `space-scene.js` ligne par ligne
2. Modifier une constante dans `config/constants.js`
3. Ajouter un `console.log()` dans la boucle d'animation
4. Créer votre premier module simple

**Bon courage ! 🚀**
