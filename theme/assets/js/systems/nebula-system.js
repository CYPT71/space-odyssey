/**
 * @fileoverview Nebula System - Tag-based Clustering
 * @author CYPT71
 * @description Creates visual nebulae that cluster posts posts by tags
 */

import * as THREE from 'three';
import { createVolumetricCloud, hashStringToColor } from './volumetric-cloud-factory.js';
import { NEBULA_VISUAL } from '../config/visual-config.js';
import { applyPulseScale } from '../effects/visual-effects.js';

/**
 * Creates a nebula (particle cloud) for a tag cluster
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} center - Center position
 * @param {string} tagName - Tag name
 * @param {number} postCount - Number of posts in this tag
 * @returns {THREE.Points} The nebula particle system
 */
/**
 * Creates a nebula (particle cloud) for a tag cluster
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} center - Center position
 * @param {string} tagName - Tag name
 * @param {number} postCount - Number of posts in this tag
 * @param {THREE.Color} [parentColor] - Base color from parent (optional)
 * @returns {THREE.Points} The nebula particle system
 */
const NEBULA_CONFIG = Object.freeze({
    particleMultiplier: NEBULA_VISUAL.particleMultiplier,
    particleCap: NEBULA_VISUAL.particleCap,
    baseRadius: NEBULA_VISUAL.baseRadius,      // Enlarged for easier targeting
    radiusPerUnit: NEBULA_VISUAL.radiusPerUnit,    // Scales up faster with posts count
    distributionPower: NEBULA_VISUAL.distributionPower,
    baseColorFn: (name, parentColor) => {
        if (parentColor) {
            const hsl = {};
            parentColor.getHSL(hsl);
            return new THREE.Color().setHSL((hsl.h + 0.05) % 1.0, hsl.s, Math.min(1, hsl.l + 0.1));
        }
        return hashStringToColor(name);
    },
    colorJitterFn: (baseColor, _distRatio, scratch) => {
        scratch.copy(baseColor);
        scratch.r += (Math.random() - 0.5) * 0.1;
        scratch.g += (Math.random() - 0.5) * 0.1;
        scratch.b += (Math.random() - 0.5) * 0.1;
        return scratch;
    },
    material: {
        size: 4000,
        opacity: 0.6
    },
    labelClass: 'planet-label',
    labelTextFn: (name) => (name || 'Nebula').toUpperCase(),
    labelHeightFn: (radius) => radius * 0.8,
    spaceType: 'nebula'
});

export function createNebula(scene, center, tagName, postCount, parentColor = null) {
    const nebula = createVolumetricCloud({
        center,
        name: tagName,
        count: postCount,
        config: NEBULA_CONFIG,
        parentColor,
        extraUserData: {
            isNebula: true,
            isGalaxy: false,
            spaceType: 'nebula',
            nebulaName: tagName,
            tagName: tagName,
            postCount: postCount
        }
    });

    // VISUALIZE FILES (POSTS)
    nebula.visualizePosts = (posts) => {
        if (!posts || posts.length === 0) return;

        const radius = nebula.userData?.radius || (NEBULA_CONFIG.baseRadius + postCount * NEBULA_CONFIG.radiusPerUnit);
        const fileGeo = new THREE.BufferGeometry();
        const filePos = new Float32Array(posts.length * 3);

        posts.forEach((post, i) => {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * 0.6 * Math.cbrt(Math.random()); // Inner 60%

            filePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            filePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            filePos[i * 3 + 2] = r * Math.cos(phi);
        });

        fileGeo.setAttribute('position', new THREE.BufferAttribute(filePos, 3));
        const fileMat = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2000, // Bright stars
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const filePoints = new THREE.Points(fileGeo, fileMat);
        nebula.add(filePoints);
    };

    scene.add(nebula);
    return nebula;
}

/**
 * Clusters posts by tags and creates nebulae
 * @param {THREE.Scene} scene - The scene
 * @param {Array} posts - Array of post objects with tags
 * @returns {Array} Array of created nebulae
 */
export function createTagNebulae(scene, posts) {
    // Group posts by tags
    const tagClusters = new Map();

    posts.forEach(post => {
        if (!post.tags || !Array.isArray(post.tags)) return;

        post.tags.forEach(tag => {
            if (!tagClusters.has(tag)) {
                tagClusters.set(tag, []);
            }
            tagClusters.get(tag).push(post);
        });
    });

    const nebulae = [];

    // Create nebula for each tag cluster
    tagClusters.forEach((clusterPosts, tagName) => {
        if (clusterPosts.length < 2) return; // Need at least 2 posts for a nebula

        // Calculate center position (average of all posts in cluster)
        const center = new THREE.Vector3();
        clusterPosts.forEach(post => {
            if (post.position) {
                center.add(post.position);
            }
        });
        center.divideScalar(clusterPosts.length);

        // Create nebula
        const nebula = createNebula(scene, center, tagName, clusterPosts.length);
        // Visualize posts inside this nebula
        if (clusterPosts.length > 0) {
            nebula.visualizePosts(clusterPosts);
        }
        nebulae.push(nebula);

        console.log(`✨ Created nebula for tag "${tagName}" with ${clusterPosts.length} posts`);
    });

    return nebulae;
}

/**
 * Animates nebulae (slow rotation)
 * @param {Array} nebulae - Array of nebula objects
 * @param {number} delta - Delta time
 */
export function updateNebulae(nebulae, delta) {
    nebulae.forEach(nebula => {
        if (nebula.userData?.isNebula) {
            // Slow rotation around Y axis
            nebula.rotation.y += delta * 0.05;
            const time = Date.now() * 0.001;
            applyPulseScale(nebula, time, 0.8, 0.08);
        }
    });
}
