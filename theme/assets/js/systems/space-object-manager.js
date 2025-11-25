/**
 * @fileoverview Unified Space Object Manager
 * @author CYPT71
 * @description Manages both galaxies (pages) and gas clouds (posts) with shared logic
 * @version 3.0.0
 */

import * as THREE from 'three';
import { parseSpaceTree } from '../domain/space-tree.js';
import { createGalaxy, updateGalaxy } from '../galaxy/renderer.js';
import { createNavigationSystem } from '../galaxy/navigation.js';
import { createPlanetLikeProcedural } from '../entities/planet-factory.js';
import { createGalaxyTrails, createAnimatedTrails, updateAnimatedTrails } from './galaxy-trails.js';
import { createBlogGasClouds, updateGasClouds } from './gas-cloud-system.js';
import { getObjectType, getDetectionRange } from '../core/space-object-utils.js';

/**
 * Space object types
 */
const OBJECT_TYPES = {
    GALAXY: 'galaxy',
    GAS_CLOUD: 'gasCloud',
    PLANET: 'planet',
    POST: 'post'
};

/**
 * Creates unified space object manager
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Object} audioSystem - Audio system
 * @returns {Object} Space object manager functions
 */
export const createSpaceObjectManager = (scene, audioSystem) => {
    let spaceTree = null;
    let galaxies = [];
    let gasClouds = [];
    let rootPlanets = [];
    let animatedTrails = [];
    const navigation = createNavigationSystem(audioSystem);

    // Type and range helpers come from core utils

    /**
     * Hash string to color
     * @param {string} str - String to hash
     * @returns {THREE.Color} Color
     */
    const hashToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = (hash % 360) / 360;
        return new THREE.Color().setHSL(hue, 0.7, 0.6);
    };

    /**
     * Creates root planets (files directly in /)
     * @param {Array} files - Root files
     * @returns {Array} Planet meshes
     */
    const createRootPlanets = (files) => {
        if (!files) return [];
        return files.map((file, i) => {
            const angle = (i / files.length) * Math.PI * 2;
            const radius = 3000000 + Math.random() * 7000000;
            const height = (Math.random() - 0.5) * 1500000;
            const displayTitle = file.tiitle || file.title || file.name;

            const mesh = createPlanetLikeProcedural({ name: displayTitle, url: file.url });
            mesh.position.set(
                Math.cos(angle) * radius + (Math.random() - 0.5) * 500000,
                height,
                Math.sin(angle) * radius + (Math.random() - 0.5) * 500000
            );

            mesh.userData = {
                ...mesh.userData,
                planetData: { ...file, title: displayTitle },
                objectType: OBJECT_TYPES.PLANET
            };

            return mesh;
        });
    };

    /**
     * Creates galaxies from parsed data
     * @param {Object} galaxiesData - Galaxies data
     * @returns {Array} Galaxy objects
     */
    const createGalaxies = (galaxiesData) => {
        const galaxyArray = Object.values(galaxiesData);

        return galaxyArray.map((galaxyData, i) => {
            const angle = (i / galaxyArray.length) * Math.PI * 2;
            const radius = 3000000; // galaxies further apart to prevent overlaps

            const galaxy = createGalaxy(galaxyData, {
                x: Math.cos(angle) * radius,
                y: 0,
                z: Math.sin(angle) * radius
            });

            // Create trails for this galaxy
            if (galaxy.planets && galaxy.planets.length > 1) {
                const galaxyColor = hashToColor(galaxy.data.name);
                createGalaxyTrails(scene, galaxy.planets, galaxyColor);

                const animTrail = createAnimatedTrails(scene, galaxy.planets, galaxyColor);
                if (animTrail) {
                    animatedTrails.push(animTrail);
                }
            }

            // Mark the underlying Three.js group as a galaxy for lookups/HUD
            if (galaxy.group && galaxy.group.userData) {
                galaxy.group.userData.objectType = OBJECT_TYPES.GALAXY;
            }
            return galaxy;
        });
    };

    /**
 * Creates gas clouds from blog data
 * @param {Object} blogsData - blogs data
 * @returns {Array} Gas cloud objects
 */
    const createGasCloudsFromBlogs = (blogsData) => {
        // Gas-cloud system now creates clouds and nebulae
        return createBlogGasClouds(scene, blogsData);
    };

    /**
     * Initializes space objects from file system
     */
    const initialize = () => {
        if (!window.fileSystem) {
            console.warn('⚠️ No file system data found');
            return;
        }

        console.log('🚀 Initializing space objects...');

        const populateFromTree = (tree) => {
            spaceTree = tree;
            navigation.setGalaxyTree(spaceTree);
            console.log('📊 Parsed space tree:', spaceTree);

            // Create root planets
            rootPlanets = createRootPlanets(spaceTree.root.files);
            rootPlanets.forEach(planet => scene.add(planet));
            console.log(`🌍 Created ${rootPlanets.length} root planets`);

            // Create galaxies (from /)
            galaxies = createGalaxies(spaceTree.root.galaxies);
            galaxies.forEach(galaxy => scene.add(galaxy.group));
            console.log(`🌌 Created ${galaxies.length} galaxies`);

            // Create gas clouds (from /posts/)
            if (spaceTree.blogs && Object.keys(spaceTree.blogs.gasClouds).length > 0) {
                console.log(`🌫️ Creating gas clouds from blogs:`, spaceTree.blogs);
                gasClouds = createGasCloudsFromBlogs(spaceTree.blogs);
                console.log(`🌫️ Created ${gasClouds.length} gas clouds`);
            } else {
                console.log('⚠️ No blog data found for gas clouds');
            }

            console.log(`✨ Total: ${galaxies.length} galaxies, ${gasClouds.length} gas clouds`);
        };

        // Optional: offload parse to Web Worker for responsiveness
        try {
            if (window.Worker) {
                const worker = new Worker(new URL('../workers/parse-worker.js', import.meta.url), { type: 'module' });
                worker.onmessage = (e) => {
                    console.log('🧵 Worker parsed tree');
                    populateFromTree(e.data);
                };
                worker.onerror = (err) => {
                    console.error('Parse worker failed, falling back:', err);
                    populateFromTree(parseSpaceTree(window.fileSystem));
                };
                worker.postMessage({ files: window.fileSystem });
            } else {
                populateFromTree(parseSpaceTree(window.fileSystem));
            }
        } catch (e) {
            console.warn('Worker parse unavailable, using main thread:', e);
            populateFromTree(parseSpaceTree(window.fileSystem));
        }
    };

    /**
     * Updates all space objects
     */
    const update = () => {
        // Update galaxies
        galaxies.forEach(galaxy => updateGalaxy(galaxy));

        // Update animated trails
        animatedTrails.forEach(trail => {
            updateAnimatedTrails(trail, 0.016);
        });

        // Update gas clouds
        updateGasClouds(gasClouds, 0.016);
    };

    /**
     * Gets all objects (planets, galaxies, gas clouds, nebulae)
     * @returns {Array} All space objects
     */
    const getAllObjects = () => {
        const all = [...rootPlanets];

        // Collect all planet meshes contained in a galaxy group, including
        // direct children and any nested sub-galaxies. We don't rely on
        // a "galaxy.planets" array because the renderer currently only
        // returns { group, particles }.
        const collectPlanets = (galaxy) => {
            // Traverse the entire galaxy group and add anything that carries
            // planet metadata. This is robust regardless of nesting depth.
            galaxy.group.traverse(node => {
                const ud = node.userData || {};
                if (ud.planetData) {
                    all.push(node);
                }
                if (ud.isGalaxy) {
                    all.push(node);
                }
            });
        };

        galaxies.forEach(galaxy => {
            collectPlanets(galaxy);
            all.push(galaxy.group);
        });

        all.push(...gasClouds);

        // Add nebulae from scene
        scene.traverse(obj => {
            const ud = obj.userData || {};
            if (ud.isNebula) all.push(obj);
        });

        return all;
    };

    /**
     * Finds closest object to position
     * @param {THREE.Vector3} position - Position to check
     * @returns {Object|null} Closest object data
     */
    const findClosest = (position) => {
        const all = getAllObjects();
        let closest = null;
        let minDist = Infinity;
        const scratchPos = new THREE.Vector3();

        all.forEach(obj => {
            const ud = obj.userData || {};
            const type = getObjectType(ud);
            if (type === 'unknown') return;

            obj.getWorldPosition(scratchPos);
            const dist = position.distanceTo(scratchPos);

            const range = getDetectionRange(type);
            if (dist < range && dist < minDist) {
                minDist = dist;
                closest = {
                    distance: dist,
                    planetData: ud.planetData,
                    galaxyData: ud.galaxyData,
                    cloudData: ud.cloudData,
                    isGasCloud: ud.isGasCloud,
                    isNebula: ud.isNebula,
                    type,
                    obj
                };
            }
        });

        return closest;
    };

    return {
        initialize,
        update,
        getAllObjects,
        findClosest,
        getTree: () => spaceTree,
        getGalaxies: () => galaxies,
        getGasClouds: () => gasClouds
    };
};

// Legacy export for compatibility
export const createGalaxyManager = createSpaceObjectManager;
