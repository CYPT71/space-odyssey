/**
 * @fileoverview High-Performance Asteroid System
 * @author CYPT71
 * @description Uses InstancedMesh and Generators for infinite asteroid fields
 * @version 1.0.0 (JS Core Edition)
 */

import * as THREE from 'three';

/**
 * Generator function that yields random asteroid transforms
 * Lazy evaluation allows infinite generation without memory overhead
 * @param {THREE.Vector3} center - Center of the field
 * @param {number} radius - Radius of the field
 */
function* asteroidGenerator(center, radius) {
    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    while (true) {
        // Random position in sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * radius; // Cube root for uniform distribution

        tempPos.set(
            center.x + r * Math.sin(phi) * Math.cos(theta),
            center.y + r * Math.sin(phi) * Math.sin(theta),
            center.z + r * Math.cos(phi)
        );

        // Random rotation
        tempQuat.setFromEuler(new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            'XYZ'
        ));

        // Random scale (irregular)
        const scaleBase = 50 + Math.random() * 200; // Big asteroids
        tempScale.set(
            scaleBase * (0.8 + Math.random() * 0.4),
            scaleBase * (0.8 + Math.random() * 0.4),
            scaleBase * (0.8 + Math.random() * 0.4)
        );

        yield { position: tempPos, rotation: tempQuat, scale: tempScale };
    }
}

/**
 * Creates an asteroid field using InstancedMesh
 * @param {THREE.Scene} scene - The scene
 * @param {number} count - Number of asteroids
 * @param {THREE.Vector3} position - Center position
 */
export const createAsteroidField = (scene, count = 1000, position = new THREE.Vector3()) => {
    // Low-poly asteroid geometry (Icosahedron is good for rocks)
    const geometry = new THREE.IcosahedronGeometry(1, 1); // Detail level 1

    // Perturb vertices for rock look (Vertex displacement)
    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
        const x = posAttribute.getX(i);
        const y = posAttribute.getY(i);
        const z = posAttribute.getZ(i);
        // Simple noise
        const noise = 1 + (Math.random() - 0.5) * 0.2;
        posAttribute.setXYZ(i, x * noise, y * noise, z * noise);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true // Low-poly look
    });

    // InstancedMesh for performance (1 draw call for 1000 asteroids)
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // If we wanted to move them

    // Use Generator to populate
    const generator = asteroidGenerator(position, 50000); // 50k radius field
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
        const { position: pos, rotation: rot, scale: scl } = generator.next().value;

        dummy.position.copy(pos);
        dummy.rotation.copy(rot);
        dummy.scale.copy(scl);
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Add to scene
    scene.add(mesh);

    return mesh;
};
