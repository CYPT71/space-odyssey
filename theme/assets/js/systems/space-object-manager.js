/**
 * @fileoverview Unified Space Object Manager
 * @author CYPT71
 * @description Manages both galaxies (pages) and gas clouds (blogs) with shared logic
 * @version 3.0.0
 */

import * as THREE from 'three';
import { parseFileSystem } from '../galaxy/parser.js';
import { createGalaxy, updateGalaxy } from '../galaxy/renderer.js';
import { createNavigationSystem } from '../galaxy/navigation.js';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';
import { createGalaxyTrails, createAnimatedTrails, updateAnimatedTrails } from './galaxy-trails.js';
import { createBlogGasClouds, updateGasClouds } from './gas-cloud-system.js';
import { createNebula } from './nebula-system.js';

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
            const radius = 2000000 + Math.random() * 6000000;
            const height = (Math.random() - 0.5) * 1000000;
            const size = 50000 + Math.random() * 70000;

            const geometry = new THREE.IcosahedronGeometry(size, 3);
            const material = new THREE.MeshStandardMaterial({
                color: 0x00F0FF,
                emissive: 0x00F0FF,
                emissiveIntensity: 0.6,
                metalness: 0.4,
                roughness: 0.6
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                Math.cos(angle) * radius + (Math.random() - 0.5) * 500000,
                height,
                Math.sin(angle) * radius + (Math.random() - 0.5) * 500000
            );

            const div = document.createElement('div');
            div.className = 'planet-label';
            div.textContent = file.title || file.name;
            const label = new CSS2DObject(div);
            label.position.set(0, size + 10000, 0);
            mesh.add(label);

            mesh.userData = {
                planetData: file,
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
            const radius = 800000;

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

            galaxy.userData = { objectType: OBJECT_TYPES.GALAXY };
            return galaxy;
        });
    };

    /**
     * Creates gas clouds from blog data
     * @param {Object} blogsData - Blogs data
     * @returns {Array} Gas cloud objects
     */
    const createGasCloudsFromBlogs = (blogsData) => {
        // Use the exported function from gas-cloud-system.js
        const clouds = createBlogGasClouds(scene, blogsData);

        // Also create nebulae synchronously
        const cloudNames = Object.keys(blogsData.gasClouds);
        cloudNames.forEach((cloudName, index) => {
            const cloudData = blogsData.gasClouds[cloudName];

            // Position for this gas cloud
            const angle = (index / cloudNames.length) * Math.PI * 2;
            const radius = 1500000;
            const center = new THREE.Vector3(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 200000,
                Math.sin(angle) * radius
            );

            // Create nebulae within gas cloud
            Object.keys(cloudData.nebulae).forEach((nebulaName, nebulaIndex) => {
                const nebulaData = cloudData.nebulae[nebulaName];
                const nebulaAngle = (nebulaIndex / Object.keys(cloudData.nebulae).length) * Math.PI * 2;
                const nebulaRadius = 50000;
                const nebulaCenter = new THREE.Vector3(
                    center.x + Math.cos(nebulaAngle) * nebulaRadius,
                    center.y,
                    center.z + Math.sin(nebulaAngle) * nebulaRadius
                );

                const nebula = createNebula(scene, nebulaCenter, nebulaName, nebulaData.posts.length);
                nebula.userData.parentGasCloud = cloudName;
                console.log(`✨ Created nebula "${nebulaName}" in gas cloud "${cloudName}"`);
            });
        });

        return clouds;
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

        // Parse file system
        spaceTree = parseFileSystem(window.fileSystem);
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

        const collectPlanets = (galaxy) => {
            if (galaxy.planets) all.push(...galaxy.planets);

            // Check for sub-galaxies in the group's children
            galaxy.group.children.forEach(child => {
                if (child.userData?.isGalaxy) {
                    // It's a sub-galaxy group, we need to find its planets
                    // The renderer structure wraps sub-galaxies in groups
                    // We can traverse or check userData
                    // Ideally, the renderer should expose sub-galaxy objects in a structured way
                    // For now, let's traverse the group to find planets
                    child.traverse(grandChild => {
                        if (grandChild.userData?.objectType === OBJECT_TYPES.PLANET) {
                            all.push(grandChild);
                        }
                    });
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
            if (obj.userData?.isNebula) {
                all.push(obj);
            }
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
            if (!obj.userData.planetData && !obj.userData.galaxyData && !obj.userData.cloudData) return;

            obj.getWorldPosition(scratchPos);
            const dist = position.distanceTo(scratchPos);

            if (dist < minDist && dist < 500000) {
                minDist = dist;
                closest = {
                    distance: dist,
                    planetData: obj.userData.planetData,
                    galaxyData: obj.userData.galaxyData,
                    cloudData: obj.userData.cloudData,
                    type: obj.userData.objectType || (obj.userData.planetData ? 'planet' : 'galaxy'),
                    obj: obj
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
        getGalaxies: () => galaxies,
        getGasClouds: () => gasClouds
    };
};

// Legacy export for compatibility
export const createGalaxyManager = createSpaceObjectManager;
