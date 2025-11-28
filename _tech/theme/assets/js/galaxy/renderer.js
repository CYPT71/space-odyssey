/**
 * @fileoverview Galaxy renderer (functional)
 * @author CYPT71
 * @version 2.0.0
 */

import * as THREE from 'three';
import { createSpiralParticles, createGalaxyCore } from './particles.js';
import { getGalaxyColor, countPlanets } from '../domain/space-tree.js';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';
import { createPlanetLikeProcedural } from '../entities/planet-factory.js';

/**
 * Creates a planet mesh
 * @param {Object} data - Planet data
 * @returns {THREE.Mesh} Planet mesh
 */
const createPlanetMesh = (data) => {
    const mesh = createPlanetLikeProcedural({ name: data.name, url: data.url, color: data.color });
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    return mesh;
};

// Generate non-overlapping planet positions using simple rejection sampling
function generatePlanetPositions(count, baseRadius, heightRange, minSeparation) {
    const positions = [];
    const maxTries = 128; // Increased attempts for better placement

    for (let i = 0; i < count; i++) {
        let placed = false;
        let bestPos = null;
        let bestMinDist = 0;

        for (let t = 0; t < maxTries && !placed; t++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = baseRadius * (1.0 + (Math.random() - 0.5) * 0.4) + Math.random() * 60000;
            const height = (Math.random() - 0.5) * heightRange;
            const pos = new THREE.Vector3(
                Math.cos(angle) * radius + (Math.random() - 0.5) * 50000,
                height,
                Math.sin(angle) * radius + (Math.random() - 0.5) * 50000
            );

            // Find minimum distance to existing planets
            let minDist = Infinity;
            for (let j = 0; j < positions.length; j++) {
                const dist = pos.distanceTo(positions[j]);
                if (dist < minDist) minDist = dist;
            }

            // If no existing planets, or distance is acceptable
            if (positions.length === 0 || minDist >= minSeparation) {
                positions.push(pos);
                placed = true;
            } else if (minDist > bestMinDist) {
                // Track best attempt for fallback
                bestMinDist = minDist;
                bestPos = pos;
            }
        }

        if (!placed && bestPos) {
            // Use best attempt (maximizes distance even if below minSeparation)
            console.warn(`Planet ${i}: Could not maintain ${minSeparation / 1000}km separation, using ${Math.round(bestMinDist / 1000)}km`);
            positions.push(bestPos);
        } else if (!placed) {
            // Last resort: place far from center
            const fallbackAngle = (i / count) * Math.PI * 2;
            const fallbackRadius = baseRadius * 1.5;
            positions.push(new THREE.Vector3(
                Math.cos(fallbackAngle) * fallbackRadius,
                (Math.random() - 0.5) * heightRange,
                Math.sin(fallbackAngle) * fallbackRadius
            ));
        }
    }
    return positions;
}

/**
 * Creates a galaxy (functional)
 * @param {Object} galaxyData - Galaxy data
 * @param {Object} position - Galaxy position
 * @returns {Object} Galaxy group and metadata
 */
export const createGalaxy = (galaxyData, position = { x: 0, y: 0, z: 0 }) => {
    const group = new THREE.Group();
    const color = getGalaxyColor(galaxyData.name);
    const planetCount = countPlanets(galaxyData);

    // Spiral particles - more space in galaxies
    const particles = createSpiralParticles(planetCount * 180, color, 800000);
    group.add(particles);

    // Core glow - ULTRA MASSIVE
    const core = createGalaxyCore(color, 18000);
    group.add(core);

    // Planets in orbit (randomized 3D positions) - MASSIVE GALAXIES
    const baseRadius = 6000000; // Increased spacing for intra-galaxy planets
    const heightRange = 800000; // +/- 800M height variation
    const minSep = 120000; // Larger minimum separation for clearer gaps
    const positions = generatePlanetPositions(galaxyData.files.length, baseRadius, heightRange, minSep);
    galaxyData.files.forEach((file, i) => {
        const pos = positions[i];
        const displayName = file.tiitle || file.title || file.name;
        const planet = createPlanetMesh({
            name: displayName,
            title: displayName,
            url: file.url,
            color: color,
            position: { x: pos.x, y: pos.y, z: pos.z }
        });
        group.add(planet);
    });

    // Sub-galaxies - ULTRA MASSIVE SCALE
    const subGalaxies = Object.values(galaxyData.subGalaxies);
    subGalaxies.forEach((subGalaxy, i) => {
        const angle = (i / subGalaxies.length) * Math.PI * 2;
        const radius = 2000000; // push sub-galaxies further from core

        const subGroupResult = createGalaxy(subGalaxy, {
            x: Math.cos(angle) * radius,
            y: 0,
            z: Math.sin(angle) * radius
        });

        // Scale down sub-galaxies slightly
        subGroupResult.group.scale.set(0.7, 0.7, 0.7);
        group.add(subGroupResult.group);
    });

    // Galaxy label - ULTRA HIGH for massive scale
    const labelDiv = document.createElement('div');
    labelDiv.className = 'galaxy-label';
    labelDiv.textContent = `🌌 ${galaxyData.name.toUpperCase()}`;
    const galaxyLabel = new CSS2DObject(labelDiv);
    galaxyLabel.position.set(0, 400000, 0);
    group.add(galaxyLabel);

    group.position.set(position.x, position.y, position.z);

    group.userData = {
        galaxyData,
        galaxyName: galaxyData.name,
        particles,
        isGalaxy: true
    };

    return { group, particles };
};

/**
 * Updates galaxy animation
 * @param {Object} galaxy - Galaxy object
 * @returns {void}
 */
export const updateGalaxy = (galaxy) => {
    if (galaxy.particles) {
        galaxy.particles.rotation.y += 0.001;
    }
};
