/**
 * @fileoverview Gas Cloud System for posts
 * @author CYPT71
 * @description Creates volumetric gas clouds for posts categories with nebulae
 */

import * as THREE from 'three';
import { createNebula } from './nebula-system.js';
import { createVolumetricCloud, hashStringToColor } from './volumetric-cloud-factory.js';
import { GAS_CLOUD_VISUAL } from '../config/visual-config.js';
import { applyPulseScale } from '../effects/visual-effects.js';

/**
 * Creates a gas cloud (volumetric particle system) for a posts category
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} center - Center position
 * @param {string} categoryName - Category name
 * @param {number} postCount - Number of posts
 * @returns {THREE.Points} The gas cloud
 */
const GAS_CLOUD_CONFIG = Object.freeze({
    particleMultiplier: GAS_CLOUD_VISUAL.particleMultiplier,
    particleCap: GAS_CLOUD_VISUAL.particleCap,
    baseRadius: GAS_CLOUD_VISUAL.baseRadius,
    radiusPerUnit: GAS_CLOUD_VISUAL.radiusPerUnit,
    distributionPower: 0.5,
    baseColorFn: (name) => hashStringToColor(name),
    colorJitterFn: (baseColor, distRatio, scratch) => {
        const variation = distRatio * 0.3;
        scratch.copy(baseColor);
        scratch.r += (Math.random() - 0.5) * variation;
        scratch.g += (Math.random() - 0.5) * variation;
        scratch.b += (Math.random() - 0.5) * variation;
        return scratch;
    },
    sizeFn: (distRatio) => 800 * (1 - distRatio * 0.5),
    material: {
        size: 800,
        opacity: 0.4
    },
    labelClass: 'planet-label',
    labelTextFn: (name) => name.toUpperCase(),
    labelHeightFn: () => 20000,
    spaceType: 'nebula'
});

export function createGasCloud(scene, center, categoryName, postCount) {
    const gasCloud = createVolumetricCloud({
        center,
        name: categoryName,
        count: postCount,
        config: GAS_CLOUD_CONFIG,
        extraUserData: {
            isGasCloud: true,
            isGalaxy: false,
            spaceType: 'nebula',
            cloudName: categoryName,
            postCount
        }
    });

    scene.add(gasCloud);
    return gasCloud;
}

/**
 * Creates all gas clouds for posts categories
 * @param {THREE.Scene} scene - The scene
 * @param {Object} postsData - Parsed posts data from parser
 * @returns {Array} Array of created gas clouds
 */
export function createPostsGasClouds(scene, postsData) {
    const gasClouds = [];
    const cloudNames = Object.keys(postsData.gasClouds);

    const collectPostsDeep = (node) => {
        const own = Array.isArray(node.posts) ? node.posts : [];
        const children = Object.values(node.nebulae || {}).flatMap(collectPostsDeep);
        return own.concat(children);
    };


    cloudNames.forEach((cloudName, index) => {
        const cloudData = postsData.gasClouds[cloudName];
        const totalPosts = cloudData.posts.length +
            Object.values(cloudData.nebulae).reduce((sum, neb) => sum + neb.posts.length, 0);

        // Position gas clouds in a ring formation
        const angle = (index / cloudNames.length) * Math.PI * 2;
        const radius = 4000000000; // 4 billion units (proportional to 8B galaxy spacing)
        const center = new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 500000000, // +/- 500M height
            Math.sin(angle) * radius
        );

        const gasCloud = createGasCloud(scene, center, cloudName, totalPosts);
        // Attach full data for UI/journal
        gasCloud.userData.cloudData = cloudData;
        gasClouds.push(gasCloud);

        // Helper: recursively create nebulae hierarchy under this gas cloud
        const createNebulaTree = (
            parentGroup,
            parentCenter,
            nebulaNode,
            index,
            count,
            level = 0,
            parentColor = null
        ) => {
            // Spread nodes using golden-angle to avoid overlap; randomize radial offset for inner nebulae
            const goldenAngle = Math.PI * (3 - Math.sqrt(5));
            const angle = index * goldenAngle;
            const baseRadius = 160000 * (1 + level * 0.8);
            const jitter = 40000 * Math.random();
            const radius = baseRadius + jitter;
            const vertical = (Math.random() - 0.5) * 50000 * Math.max(1, 1 + level * 0.3);

            // Position relative to parent center (local offset)
            const centerPos = new THREE.Vector3(
                Math.cos(angle) * radius,
                vertical,
                Math.sin(angle) * radius
            );

            // Create a group for this nebula node
            const nodeGroup = new THREE.Group();
            nodeGroup.position.copy(centerPos);

            // Create the actual nebula mesh *inside* this group
            const neb = createNebula(
                scene,
                new THREE.Vector3(0, 0, 0), // local position inside the group
                nebulaNode.name,
                collectPostsDeep(nebulaNode).length,
                parentColor
            );

            neb.userData.parentGasCloud = cloudName;
            neb.userData.posts = collectPostsDeep(nebulaNode);

            if (neb.userData.posts.length > 0 && typeof neb.visualizePosts === "function") {
                neb.visualizePosts(neb.userData.posts);
            }

            // Attach nebula mesh to its group
            nodeGroup.add(neb);

            // Attach this node group to its parent
            parentGroup.add(nodeGroup);

            // Children
            const children = Object.values(nebulaNode.nebulae || {});

            children.forEach((child, i) => {
                createNebulaTree(
                    nodeGroup,                // children attach to this node's group
                    centerPos,                // this node's world center
                    child,
                    i,
                    children.length,
                    level + 1,
                    neb.userData.baseColor    // pass color down
                );
            });
        };


        const topNebulae = Object.values(cloudData.nebulae);
        if (topNebulae.length === 0 && cloudData.posts?.length) {
            // Default single cluster
            const neb = createNebula(scene, new THREE.Vector3(0, 0, 0), 'cluster', cloudData.posts.length);
            neb.userData.parentGasCloud = cloudName;
            neb.userData.posts = cloudData.posts;
            gasCloud.add(neb); // attach at cloud origin
        } else {
            topNebulae.forEach((node, i) => createNebulaTree(gasCloud, center, node, i, topNebulae.length, 0));
        }
    });

    return gasClouds;
}

/**
 * Animates gas clouds (slow rotation and pulsing)
 * @param {Array} gasClouds - Array of gas cloud objects
 * @param {number} delta - Delta time
 */
export function updateGasClouds(gasClouds, delta) {
    gasClouds.forEach(cloud => {
        if (cloud.userData?.isGasCloud) {
            // Slow rotation
            cloud.rotation.y += delta * 0.02;
            cloud.rotation.x += delta * 0.01;

            // Pulsing opacity
            const time = Date.now() * 0.001;
            cloud.material.opacity = 0.3 + Math.sin(time) * 0.1;
            applyPulseScale(cloud, time, 0.6, 0.05);
        }
    });
}
