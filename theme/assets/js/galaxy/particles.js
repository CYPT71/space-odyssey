/**
 * @fileoverview Spiral galaxy particle system
 * @author CYPT71
 * @version 2.0.0
 */

import * as THREE from 'three';

/**
 * Creates spiral galaxy particles (functional)
 * @param {number} count - Number of particles
 * @param {number} color - Galaxy color
 * @param {number} size - Galaxy size
 * @returns {THREE.Points} Particle system
 */
export const createSpiralParticles = (count, color, size = 100) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < count; i++) {
        // Spiral parameters
        const t = i / count;
        const angle = t * Math.PI * 4; // 2 full rotations
        const radius = t * size;

        // Add randomness for natural look
        const radiusVariation = (Math.random() - 0.5) * 20;
        const heightVariation = (Math.random() - 0.5) * 30;

        // Spiral position
        positions[i * 3] = Math.cos(angle) * (radius + radiusVariation);
        positions[i * 3 + 1] = heightVariation;
        positions[i * 3 + 2] = Math.sin(angle) * (radius + radiusVariation);

        // Color variation (brighter towards center)
        const brightness = 1 - t * 0.5;
        colors[i * 3] = baseColor.r * brightness;
        colors[i * 3 + 1] = baseColor.g * brightness;
        colors[i * 3 + 2] = baseColor.b * brightness;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    return new THREE.Points(geometry, material);
};

/**
 * Animates spiral galaxy rotation
 * @param {THREE.Points} particles - Particle system
 * @param {number} speed - Rotation speed
 * @returns {void}
 */
export const animateGalaxyRotation = (particles, speed = 0.001) => {
    particles.rotation.y += speed;
};

/**
 * Creates galaxy core glow
 * @param {number} color - Core color
 * @param {number} intensity - Glow intensity
 * @returns {THREE.PointLight} Core light
 */
export const createGalaxyCore = (color, intensity = 2) => {
    const light = new THREE.PointLight(color, intensity, 150);
    light.position.set(0, 0, 0);
    return light;
};
