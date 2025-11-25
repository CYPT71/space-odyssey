/**
 * @fileoverview Gas Cloud System for Blogs
 * @author CYPT71
 * @description Creates volumetric gas clouds for posts categories with nebulae
 */

import * as THREE from 'three';
import { createNebula } from './nebula-system.js';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';

/**
 * Creates a gas cloud (volumetric particle system) for a blog category
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} center - Center position
 * @param {string} categoryName - Category name
 * @param {number} postCount - Number of posts
 * @returns {THREE.Points} The gas cloud
 */
export function createGasCloud(scene, center, categoryName, postCount) {
    const particleCount = Math.min(postCount * 500, 5000); // More particles than nebulae
    const radius = 100000 + (postCount * 20000); // Larger clouds for more posts

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Generate category-specific color
    const cloudColor = hashStringToColor(categoryName);

    // Create volumetric distribution (more dense at center)
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Spherical distribution with density falloff
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.pow(Math.random(), 0.5); // Square root for volume distribution

        // Local space positions; we position the whole cloud at 'center'
        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        // Color with variation (more variation at edges)
        const distRatio = r / radius;
        const variation = distRatio * 0.3;
        colors[i3] = cloudColor.r + (Math.random() - 0.5) * variation;
        colors[i3 + 1] = cloudColor.g + (Math.random() - 0.5) * variation;
        colors[i3 + 2] = cloudColor.b + (Math.random() - 0.5) * variation;

        // Varying particle sizes (larger at center)
        sizes[i] = 800 * (1 - distRatio * 0.5);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 800,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const gasCloud = new THREE.Points(geometry, material);
    gasCloud.position.copy(center);

    gasCloud.userData = {
        isGasCloud: true,
        categoryName: categoryName,
        postCount: postCount,
        center: center.clone()
    };

    // Label for gas cloud
    const div = document.createElement('div');
    div.className = 'planet-label';
    div.textContent = categoryName.toUpperCase();
    const label = new CSS2DObject(div);
    label.position.set(0, 20000, 0);
    gasCloud.add(label);

    scene.add(gasCloud);
    return gasCloud;
}

/**
 * Hash string to color
 * @param {string} str - String to hash
 * @returns {Object} RGB color
 */
function hashStringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = (hash % 360) / 360;
    const s = 0.6;
    const l = 0.5;

    // HSL to RGB
    const hslToRgb = (h, s, l) => {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r, g, b };
    };

    return hslToRgb(h, s, l);
}

/**
 * Creates all gas clouds for posts categories
 * @param {THREE.Scene} scene - The scene
 * @param {Object} postsData - Parsed posts data from parser
 * @returns {Array} Array of created gas clouds
 */
export function createBlogGasClouds(scene, postsData) {
    const gasClouds = [];
    const cloudNames = Object.keys(postsData.gasClouds);

    cloudNames.forEach((cloudName, index) => {
        const cloudData = postsData.gasClouds[cloudName];
        const totalPosts = cloudData.posts.length +
            Object.values(cloudData.nebulae).reduce((sum, neb) => sum + neb.posts.length, 0);

        // Position gas clouds in a ring formation
        const angle = (index / cloudNames.length) * Math.PI * 2;
        const radius = 1500000; // Far from galaxies
        const center = new THREE.Vector3(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 200000,
            Math.sin(angle) * radius
        );

        const gasCloud = createGasCloud(scene, center, cloudName, totalPosts);
        // Attach full data for UI/journal
        gasCloud.userData.cloudData = cloudData;
        gasClouds.push(gasCloud);

        // Helper: recursively create nebulae hierarchy under this gas cloud
        const createNebulaTree = (parentGroup, parentCenter, nebulaNode, index, count, level = 0) => {
            const angle = (index / Math.max(count, 1)) * Math.PI * 2;
            const radius = 50000 * Math.max(1, 1.2 - level * 0.1);
            const centerPos = new THREE.Vector3(
                parentCenter.x + Math.cos(angle) * radius,
                parentCenter.y,
                parentCenter.z + Math.sin(angle) * radius
            );
            const neb = createNebula(scene, centerPos, nebulaNode.name, (nebulaNode.posts || []).length);
            neb.userData.parentGasCloud = cloudName;
            neb.userData.posts = nebulaNode.posts || [];
            parentGroup.add(neb);

            const children = Object.values(nebulaNode.nebulae || {});
            children.forEach((child, i) => createNebulaTree(neb, centerPos, child, i, children.length, level + 1));
        };

        const topNebulae = Object.values(cloudData.nebulae);
        if (topNebulae.length === 0 && cloudData.posts?.length) {
            // Default single cluster
            const neb = createNebula(scene, center.clone(), 'cluster', cloudData.posts.length);
            neb.userData.parentGasCloud = cloudName;
            neb.userData.posts = cloudData.posts;
            gasCloud.add(neb);
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
        }
    });
}
