/**
 * @fileoverview Procedural Planet Generator
 * @author CYPT71
 * @description Creates random planets to populate the space scene
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { addAtmosphere } from '../systems/atmosphere-system.js';
import { openObjectTerminal } from '../core/hud/index.js';
import { isMobile } from '../utils/device.js';

// Planet name generators
const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Omega'];
const suffixes = ['Prime', 'Secundus', 'Tertius', 'Major', 'Minor', 'Proxima', 'Ultima'];

/**
 * Creates procedural planets with atmospheres
 * @param {number} count - Number of planets to generate
 * @returns {Array<THREE.Mesh>} Array of planet meshes
 */
export function createProceduralPlanets(count = 100) {
    const planets = [];
    const MIN_ATTEMPTS = 50;
    const MIN_SEPARATION_UNITS = 150_000; // ~150 km safety bubble between planet centers

    for (let i = 0; i < count; i++) {
        // Random planet size (MUCH LARGER - 100k to 500k units)
        const size = 100000 + Math.random() * 400000;

        // Random position in FULL 3D SPACE (not just a plane)
        // Extended galaxy distances: 10M to 100M units
    const BASE_RADIUS = 10_000_000;
    const RADIUS_SPREAD = 90_000_000;
    const radius = BASE_RADIUS + Math.random() * RADIUS_SPREAD;
        const theta = Math.random() * Math.PI * 2; // Full horizontal rotation
        const phi = Math.acos(2 * Math.random() - 1); // Full vertical distribution (spherical)

        // Random color
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.4);

        // Create geometry and material
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8,
            metalness: 0.2
        });

        // Create mesh and set size
        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(size, size, size);

        // Position planet in full 3D space
        const basePos = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        // Simple separation to avoid overlaps
        let chosenPos = basePos;
        for (let attempt = 0; attempt < MIN_ATTEMPTS; attempt++) {
            const tooClose = planets.some(p => {
                const otherSize = p.scale.x; // uniform scale
                const minDist = Math.max((size + otherSize) * 1.5, MIN_SEPARATION_UNITS);
                return p.position.distanceTo(chosenPos) < minDist;
            });
            if (!tooClose) break;
            // Re-roll position
            const r = BASE_RADIUS + Math.random() * RADIUS_SPREAD;
            const t = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            chosenPos = new THREE.Vector3(
                r * Math.sin(ph) * Math.cos(t),
                r * Math.sin(ph) * Math.sin(t),
                r * Math.cos(ph)
            );
        }
        mesh.position.copy(chosenPos);

        // === ADD ATMOSPHERE (JS CORE STYLE) ===
        // Randomize atmosphere properties
        const hasAtmosphere = Math.random() > 0.2; // 80% chance
        if (hasAtmosphere && typeof THREE.ShaderMaterial === 'function') {
            addAtmosphere(mesh, {
                color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5), // Random vivid color
                intensity: 0.5 + Math.random() * 0.5,
                power: 3.0 + Math.random() * 2.0,
                size: 1.1 + Math.random() * 0.1 // 1.1x to 1.2x planet size
            });
        }

        // Generate random name
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNumber = Math.floor(Math.random() * 1000);
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const name = `${randomPrefix}-${randomNumber} ${randomSuffix}`;

        // Add label above planet
        const div = document.createElement('div');
        div.className = 'planet-label';
        div.textContent = name;
        div.style.pointerEvents = 'auto';
        div.style.cursor = 'pointer';
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isMobile()) return;
            if (openObjectTerminal(mesh)) return;
            if (window.teleportTo) window.teleportTo(mesh.uuid);
        });
        const label = new CSS2DObject(div);
        label.position.set(0, size * 1.2, 0);
        mesh.add(label);

        // Add rotation speed (smaller planets rotate faster)
    const rotationSpeed = (1 / size) * 1e-4;

        // Store planet data
        mesh.userData = {
            isProcedural: true,
            rotationSpeed: rotationSpeed,
            planetData: {
                name: name,
                description: "Procedural Planet. No data available."
            }
        };

        planets.push(mesh);
    }

    return planets;
}
