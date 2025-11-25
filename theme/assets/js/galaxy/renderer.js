/**
 * @fileoverview Galaxy renderer (functional)
 * @author CYPT71
 * @version 2.0.0
 */

import * as THREE from 'three';
import { createSpiralParticles, createGalaxyCore } from './particles.js';
import { getGalaxyColor, countPlanets } from './parser.js';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';

/**
 * Creates a planet mesh
 * @param {Object} data - Planet data
 * @returns {THREE.Mesh} Planet mesh
 */
const createPlanetMesh = (data) => {
    const geometry = new THREE.IcosahedronGeometry(data.size || 5, 1);
    const material = new THREE.MeshStandardMaterial({
        color: data.color || 0x00F0FF,
        emissive: data.color || 0x00F0FF,
        emissiveIntensity: 0.5,
        roughness: 0.7,
        metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);

    // Label
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = data.name;
    const label = new CSS2DObject(div);
    label.position.set(0, data.size + 10000, 0); // x1000
    mesh.add(label);

    // ROTATION: Vitesse variable selon la taille
    const rotationSpeed = (1 / (data.size || 5)) * 0.0001;
    mesh.userData = {
        planetData: data,
        rotationSpeed: rotationSpeed
    };

    return mesh;
};

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

    // Spiral particles - ULTRA MASSIVE SCALE
    const particles = createSpiralParticles(planetCount * 100, color, 200000); // x1000 size
    group.add(particles);

    // Core glow - ULTRA MASSIVE
    const core = createGalaxyCore(color, 3000); // x1000 size
    group.add(core);

    // Planets in orbit (randomized 3D positions) - ULTRA MASSIVE
    galaxyData.files.forEach((file, i) => {
        const angle = (i / galaxyData.files.length) * Math.PI * 2;
        const radius = 100000 + Math.random() * 100000; // x1000: 100k-200k units
        const height = (Math.random() - 0.5) * 150000; // x1000: ±75k units

        // VARIED SIZES: 10k-30k units diameter (x1000)
        const size = 10000 + Math.random() * 20000;

        const planet = createPlanetMesh({
            name: file.title || file.name,
            url: file.url,
            size: size,
            color: color,
            position: {
                x: Math.cos(angle) * radius + (Math.random() - 0.5) * 50000,
                y: height,
                z: Math.sin(angle) * radius + (Math.random() - 0.5) * 50000
            }
        });

        group.add(planet);
    });

    // Sub-galaxies - ULTRA MASSIVE SCALE
    const subGalaxies = Object.values(galaxyData.subGalaxies);
    subGalaxies.forEach((subGalaxy, i) => {
        const angle = (i / subGalaxies.length) * Math.PI * 2;
        const radius = 300000; // x1000: Much further out

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
    galaxyLabel.position.set(0, 250000, 0); // x1000: Much higher
    group.add(galaxyLabel);

    group.position.set(position.x, position.y, position.z);

    group.userData = {
        galaxyData,
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
