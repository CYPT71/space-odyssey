/**
 * Planet Factory - creates planets consistent with procedural ones
 */

import * as THREE from 'three';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';
import { addAtmosphere } from '../systems/atmosphere-system.js';
import { openObjectTerminal } from '../core/hud-utils.js';
import { isMobile } from '../utils/device.js';

/**
 * Creates a planet mesh similar to procedural planets
 * @param {Object} opts
 * @param {string} opts.name - Planet display name
 * @param {string} [opts.url] - Optional URL to attach in userData
 * @param {number} [opts.size] - Planet radius scale (defaults 100k-500k)
 * @param {THREE.Color|number} [opts.color] - Base color (random if omitted)
 * @returns {THREE.Mesh}
 */
export function createPlanetLikeProcedural({ name, url, size, color } = {}) {
    // Size similar to procedural planets
    const planetSize = size ?? (100000 + Math.random() * 400000);

    // Random color if needed
    const baseColor = new THREE.Color();
    if (color instanceof THREE.Color) baseColor.copy(color);
    else if (typeof color === 'number') baseColor.set(color);
    else baseColor.setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.4);

    // Geometry/material consistent with procedural planets
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.8,
        metalness: 0.2
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(planetSize, planetSize, planetSize);

    // Atmosphere similar to procedural planets (80% chance)
    if (Math.random() > 0.2) {
        addAtmosphere(mesh, {
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
            intensity: 0.5 + Math.random() * 0.5,
            power: 3.0 + Math.random() * 2.0,
            size: 1.1 + Math.random() * 0.1
        });
    }

    // Label
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = name || 'Planet';
    div.style.pointerEvents = 'auto';
    div.style.cursor = 'pointer';
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isMobile()) return;
        if (openObjectTerminal(mesh)) return;
        if (window.teleportTo) window.teleportTo(mesh.uuid);
    });
    const label = new CSS2DObject(div);
    label.position.set(0, planetSize * 1.2, 0);
    mesh.add(label);

    // Rotation speed: smaller rotate faster
    const rotationSpeed = (1 / planetSize) * 1e-4;

    mesh.userData = mesh.userData || {};
    mesh.userData.rotationSpeed = rotationSpeed;
    mesh.userData.planetData = {
        name: name || 'Planet',
        title: name || 'Planet',
        url
    };

    return mesh;
}
