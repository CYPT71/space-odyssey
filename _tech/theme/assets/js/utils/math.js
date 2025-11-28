/**
 * @fileoverview Mathematical utilities with optional WASM acceleration.
 * Uses fast-math wrappers when available; falls back to JS.
 */
import { dist3, lerpFast, clampFast, smoothstepFast, mag3Fast } from '../native/fast-math.js';

/**
 * Mathematical utility functions
 */
export class MathUtils {
    /**
     * Clamps a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return clampFast(value, min, max);
    }

    /**
     * Linear interpolation
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    static lerp(start, end, t) {
        return lerpFast(start, end, t);
    }

    /**
     * Maps a value from one range to another
     * @param {number} value - Input value
     * @param {number} inMin - Input range minimum
     * @param {number} inMax - Input range maximum
     * @param {number} outMin - Output range minimum
     * @param {number} outMax - Output range maximum
     * @returns {number} Mapped value
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * Generates a random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Generates a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    }

    /**
     * Converts degrees to radians
     * @param {number} degrees - Degrees
     * @returns {number} Radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Converts radians to degrees
     * @param {number} radians - Radians
     * @returns {number} Degrees
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Calculates distance between two 3D points
     * @param {Object} p1 - First point {x, y, z}
     * @param {Object} p2 - Second point {x, y, z}
     * @returns {number} Distance
     */
    static distance3D(p1, p2) {
        return dist3(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }

    /**
     * Smoothstep interpolation
     * @param {number} edge0
     * @param {number} edge1
     * @param {number} x
     * @returns {number}
     */
    static smoothstep(edge0, edge1, x) {
        return smoothstepFast(edge0, edge1, x);
    }

    /**
     * Random float in range [min, max]
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    static randomRange(min, max) {
        return this.random(min, max);
    }

    /**
     * Magnitude of a 3D vector
     * @param {Object} p - Point {x,y,z}
     * @returns {number} Length
     */
    static magnitude3D(p) {
        return mag3Fast(p.x, p.y, p.z);
    }
}
