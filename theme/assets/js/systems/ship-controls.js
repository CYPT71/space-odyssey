/**
 * @fileoverview Ship Controls System - Clean Architecture
 * @author CYPT71
 * @version 3.1.0
 * @description Handles ship movement, rotation, physics, and autopilot
 */

import * as THREE from 'three';
import { PHYSICS, GRAVITY } from '../config/constants.js';
import { applyShipAnimations } from './animations.js';
import { loadControls as loadControlsShared } from '../config/controls.js';

// ============================================================
// CONSTANTS
// ============================================================

const WARP_SPEEDS = {
    0: 500,      // Impulse
    1: 2000,     // Warp 1
    2: 8000,     // Warp 2
    3: 27000,    // Warp 3
    4: 64000,    // Warp 4
    5: 125000,   // Warp 5
    20: 5000000  // Warp 20 (AUTOPILOT ONLY) - Extreme speed with space deformation
};

const ROTATION_CONFIG = {
    ACCELERATION: 0.002,
    DECAY: 0.92,
    MAX_BANK_ANGLE: Math.PI / 2.4, // ~75 degrees
    BANK_SPEED: 0.1,
    YAW_BANK_FACTOR: 15,
    STRAFE_BANK_FACTOR: 0.5
};

const MOVEMENT_CONFIG = {
    STRAFE_MULTIPLIER: 2.0,
    VERTICAL_MULTIPLIER: 2.0
};

const WARP_DEBOUNCE_MS = 200;

// ============================================================
// STATE MANAGEMENT
// ============================================================

/**
 * Creates ship state object
 * @returns {Object} Ship state
 */
const createShipState = () => ({
    warpLevel: 0,
    speed: 0,
    keys: {},
    lastWarpChange: 0,
    rotVel: { x: 0, y: 0, z: 0 },
    targetBankAngle: 0,
    currentBankAngle: 0,
    fineControl: false,
    mouseDelta: { x: 0, y: 0 },
    // Autopilot State
    autopilot: {
        active: false,
        targetPos: null,
        targetObj: null,
        minDistance: 15000000, // Default 15,000 km
        warp20Active: false, // Warp 20 mode
        lastDistance: null
    }
});

/**
 * Loads controls from localStorage
 * @returns {Object} Control mappings
 */
const loadControlMappings = () => {
    return loadControlsShared();
};

// ============================================================
// WARP SYSTEM
// ============================================================

/**
 * Handles warp level changes
 * @param {Object} state - Ship state
 * @param {number} delta - Change in warp level (+1 or -1)
 * @returns {boolean} True if warp changed
 */
const changeWarpLevel = (state, delta) => {
    const now = Date.now();
    if (now - state.lastWarpChange < WARP_DEBOUNCE_MS) return false;

    const newLevel = state.warpLevel + delta;

    // Forward warp limits
    if (delta > 0 && newLevel > 5) return false;
    // Reverse warp limits
    if (delta < 0 && newLevel < -3) return false;

    state.warpLevel = newLevel;
    state.speed = calculateSpeed(state.warpLevel);
    state.lastWarpChange = now;

    return true;
};

/**
 * Calculates speed from warp level
 * @param {number} warpLevel - Current warp level
 * @returns {number} Speed value
 */
const calculateSpeed = (warpLevel) => {
    if (warpLevel > 0) return WARP_SPEEDS[warpLevel];
    if (warpLevel === 0) return WARP_SPEEDS[0];
    return -WARP_SPEEDS[Math.abs(warpLevel)];
};

// ============================================================
// ROTATION SYSTEM
// ============================================================

/**
 * Applies rotational inertia
 * @param {Object} state - Ship state
 * @param {Object} controls - Control mappings
 */
const applyRotationalInertia = (state, controls) => {
    const { ACCELERATION, DECAY } = ROTATION_CONFIG;

    // Yaw (Left/Right)
    if (isKeyPressed(state, controls.yawLeft) || state.keys.ArrowLeft) {
        state.rotVel.y += ACCELERATION;
    }
    if (isKeyPressed(state, controls.yawRight) || state.keys.ArrowRight) {
        state.rotVel.y -= ACCELERATION;
    }

    // Pitch (Up/Down)
    if (isKeyPressed(state, controls.pitchUp)) state.rotVel.x += ACCELERATION;
    if (isKeyPressed(state, controls.pitchDown)) state.rotVel.x -= ACCELERATION;

    // Roll (Manual barrel rolls)
    if (isKeyPressed(state, controls.rollLeft)) state.rotVel.z += ACCELERATION;
    if (isKeyPressed(state, controls.rollRight)) state.rotVel.z -= ACCELERATION;

    // Apply decay
    state.rotVel.x *= DECAY;
    state.rotVel.y *= DECAY;
    state.rotVel.z *= DECAY;
};

/**
 * Calculates automatic banking angle
 * @param {Object} state - Ship state
 * @param {Object} controls - Control mappings
 * @returns {number} Target bank angle
 */
const calculateBankingAngle = (state, controls) => {
    const { MAX_BANK_ANGLE, YAW_BANK_FACTOR, STRAFE_BANK_FACTOR } = ROTATION_CONFIG;

    // Banking from yaw rotation
    const yawBanking = -state.rotVel.y * YAW_BANK_FACTOR;

    // Banking from strafe
    let strafeBanking = 0;
    if (isKeyPressed(state, controls.strafeLeft)) strafeBanking = -STRAFE_BANK_FACTOR;
    if (isKeyPressed(state, controls.strafeRight)) strafeBanking = STRAFE_BANK_FACTOR;

    const targetAngle = (yawBanking + strafeBanking) * MAX_BANK_ANGLE;
    return Math.max(-MAX_BANK_ANGLE, Math.min(MAX_BANK_ANGLE, targetAngle));
};

/**
 * Updates ship banking
 * @param {Object} state - Ship state
 * @param {Object} controls - Control mappings
 */
    const updateBanking = (state, controls) => {
        state.targetBankAngle = calculateBankingAngle(state, controls);
        state.currentBankAngle += (state.targetBankAngle - state.currentBankAngle) * ROTATION_CONFIG.BANK_SPEED;
        // Subtle easing for smoother transitions
        state.currentBankAngle *= 0.99;
};

/**
 * Applies rotation to ship
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} state - Ship state
 */
    const applyRotation = (shipGroup, state) => {
        shipGroup.rotation.x += state.rotVel.x;
        shipGroup.rotation.y += state.rotVel.y;
        shipGroup.rotation.z = state.currentBankAngle + (state.rotVel.z * 10);
    };

// ============================================================
// MOVEMENT SYSTEM
// ============================================================

/**
 * Applies forward/backward movement
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} state - Ship state
 */
const applyForwardMovement = (shipGroup, state) => {
    shipGroup.translateZ(state.speed);
};

/**
 * Applies strafe movement
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} state - Ship state
 * @param {Object} controls - Control mappings
 */
const applyStrafeMovement = (shipGroup, state, controls) => {
    const speed = PHYSICS.VERTICAL_SPEED * MOVEMENT_CONFIG.STRAFE_MULTIPLIER;

    if (isKeyPressed(state, controls.strafeLeft)) shipGroup.translateX(-speed);
    if (isKeyPressed(state, controls.strafeRight)) shipGroup.translateX(speed);
};

/**
 * Applies vertical movement
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} state - Ship state
 * @param {Object} controls - Control mappings
 */
const applyVerticalMovement = (shipGroup, state, controls) => {
    const speed = PHYSICS.VERTICAL_SPEED * MOVEMENT_CONFIG.VERTICAL_MULTIPLIER;

    if (isKeyPressed(state, controls.moveUp) || state.keys.Space) {
        shipGroup.translateY(speed);
    }
    if (isKeyPressed(state, controls.moveDown) || state.keys.Shift) {
        shipGroup.translateY(-speed);
    }
};

// ============================================================
// AUTOPILOT SYSTEM
// ============================================================

const updateAutopilot = (shipGroup, state) => {
    try {
        if (!state.autopilot.active) return;

        // Determine target position dynamically
        let targetPos;
        if (state.autopilot.targetObject && state.autopilot.targetObject.getWorldPosition) {
            targetPos = new THREE.Vector3();
            state.autopilot.targetObject.getWorldPosition(targetPos);
        } else if (state.autopilot.targetPos) {
            targetPos = state.autopilot.targetPos.clone();
        } else {
            console.warn('Autopilot active but no target defined');
            state.autopilot.active = false;
            return;
        }
        const currentPos = shipGroup.position;

        // Validate positions
        if (!isFinite(targetPos.x) || !isFinite(targetPos.y) || !isFinite(targetPos.z)) {
            console.error('Invalid target position in autopilot:', targetPos);
            state.autopilot.active = false;
            return;
        }

        const distance = currentPos.distanceTo(targetPos);
        // Determine stop distance based on object type
        const ud = state.autopilot.targetObject?.userData || {};
        let stopDist = 100000; // default 100 km for planets
        if (ud.isGasCloud || ud.cloudData) {
            stopDist = 500000; // 500 km for gas clouds
        } else if (ud.galaxyData || ud.isGalaxy) {
            stopDist = 200000; // approach within 200 km
        } else if (ud.isNebula) {
            stopDist = 200000; // approach within 200 km
        }
        // Safety: never below 50 km
        stopDist = Math.max(stopDist, 50000);
        state.autopilot.minDistance = stopDist;

        // Validate distance
        if (!isFinite(distance)) {
            console.error('Invalid distance in autopilot:', distance);
            state.autopilot.active = false;
            return;
        }

        // If we're not closing in (distance grows) for repeated frames, disengage
        if (state.autopilot.lastDistance !== null && distance > state.autopilot.lastDistance * 1.02) {
            console.warn('Autopilot: distance increasing, disengaging');
            state.autopilot.active = false;
            state.autopilot.warp20Active = false;
            state.speed = 0;
            state.warpLevel = 0;
            state.autopilot.lastDistance = null;
            return;
        }
        state.autopilot.lastDistance = distance;

        // Arrival check
        if (distance <= stopDist + 5000) {
            state.speed = 0;
            state.warpLevel = 0;
            state.autopilot.active = false;
            state.autopilot.warp20Active = false;
            // Face target on arrival
            if (state.autopilot.targetObject && state.autopilot.targetObject.getWorldPosition) {
                const lookPos = new THREE.Vector3();
                state.autopilot.targetObject.getWorldPosition(lookPos);
                shipGroup.lookAt(lookPos);
            } else if (state.autopilot.targetPos) {
                shipGroup.lookAt(state.autopilot.targetPos);
            }
            state.rotVel.x = state.rotVel.y = state.rotVel.z = 0;
            state.autopilot.lastDistance = null;
            console.log('Autopilot: Arrived at destination');
            return;
        }

        // Steering towards target
        const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
        const targetRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
        shipGroup.quaternion.slerp(targetRotation, 0.05);

        // Speed control with Warp 20 persistence and gradual slowdown
        let desiredWarp = 0;
        if (distance > stopDist + 200000) { // keep Warp 20 until within 200 km of stop point
            desiredWarp = 20;
            state.autopilot.warp20Active = true;
        } else {
            state.autopilot.warp20Active = false;
            if (distance > stopDist + 50000) desiredWarp = 5;
            else if (distance > stopDist + 10000) desiredWarp = 4;
            else if (distance > stopDist + 5000) desiredWarp = 3;
            else if (distance > stopDist + 2000) desiredWarp = 2;
            else if (distance > stopDist + 500) desiredWarp = 1;
            else desiredWarp = 0; // impulse for final approach
        }

        // Apply warp change
        if (state.warpLevel !== desiredWarp) {
            state.warpLevel = desiredWarp;
            state.speed = calculateSpeed(state.warpLevel);
            state.lastWarpChange = Date.now();
        }

        // Ensure forward motion
        const targetSpeed = calculateSpeed(state.warpLevel);
        if (isFinite(targetSpeed)) {
            // Smooth deceleration as we approach
            const approachFactor = Math.min(1, Math.max(0, (distance - stopDist) / (stopDist + 200000)));
            const cappedSpeed = targetSpeed * (0.2 + 0.8 * approachFactor);
            state.speed = Math.min(state.speed, cappedSpeed);
            if (state.speed < cappedSpeed) state.speed = cappedSpeed;
        }
    } catch (error) {
        console.error('Error in autopilot update:', error);
        state.autopilot.active = false;
        state.autopilot.warp20Active = false;
        state.speed = 0;
        state.warpLevel = 0;
    }
};

// ============================================================
// GRAVITY SYSTEM
// ============================================================

/**
 * Applies Space Engineers style gravity
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Array} planets - Array of planet objects
 * @param {number} warpLevel - Current warp level
 */
const applyGravityForces = (shipGroup, planets, warpLevel) => {
    // Only apply gravity at low speeds
    if (Math.abs(warpLevel) > 1) return;

    const G_FORCE = 200.0;
    const pullVector = new THREE.Vector3();

    planets.forEach(planet => {
        if (!planet.position) return;

        const planetRadius = planet.scale.x || 50000;
        const gravityRadius = planetRadius * 4.0;
        const distance = shipGroup.position.distanceTo(planet.position);

        if (distance < gravityRadius && distance > planetRadius) {
            const gravityFactor = (gravityRadius - distance) / (gravityRadius - planetRadius);

            pullVector.subVectors(planet.position, shipGroup.position)
                .normalize()
                .multiplyScalar(G_FORCE * gravityFactor);

            shipGroup.position.add(pullVector);
        }
    });
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Checks if a key is pressed (case-insensitive)
 * @param {Object} state - Ship state
 * @param {string} key - Key to check
 * @returns {boolean} True if pressed
 */
const isKeyPressed = (state, key) => {
    return state.keys[key] || state.keys[key.toUpperCase()];
};

// ============================================================
// MAIN CONTROLLER
// ============================================================

/**
 * Creates ship controls
 * @param {THREE.Object3D} shipGroup - Ship object
 * @returns {Object} Control functions
 */
export const createShipControls = (shipGroup) => {
    let controls = loadControlMappings();
    const state = createShipState();

    // Listen for control updates
    window.addEventListener('controlsUpdated', () => {
        controls = loadControlMappings();
    });

    // Keyboard event handlers
    const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        state.keys[key] = true;
        state.keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();

        // Manual input disengages autopilot
        if (state.autopilot.active && ['w', 'a', 's', 'd', 'q', 'e', 'z', 'x', 'c', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
            state.autopilot.active = false;
            console.log('Autopilot: Disengaged by manual input');
        }

        if (key === controls.forward) changeWarpLevel(state, 1);
        if (key === controls.backward) changeWarpLevel(state, -1);
    };

    const handleKeyUp = (e) => {
        const key = e.key.toLowerCase();
        state.keys[key] = false;
        state.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    /**
     * Main update loop
     * @param {boolean} isReadingMode - True if UI is open
     */
    const update = (isReadingMode) => {
        if (isReadingMode) return;

        // Emergency stop
        if (isKeyPressed(state, controls.stop)) {
            state.warpLevel = 0;
            state.speed = 0;
            state.autopilot.active = false;
        }

        if (state.autopilot.active) {
            updateAutopilot(shipGroup, state);
            applyForwardMovement(shipGroup, state);
            // Banking during autopilot?
            // We can simulate banking based on turn rate, but for now keep it stable.
            state.currentBankAngle *= 0.95; // Return to level
            applyRotation(shipGroup, state);
        } else {
            // Manual Control
            applyForwardMovement(shipGroup, state);
            applyRotationalInertia(state, controls);
            updateBanking(state, controls);
            applyRotation(shipGroup, state);
            applyStrafeMovement(shipGroup, state, controls);
            applyVerticalMovement(shipGroup, state, controls);

            if (state.fineControl) {
                // Mouse steering for fine control
                const mx = state.mouseDelta.x;
                const my = state.mouseDelta.y;
                state.rotVel.y += (-mx * 0.00001);
                state.rotVel.x += (-my * 0.00001);
                state.mouseDelta.x = 0;
                state.mouseDelta.y = 0;
                // Clamp speed to fine impulse
                const fineSpeed = WARP_SPEEDS[0] / 8;
                state.speed = Math.min(state.speed, fineSpeed);
            }
        }
        applyShipAnimations(shipGroup, state);
        // Animate impulse glows based on speed
        const engines = shipGroup.userData?.impulseEngines || [];
        const speedRatio = Math.min(1, Math.abs(state.speed) / WARP_SPEEDS[5]);
        engines.forEach(({ mesh, light }) => {
            if (mesh && mesh.material && mesh.material.emissive) {
                mesh.material.emissiveIntensity = 0.5 + speedRatio * 4;
                mesh.material.opacity = 0.6 + speedRatio * 0.4;
            }
            if (light) {
                light.intensity = speedRatio * 5;
            }
        });
    };

    /**
     * Apply gravity from planets
     * @param {Array} planets - Planet objects
     */
    const applyGravity = (planets) => {
        applyGravityForces(shipGroup, planets, state.warpLevel);
    };

    // Public API
    return {
        update,
        applyGravity,
        getSpeed: () => state.speed,
        getWarpFactor: () => state.warpLevel,
        isFineControlActive: () => state.fineControl,
        setFineControl: (on) => { state.fineControl = !!on; },
        applyMouseDelta: (dx, dy) => {
            state.mouseDelta.x += dx;
            state.mouseDelta.y += dy;
        },
        setSpeed: (speed) => { state.speed = speed; },
        activateWarpBoost: () => {
            state.warpLevel = 5;
            state.speed = WARP_SPEEDS[5];
        },
        engageAutopilot: (targetPos, minDistance = 15000000, targetObject = null) => {
            state.autopilot.active = true;
            state.autopilot.targetPos = targetPos;
            state.autopilot.targetObject = targetObject;
            state.autopilot.minDistance = minDistance;
            console.log('Autopilot: Engaged', targetPos, minDistance, targetObject?.userData);
        },
        disengageAutopilot: () => {
            state.autopilot.active = false;
            state.autopilot.warp20Active = false;
        },
        isWarp20Active: () => state.autopilot.warp20Active
    };
};
