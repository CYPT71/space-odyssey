/**
 * @fileoverview Nebula System - Tag-based Clustering
 * @author CYPT71
 * @description Creates visual nebulae that cluster blog posts by tags
 */

import * as THREE from 'three';

/**
 * Creates a nebula (particle cloud) for a tag cluster
 * @param {THREE.Scene} scene - The scene
 * @param {THREE.Vector3} center - Center position
 * @param {string} tagName - Tag name
 * @param {number} postCount - Number of posts in this tag
 * @returns {THREE.Points} The nebula particle system
 */
export function createNebula(scene, center, tagName, postCount) {
    const particleCount = Math.min(postCount * 100, 1000); // Max 1000 particles
    const radius = 50000 + (postCount * 10000); // Larger for more posts

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Generate tag-specific color from hash
    const tagColor = hashStringToColor(tagName);

    // Generate particles in spherical distribution
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Spherical distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.cbrt(Math.random()); // Cubic root for uniform volume distribution

        positions[i3] = center.x + r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = center.y + r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = center.z + r * Math.cos(phi);

        // Color with slight variation
        colors[i3] = tagColor.r + (Math.random() - 0.5) * 0.2;
        colors[i3 + 1] = tagColor.g + (Math.random() - 0.5) * 0.2;
        colors[i3 + 2] = tagColor.b + (Math.random() - 0.5) * 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create material
    const material = new THREE.PointsMaterial({
        size: 5000, // Increased size for visibility
        vertexColors: true,
        transparent: true,
        opacity: 0.8, // Increased opacity
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });

    const nebula = new THREE.Points(geometry, material);

    // Store metadata
    nebula.userData = {
        isNebula: true,
        tagName: tagName,
        postCount: postCount,
        center: center.clone()
    };

    scene.add(nebula);
    return nebula;
}

/**
 * Hash a string to a consistent color
 * @param {string} str - String to hash
 * @returns {Object} RGB color object
 */
function hashStringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to HSL for better color distribution
    const h = (hash % 360) / 360;
    const s = 0.7; // High saturation
    const l = 0.6; // Medium lightness

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
        }
    });
}
