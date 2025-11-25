# Configuration Guide

## Overview
All hardcoded values and magic numbers are centralized in `/config/constants.js` for easy tuning and maintenance.

## Configuration Sections

### PHYSICS
Controls ship movement and physics simulation
- `MAX_SPEED`: Maximum ship velocity
- `ACCELERATION`: Rate of speed increase
- `FRICTION`: Deceleration factor
- `TURN_SPEED`, `ROLL_SPEED`: Rotation rates
- `WARP_LEVELS`: Speed multipliers for warp drive

### PARTICLES
Starfield and particle effects
- `STARS`: 40,000 stars with infinite wrapping
- `LIGHTS`: Colorful ambient particles
- `TRAILS`: Speed trail effects

### PLANETS
Procedural planet generation
- `PROCEDURAL_COUNT`: Number of generated planets (150)
- `MIN_SIZE`, `MAX_SIZE`: Planet size range (40-100 units)
- `MIN_RADIUS`, `MAX_RADIUS`: Spawn distance range (4000-15000 units)

### GALAXY
Galaxy and navigation system
- `MINIMAP_RANGE`: Detection range for minimap
- `MINIMAP_LIMIT`: Number of objects shown

### SHIP
USS Enterprise model dimensions and materials
- `SAUCER`, `NACELLE`, `IMPULSE_ENGINE`: Geometry parameters
- `MATERIALS`: Color values for hull, engines, etc.

### CAMERA
View configuration
- `OFFSET`: Camera position relative to ship
- `LERP_FACTOR`: Smoothness of camera follow

### UI
Interface update rates and cooldowns

## Usage
Import constants in any module:
```javascript
import { PLANETS, SHIP, CAMERA } from '../config/constants.js';
```

## Modification
To adjust any value, edit `constants.js` and reload. All modules will use the new values automatically.
