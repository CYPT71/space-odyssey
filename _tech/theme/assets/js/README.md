# Deep Space Observatory - JavaScript Architecture

## Structure Overview

```
theme/assets/js/
├── config/              # Configuration & Constants
│   └── constants.js     # Frozen configuration (PHYSICS, AUDIO, etc.)
│
├── core/                # Core Utilities (Framework-agnostic)
│   ├── errors.js        # Custom error classes + ErrorBoundary
│   ├── events.js        # Functional event emitter
│   ├── reactive.js      # Proxy-based reactive state
│   └── validator.js     # Pure validation functions
│
├── inputs/              # Input orchestration & device handling
│   ├── ship-controls.js # Ship-specific control factory
│   └── ship/            # Control state, movement, autopilot, warp
│
├── utils/               # Utility Functions
│   ├── logger.js        # Functional logging system
│   ├── math.js          # Mathematical utilities
│   └── performance.js   # Performance monitoring
│
├── galaxy/              # Galaxy System (Hierarchical Navigation)
│   ├── parser.js        # File system → galaxy hierarchy
│   ├── particles.js     # Spiral galaxy particles
│   ├── renderer.js      # Galaxy creation & rendering
│   └── navigation.js    # Navigation system + breadcrumb
│
├── systems/             # Game Systems
│   ├── audio.js         # Sound system (retro arcade)
│   ├── particles.js     # Particle effects (stars, trails)
│   ├── ui.js            # HUD & UI management
│   └── galaxy-manager.js# Galaxy orchestration
│
├── entities/            # Game Entities
│   └── ship-model.js    # Ship geometry & lighting
│
├── infrastructure/      # Three.js Infrastructure
│   ├── scene-setup.js   # Scene, camera, renderer setup
│   ├── css2d-renderer.js# Custom CSS2D renderer
│   └── post-processing.js# Custom bloom effect
│
├── legacy/              # Deprecated Code
│   └── planets.js       # Old planet system (replaced by galaxy)
│
└── space-scene.js       # Main Orchestrator
```

## Architecture Principles

### Functional Programming
- **Pure functions** where possible
- **Closures** for encapsulation
- **Factory pattern** (createX functions)
- **No classes** except Three.js wrappers

### Reactive State
- **Proxy-based** reactivity
- **Immutable** configuration
- **Observable** patterns

### Clean Code
- **Single Responsibility** - One purpose per file
- **Dependency Injection** - Factory functions
- **Separation of Concerns** - Clear boundaries
- **100% JSDoc** documentation

## Module Descriptions

### config/constants.js
Centralized frozen configuration for all systems.
```javascript
export const PHYSICS = Object.freeze({ MAX_SPEED: 5.0, ... });
export const AUDIO = Object.freeze({ ENGINE: { ... }, ... });
```

### core/reactive.js
Proxy-based reactive state management.
```javascript
const state = createReactiveState({ speed: 0 }, (prop, value) => {
  console.log(`${prop} changed`);
});
```

### galaxy/parser.js
Parses Jekyll file system into galaxy hierarchy.
- Filters technical files
- Creates tree structure
- Generates unique colors

### inputs/ship-controls.js
Ship-specific control factory that wires state, movement, rotation, warp, and autopilot modules while keeping input concerns out of rendering systems.

### systems/galaxy-manager.js
Main galaxy system orchestrator.
- Initializes from file system
- Creates galaxies & planets
- Handles navigation
- Manages interactions

### space-scene.js
Main application entry point.
- Initializes all systems
- Runs animation loop
- Coordinates modules

## Import Conventions

```javascript
// Relative imports from current location
import { createShip } from './entities/ship-model.js';
import { initScene } from './infrastructure/scene-setup.js';
import { createGalaxyManager } from './systems/galaxy-manager.js';

// Parent directory imports
import { PHYSICS } from '../config/constants.js';
import { createReactiveState } from '../core/reactive.js';
```

## Adding New Features

### New System
1. Create file in `systems/`
2. Export factory function
3. Import in `space-scene.js`
4. Initialize and use

### New Entity
1. Create file in `entities/`
2. Export creation function
3. Use in appropriate system

### New Utility
1. Create file in `utils/`
2. Export pure functions
3. Import where needed

## Code Quality Standards

- ✅ JSDoc for all functions
- ✅ Functional paradigm
- ✅ Error handling
- ✅ Validation
- ✅ Performance monitoring
- ✅ Logging

## Galaxy System

### File System Mapping
- **Root files** → Planets
- **Folders** → Galaxies
- **Subfolders** → Sub-galaxies

### Navigation
- **Enter** on galaxy → Warp transition
- **Enter** on planet → Open terminal
- **Backspace** → Go back
- **Breadcrumb** → `UNIVERSE > Projects > Web`

## Performance

- Object pooling for particles
- Reactive updates only when needed
- Efficient Proxy usage
- Optimized Three.js rendering

## Maintainability

- Clear folder structure
- Consistent naming
- Comprehensive documentation
- Easy to extend
- Easy to test
