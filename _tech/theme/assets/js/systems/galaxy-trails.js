/**
 * @fileoverview Galaxy Trail System
 * @author CYPT71
 * @description Creates visual trails connecting planets within the same galaxy
 */

import * as THREE from 'three';

/**
 * Creates a trail (line) between two planets
 * @param {THREE.Vector3} start - Start position
 * @param {THREE.Vector3} end - End position
 * @param {THREE.Color} color - Trail color
 * @returns {THREE.Line} The trail line
 */
function createTrail(start, end, color) {
    // Create curved path between planets (Catmull-Rom spline)
    const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

    // Add some randomness to the curve
    const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 50000,
        (Math.random() - 0.5) * 50000,
        (Math.random() - 0.5) * 50000
    );
    midPoint.add(offset);

    // Create curve with multiple points for smooth line
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const curvePoints = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
        linewidth: 2,
        blending: THREE.AdditiveBlending
    });

    const trail = new THREE.Line(geometry, material);
    trail.userData.isTrail = true;

    return trail;
}

/**
 * Creates trails connecting all planets in a galaxy
 * @param {THREE.Scene} scene - The scene
 * @param {Array} planets - Array of planet meshes in the galaxy
 * @param {THREE.Color} galaxyColor - Color theme for the galaxy
 * @returns {THREE.Group} Group containing all trails
 */
export function createGalaxyTrails(scene, planets, galaxyColor) {
    if (!planets || planets.length < 2) return null;

    const trailGroup = new THREE.Group();
    trailGroup.userData.isTrailGroup = true;

    // Connect each planet to its nearest neighbors (not all-to-all to avoid clutter)
    planets.forEach((planet, index) => {
        // Find 2-3 nearest neighbors
        const distances = planets
            .map((other, otherIndex) => ({
                planet: other,
                index: otherIndex,
                distance: planet.userData?.distFn
                    ? planet.userData.distFn(other.position)
                    : planet.position.distanceTo(other.position)
            }))
            .filter(d => d.index !== index)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3); // Connect to 3 nearest neighbors

        distances.forEach(({ planet: neighbor }) => {
            // Only create trail if we haven't already created one from the neighbor
            // (to avoid duplicate trails)
            if (planets.indexOf(neighbor) > index) {
                const trail = createTrail(
                    planet.position.clone(),
                    neighbor.position.clone(),
                    galaxyColor
                );
                trailGroup.add(trail);
            }
        });
    });

    scene.add(trailGroup);
    return trailGroup;
}

/**
 * Creates animated particle trails along the lines
 * @param {THREE.Scene} scene - The scene
 * @param {Array} planets - Array of planet meshes
 * @param {THREE.Color} galaxyColor - Color theme
 * @returns {THREE.Points} Particle system for animated trails
 */
export function createAnimatedTrails(scene, planets, galaxyColor) {
    if (!planets || planets.length < 2) return null;

    const particleCount = planets.length * 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    // Create particles along trail paths
    let particleIndex = 0;
    planets.forEach((planet, index) => {
        if (index === planets.length - 1) return;

        const nextPlanet = planets[index + 1];
        const particlesPerTrail = 50;

        for (let i = 0; i < particlesPerTrail; i++) {
            const t = i / particlesPerTrail;
            const pos = new THREE.Vector3().lerpVectors(
                planet.position,
                nextPlanet.position,
                t
            );

            const i3 = particleIndex * 3;
            positions[i3] = pos.x;
            positions[i3 + 1] = pos.y;
            positions[i3 + 2] = pos.z;

            colors[i3] = galaxyColor.r;
            colors[i3 + 1] = galaxyColor.g;
            colors[i3 + 2] = galaxyColor.b;

            // Store velocity for animation
            velocities.push({
                start: planet.position.clone(),
                end: nextPlanet.position.clone(),
                progress: t
            });

            particleIndex++;
        }
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 300,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = {
        isAnimatedTrail: true,
        velocities: velocities
    };

    scene.add(particles);
    return particles;
}

/**
 * Updates animated trail particles
 * @param {THREE.Points} trailParticles - The particle system
 * @param {number} delta - Delta time
 */
export function updateAnimatedTrails(trailParticles, delta) {
    if (!trailParticles || !trailParticles.userData.isAnimatedTrail) return;

    const positions = trailParticles.geometry.attributes.position.array;
    const velocities = trailParticles.userData.velocities;

    velocities.forEach((vel, index) => {
        // Animate particle along path
        vel.progress += delta * 0.2;
        if (vel.progress > 1) vel.progress = 0;

        const i3 = index * 3;
        const pos = new THREE.Vector3().lerpVectors(vel.start, vel.end, vel.progress);

        positions[i3] = pos.x;
        positions[i3 + 1] = pos.y;
        positions[i3 + 2] = pos.z;
    });

    trailParticles.geometry.attributes.position.needsUpdate = true;
}

/**
 * Removes all trails from a scene
 * @param {THREE.Scene} scene - The scene
 */
export function removeAllTrails(scene) {
    const toRemove = [];
    scene.traverse(obj => {
        if (obj.userData.isTrail || obj.userData.isTrailGroup || obj.userData.isAnimatedTrail) {
            toRemove.push(obj);
        }
    });

    toRemove.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        scene.remove(obj);
    });
}
