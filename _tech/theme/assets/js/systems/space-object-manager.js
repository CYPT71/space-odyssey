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
import { createPostsGasClouds, updateGasClouds } from './gas-cloud-system.js';
import { getObjectType, getDetectionRange } from '../core/space-object-utils.js';
import { Octree } from '../core/octree.js';
import { startMark, endMark, getDuration } from '../core/profiler.js';
import { OBJECT_TYPES } from '../config/types.js';
import { dist3 } from '../native/fast-math.js';

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
    const octree = new Octree(15000000000); // 15 billion units (accommodates 8B galaxy spacing + 4B galaxy size)

    const hashFiles = (files) => {
        if (!Array.isArray(files)) return 0;
        let hash = 0;
        files.forEach(f => {
            const str = `${f.path || ''}|${f.url || ''}`;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
        });
        return hash;
    };

    const loadCachedTree = (hash) => {
        try {
            const raw = localStorage.getItem('spaceTreeCache');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed.hash !== hash) return null;
            return parsed.tree;
        } catch (_) {
            return null;
        }
    };

    const saveCachedTree = (hash, tree) => {
        try {
            localStorage.setItem('spaceTreeCache', JSON.stringify({ hash, tree }));
        } catch (_) {
            /* ignore */
        }
    };

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

        const placed = [];
        const MIN_SEPARATION = 2_000_000; // 2 Mm to keep planets from touching

        return files.map((file, i) => {
            let angle = (i / files.length) * Math.PI * 2;
            let radius = 8000000 + Math.random() * 20000000; // 8-28M units (proportional to 8B galaxy spacing)
            let height = (Math.random() - 0.5) * 4000000; // +/- 4M height

            // Rejection sampling to avoid overlap with already placed planets
            const tryPlace = (attempts = 24) => {
                let chosen = { x: 0, y: 0, z: 0 };
                for (let n = 0; n < attempts; n++) {
                    const ang = angle + (Math.random() - 0.5) * 0.4; // small jitter
                    const rad = radius + (Math.random() - 0.5) * 1_000_000; // tighten distribution
                    const h = height + (Math.random() - 0.5) * 200_000;
                    const x = Math.cos(ang) * rad + (Math.random() - 0.5) * 300_000;
                    const z = Math.sin(ang) * rad + (Math.random() - 0.5) * 300_000;
                    const y = h;
                    const tooClose = placed.some(p => dist3(p.x, p.y, p.z, x, y, z) < MIN_SEPARATION);
                    if (!tooClose) {
                        chosen = { x, y, z };
                        return chosen;
                    }
                }
                // Fallback: accept last sampled position even if close
                return chosen;
            };
            const pos = tryPlace();

            const displayTitle = file.tiitle || file.title || file.name;

            const mesh = createPlanetLikeProcedural({ name: displayTitle, url: file.url });
            mesh.position.set(pos.x, pos.y, pos.z);
            placed.push({ x: pos.x, y: pos.y, z: pos.z });

            mesh.userData = {
                ...mesh.userData,
                planetData: { ...file, title: displayTitle },
                objectType: OBJECT_TYPES.PLANET,
                distFn: (vec) => dist3(mesh.position.x, mesh.position.y, mesh.position.z, vec.x, vec.y, vec.z)
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
            const radius = 8000000000; // 8 billion units (reduced from 30B)

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
 * Creates gas clouds from posts data
 * @param {Object} postsData - posts data
 * @returns {Array} Gas cloud objects
 */
    const createGasCloudsFromposts = (postsData) => {
        // Gas-cloud system now creates clouds and nebulae
        return createPostsGasClouds(scene, postsData);
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
            if (spaceTree.posts && Object.keys(spaceTree.posts.gasClouds).length > 0) {
                console.log(`🌫️ Creating gas clouds from posts:`, spaceTree.posts);
                gasClouds = createGasCloudsFromposts(spaceTree.posts);
                console.log(`🌫️ Created ${gasClouds.length} gas clouds`);
            } else {
                console.log('⚠️ No posts data found for gas clouds');
            }

            console.log(`✨ Total: ${galaxies.length} galaxies, ${gasClouds.length} gas clouds`);

            // Build Octree
            const allObjects = getAllObjects();
            octree.rebuild(allObjects);
            console.log(`🌳 Octree built with ${allObjects.length} objects`);
        };

        // Optional: offload parse to Web Worker for responsiveness
        try {
            const hash = hashFiles(window.fileSystem);
            const cached = loadCachedTree(hash);

            const parseAndPopulate = () => {
                const tree = parseSpaceTree(window.fileSystem);
                saveCachedTree(hash, tree);
                populateFromTree(tree);
            };

            if (cached) {
                console.log('🗃️ Loaded cached SpaceTree');
                populateFromTree(cached);
                return;
            }

            const workerUrl = '/_tech/theme/assets/js/workers/parse-worker.js';

            if (window.Worker) {
                const worker = new Worker(workerUrl, { type: 'module' });
                worker.onmessage = (e) => {
                    if (e.data && e.data.error) {
                        console.warn('Parse worker returned error, falling back:', e.data.error);
                        parseAndPopulate();
                        return;
                    }
                    console.log('🧵 Worker parsed tree');
                    saveCachedTree(hash, e.data);
                    populateFromTree(e.data);
                };
                worker.onerror = (err) => {
                    console.error('Parse worker failed, falling back:', err);
                    parseAndPopulate();
                };
                worker.postMessage({ files: window.fileSystem, hash });
            } else {
                parseAndPopulate();
            }
        } catch (e) {
            console.warn('Worker parse unavailable, using main thread:', e);
            const hash = hashFiles(window.fileSystem);
            const cached = loadCachedTree(hash);
            if (cached) {
                console.log('🗃️ Loaded cached SpaceTree');
                populateFromTree(cached);
            } else {
                const tree = parseSpaceTree(window.fileSystem);
                saveCachedTree(hash, tree);
                populateFromTree(tree);
            }
        }
    };

    /**
     * Updates all space objects
     */
    const update = () => {
        startMark('galaxies');
        galaxies.forEach(galaxy => updateGalaxy(galaxy));
        endMark('galaxies');

        startMark('trails');
        animatedTrails.forEach(trail => {
            updateAnimatedTrails(trail, 0.016);
        });
        endMark('trails');

        startMark('gasClouds');
        updateGasClouds(gasClouds, 0.016);
        endMark('gasClouds');

        const g = getDuration('galaxies');
        const c = getDuration('gasClouds');
        const t = getDuration('trails');
        if (g > 10 || c > 10 || t > 10) {
            console.warn('⏱️ Frame budget warning', {
                galaxies: g?.toFixed?.(2),
                gasClouds: c?.toFixed?.(2),
                trails: t?.toFixed?.(2)
            });
        }
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
    /**
     * Finds closest object to position using Octree
     * @param {THREE.Vector3} position - Position to check
     * @returns {Object|null} Closest object data
     */
    const findClosest = (position) => {
        // Use Octree for fast spatial query
        // Search radius: start large, but Octree prunes efficiently
        const maxSearchDist = 50000000; // 50M units
        const closestObj = octree.findClosest(position, maxSearchDist);

        if (!closestObj) return null;

        const ud = closestObj.userData || {};
        const type = getObjectType(ud);
        if (type === 'unknown') return null;

        const scratchPos = new THREE.Vector3();
        closestObj.getWorldPosition(scratchPos);
        const dist = position.distanceTo(scratchPos);
        const range = getDetectionRange(type);

        // Return the closest object even if it's slightly outside range,
        // so HUD/targeting never goes blank in sparse scenes.
        return {
            distance: dist,
            planetData: ud.planetData,
            galaxyData: ud.galaxyData,
            cloudData: ud.cloudData,
            isGasCloud: ud.isGasCloud,
            isNebula: ud.isNebula,
            type,
            obj: closestObj,
            inRange: range ? dist < range : true
        };
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
