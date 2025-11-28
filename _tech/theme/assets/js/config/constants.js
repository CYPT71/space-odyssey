/**
 * @fileoverview Centralized configuration constants
 * @author CYPT71
 * @version 3.0.0
 */

/**
 * Physics simulation constants
 * @const {Object}
 */
export const PHYSICS = Object.freeze({
    MAX_SPEED: 5000.0,      // x1000
    ACCELERATION: 50.0,     // x1000
    FRICTION: 0.96,
    TURN_SPEED: 0.03,  // Plus rapide pour meilleure maniabilité (était 0.015)
    ROLL_SPEED: 0.04,  // Plus rapide (était 0.02)
    VERTICAL_SPEED: 500.0,  // x1000
    WARP_LEVELS: [0, 500, 1000, 2000, 3000, 4000, 5000] // x1000
});

/**
 * Lighting configuration
 * @const {Object}
 */
export const LIGHTING = Object.freeze({
    PORTHOLE: {
        COUNT: 13,
        COLOR: 0xFFFFFF,
        INTENSITY: 0.3,
        DISTANCE: 5
    },
    ENGINE: {
        COUNT: 4,
        COLOR: 0xFF3300,
        INTENSITY: 0.8,
        DISTANCE: 10,
        PULSE_SPEED: 3
    },
    AMBIENT: {
        COLOR: 0xFFFFFF,
        INTENSITY: 0.3
    },
    DIRECTIONAL: {
        COLOR: 0xFFFFFF,
        INTENSITY: 0.8,
        POSITION: { x: 5, y: 10, z: 7.5 }
    }
});

/**
 * Particle system configuration
 * @const {Object}
 */
export const PARTICLES = Object.freeze({
    STARS: {
        COUNT: 500000,      // Raisonnable pour performance (x5 de l'original)
        SIZE: 1500,         // x1000
        COLOR: 0xFFFFFF,
        OPACITY: 0.8,
        SPREAD: 12000000,   // x1000
        WRAP_RANGE: 8000000 // x1000
    },
    LIGHTS: {
        COUNT: 200,
        SIZE: 3000,         // x1000
        OPACITY: 0.8,
        SPREAD: 3000000,    // x1000
        RESPAWN_DISTANCE: 2000000 // x1000
    },
    TRAILS: {
        MAX_COUNT: 100,
        SIZE: 2000,         // x1000
        SPAWN_RATE: 5,
        MIN_SPEED: 0.3
    }
});

/**
 * Planet generation configuration
 * @const {Object}
 */
export const PLANETS = Object.freeze({
    PROCEDURAL_COUNT: 150,
    MIN_SIZE: 40000,        // x1000
    MAX_SIZE: 100000,       // x1000
    MIN_RADIUS: 15000000,   // x1000
    MAX_RADIUS: 50000000,   // x1000
    VERTICAL_SPREAD: 10000000, // x1000
    POSITION_VARIANCE: 3000000, // x1000
    LABEL_OFFSET: 1.2
});

/**
 * Galaxy configuration
 * @const {Object}
 */
export const GALAXY = Object.freeze({
    DETECTION_RANGE: 2000000,       // x1000
    MINIMAP_RANGE: 50000000,        // x1000
    MINIMAP_RANGE_EXPANDED: 150000000, // x1000
    MINIMAP_LIMIT: 8,
    MINIMAP_LIMIT_EXPANDED: 100,
    COMPASS_FOV: Math.PI / 3
});

/**
 * Ship model configuration
 * @const {Object}
 */
export const SHIP = Object.freeze({
    SAUCER: {
        RADIUS_TOP: 8,
        RADIUS_BOTTOM: 10,
        HEIGHT: 2,
        SEGMENTS: 64
    },
    SECONDARY_HULL: {
        RADIUS_TOP: 3.5,
        RADIUS_BOTTOM: 2.5,
        LENGTH: 18
    },
    NACELLE: {
        RADIUS: 2,
        LENGTH: 24,
        SPACING: 12,
        HEIGHT: 6,
        Z_OFFSET: -4
    },
    IMPULSE_ENGINE: {
        RADIUS: 0.8,
        LENGTH: 3,
        COLOR: 0xFF6600,
        EMISSIVE: 0xFF4400,
        SPEED_DIVISOR: 2,
        MAX_INTENSITY: 3
    },
    MATERIALS: {
        HULL_COLOR: 0xCCCCCC,
        BUSSARD_COLOR: 0xFF4400,
        WARP_GLOW_COLOR: 0x00AAFF,
        DEFLECTOR_COLOR: 0x00FFFF
    }
});

/**
 * Audio configuration
 * @const {Object}
 */
export const AUDIO = Object.freeze({
    ENGINE: {
        TYPE: 'square',
        BASE_FREQUENCY: 110,
        FREQUENCIES: [110, 165, 220, 275, 330, 440],
        VOLUME: 0.04
    },
    WARP: {
        TYPE: 'square',
        FREQUENCIES: [880, 1100, 1320],
        VOLUME: 0.03
    },
    BOOST: {
        FREQUENCY: 400,
        VOLUME: 0.09,
        DURATION: 500
    },
    TELEPORT: {
        FREQUENCY: 600,
        VOLUME: 0.12,
        DURATION: 800
    }
});

/**
 * Camera configuration
 * @const {Object}
 */
export const CAMERA = Object.freeze({
    FOV: 75,
    NEAR: 100,          // x1000 (0.1 -> 100)
    FAR: 10000000,      // x1000
    OFFSET: { x: 0, y: 12, z: -45 }, // Vaisseau inchangé
    LOOK_AHEAD: { x: 0, y: 0, z: 50 }, // Vaisseau inchangé
    LERP_FACTOR: 0.1
});

/**
 * UI/HUD configuration
 * @const {Object}
 */
export const UI = Object.freeze({
    MINIMAP_UPDATE_THROTTLE: 10,
    COMPASS_UPDATE_THROTTLE: 5,
    WARP_BOOST_COOLDOWN: 3000
});

/**
 * Renderer configuration
 * @const {Object}
 */
export const RENDERER = Object.freeze({
    ANTIALIAS: true,
    TONE_MAPPING: 'ACESFilmic',
    TONE_MAPPING_EXPOSURE: 1.0,
    BLOOM: {
        STRENGTH: 0.5,
        RADIUS: 0.4,
        THRESHOLD: 0.85
    }
});

/**
 * Texture generation configuration
 * @const {Object}
 */
export const TEXTURES = Object.freeze({
    PLANET: {
        SIZE: 512,
        NOISE_LAYERS: 5,
        NOISE_ITERATIONS: 200
    }
});

/**
 * Planetary gravity system
 * @const {Object}
 */
export const GRAVITY = Object.freeze({
    ENABLED_MAX_WARP: 2,        // Gravity disabled at Warp 3+
    INFLUENCE_RADIUS: 2500000,  // x1000
    BASE_STRENGTH: 0.3,         // Space Engineers style - gentle linear pull
    MIN_DISTANCE: 200000,       // x1000
    MAX_PLANETS_CHECK: 10       // Performance limit
});

/**
 * Planet name generation
 * @const {Object}
 */
export const PLANET_NAMES = Object.freeze({
    PREFIXES: ['Kepler', 'Gliese', 'HD', 'Trappist', 'Proxima', 'Wolf', 'Ross', 'Luyten'],
    SUFFIXES: ['b', 'c', 'd', 'e', 'f', 'Prime', 'Major', 'Minor', 'X', 'Y', 'Z']
});
