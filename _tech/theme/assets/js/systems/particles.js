// Particles System Module
// Manages starfield, colorful lights, and speed trails

const STARFIELD_SPAN = 1e8; // 100,000,000 units
const UNIVERSE_SIZE = 1e8; // cube size for wrapping

import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene, shipGroup) {
        this.scene = scene;
        this.shipGroup = shipGroup;

        // Create particle systems
        this.starMesh = this.createStarfield();
        this.lightParticles = this.createLightParticles();
        this.trailParticles = this.createSpeedTrails();

        this.lightParticlesCount = 200;
        this.maxTrailParticles = 100;
        this.trailIndex = 0;
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 50000; // RÉDUIT de 100k à 50k (densité plus réaliste)
        const posArray = new Float32Array(starsCount * 3);
        const colorArray = new Float32Array(starsCount * 3); // COULEURS

        for (let i = 0; i < starsCount; i++) {
            // Positions - Volume initial (scaled to match wrapping size)
            posArray[i * 3] = (Math.random() - 0.5) * STARFIELD_SPAN; // 100M units
            posArray[i * 3 + 1] = (Math.random() - 0.5) * STARFIELD_SPAN;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * STARFIELD_SPAN;

            // COULEURS VARIÉES (étoiles bleues, rouges, jaunes, blanches)
            const starType = Math.random();
            if (starType < 0.1) {
                // Étoiles bleues (chaudes) - 10%
                colorArray[i * 3] = 0.7;
                colorArray[i * 3 + 1] = 0.8;
                colorArray[i * 3 + 2] = 1.0;
            } else if (starType < 0.25) {
                // Étoiles rouges (froides) - 15%
                colorArray[i * 3] = 1.0;
                colorArray[i * 3 + 1] = 0.5;
                colorArray[i * 3 + 2] = 0.3;
            } else if (starType < 0.4) {
                // Étoiles jaunes (comme le soleil) - 15%
                colorArray[i * 3] = 1.0;
                colorArray[i * 3 + 1] = 0.9;
                colorArray[i * 3 + 2] = 0.7;
            } else {
                // Étoiles blanches (majorité) - 60%
                colorArray[i * 3] = 1.0;
                colorArray[i * 3 + 1] = 1.0;
                colorArray[i * 3 + 2] = 1.0;
            }
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3)); // COULEURS

        // Material with sizeAttenuation for warp effect
        this.starMaterial = new THREE.PointsMaterial({
            size: 1500, // Taille standard
            vertexColors: true, // ACTIVER LES COULEURS
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const starMesh = new THREE.Points(starsGeometry, this.starMaterial);

        // CRUCIAL: Disable frustum culling to prevent stars from disappearing
        // when the original bounding box goes off-screen.
        // Since we move stars manually in the shader/JS, the bounding box is outdated.
        starMesh.frustumCulled = false;

        this.scene.add(starMesh);
        this.starsCount = starsCount; // Store for update
        return starMesh;
    }

    createLightParticles() {
        const geometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(this.lightParticlesCount * 3);
        const colorArray = new Float32Array(this.lightParticlesCount * 3);

        for (let i = 0; i < this.lightParticlesCount; i++) {
            posArray[i * 3] = (Math.random() - 0.5) * 3000000; // x1000
            posArray[i * 3 + 1] = (Math.random() - 0.5) * 3000000; // x1000
            posArray[i * 3 + 2] = (Math.random() - 0.5) * 3000000; // x1000

            const hue = Math.random();
            const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const material = new THREE.PointsMaterial({
            size: 3000, // x1000
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        return particles;
    }

    createSpeedTrails() {
        const geometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(this.maxTrailParticles * 3);
        const colorArray = new Float32Array(this.maxTrailParticles * 3);

        for (let i = 0; i < this.maxTrailParticles; i++) {
            posArray[i * 3] = 0;
            posArray[i * 3 + 1] = 0;
            posArray[i * 3 + 2] = 0;

            const ratio = i / this.maxTrailParticles;
            colorArray[i * 3] = 0.5 + ratio * 0.5;
            colorArray[i * 3 + 1] = 0.9 + ratio * 0.1;
            colorArray[i * 3 + 2] = 1.0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const material = new THREE.PointsMaterial({
            size: 2000, // x1000
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        return particles;
    }

    update(speed, isWarp20 = false) {
        // === WARP TRAILS EFFECT ===
        const absSpeed = Math.abs(speed);

        // WARP 20: EXTREME SPACE DEFORMATION
        if (isWarp20) {
            // Massive star stretching and tunnel effect
            this.starMaterial.size = 8000; // Huge stretched stars
            this.starMaterial.opacity = 1.0; // Maximum brightness

            // Add pulsing effect
            const pulse = Math.sin(Date.now() * 0.01) * 0.2;
            this.starMaterial.size += pulse * 2000;
        }
        // Warp 3+ effects
        else if (absSpeed > 27000) {
            const warpIntensity = Math.min((absSpeed - 27000) / 98000, 1);
            this.starMaterial.size = 1500 + (warpIntensity * 3000);
            this.starMaterial.opacity = 0.8 + (warpIntensity * 0.2);
        }
        // Normal
        else {
            this.starMaterial.size = 1500;
            this.starMaterial.opacity = 0.8;
        }

        // === INFINITE STARFIELD LOGIC (SEAMLESS MODULO) ===
        // Use modulo arithmetic to create a seamless infinite universe
        // The stars are placed in a giant cube that repeats infinitely

        const positions = this.starMesh.geometry.attributes.position.array;
        const shipPos = this.shipGroup.position;

        const HALF_SIZE = UNIVERSE_SIZE / 2;

        for (let i = 0; i < this.starsCount; i++) {
            let x = positions[i * 3];
            let y = positions[i * 3 + 1];
            let z = positions[i * 3 + 2];

            // Calculate relative position to ship
            const dx = x - shipPos.x;
            const dy = y - shipPos.y;
            const dz = z - shipPos.z;

            // Wrap X
            if (dx < -HALF_SIZE) positions[i * 3] += UNIVERSE_SIZE;
            else if (dx > HALF_SIZE) positions[i * 3] -= UNIVERSE_SIZE;

            // Wrap Y
            if (dy < -HALF_SIZE) positions[i * 3 + 1] += UNIVERSE_SIZE;
            else if (dy > HALF_SIZE) positions[i * 3 + 1] -= UNIVERSE_SIZE;

            // Wrap Z
            if (dz < -HALF_SIZE) positions[i * 3 + 2] += UNIVERSE_SIZE;
            else if (dz > HALF_SIZE) positions[i * 3 + 2] -= UNIVERSE_SIZE;
        }
        this.starMesh.geometry.attributes.position.needsUpdate = true;

        // Update light particles
        const lightPositions = this.lightParticles.geometry.attributes.position.array;
        for (let i = 0; i < this.lightParticlesCount; i++) {
            lightPositions[i * 3 + 2] += speed * 0.5;

            const dx = lightPositions[i * 3] - this.shipGroup.position.x;
            const dy = lightPositions[i * 3 + 1] - this.shipGroup.position.y;
            const dz = lightPositions[i * 3 + 2] - this.shipGroup.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist > 2000000) { // x1000
                lightPositions[i * 3] = this.shipGroup.position.x + (Math.random() - 0.5) * 3000000; // x1000
                lightPositions[i * 3 + 1] = this.shipGroup.position.y + (Math.random() - 0.5) * 3000000; // x1000
                lightPositions[i * 3 + 2] = this.shipGroup.position.z + (Math.random() - 0.5) * 3000000; // x1000
            }
        }
        this.lightParticles.geometry.attributes.position.needsUpdate = true;

        // Update speed trails (réutilise absSpeed déjà déclaré plus haut)
        if (absSpeed > 0.3) {
            const spawnRate = Math.floor(5 / (absSpeed + 0.1));
            if (Math.random() < 1 / Math.max(1, spawnRate)) {
                const trailPositions = this.trailParticles.geometry.attributes.position.array;

                // OPTIMIZATION: Reuse temp vector to avoid Garbage Collection pressure
                if (!this._tempVec) this._tempVec = new THREE.Vector3();

                this._tempVec.set(0, 0, 3);
                this._tempVec.applyQuaternion(this.shipGroup.quaternion);

                trailPositions[this.trailIndex * 3] = this.shipGroup.position.x + this._tempVec.x;
                trailPositions[this.trailIndex * 3 + 1] = this.shipGroup.position.y + this._tempVec.y;
                trailPositions[this.trailIndex * 3 + 2] = this.shipGroup.position.z + this._tempVec.z;

                this.trailIndex = (this.trailIndex + 1) % this.maxTrailParticles;
                this.trailParticles.geometry.attributes.position.needsUpdate = true;
            }

            this.trailParticles.material.size = 2000 + absSpeed * 1500; // x1000
            this.trailParticles.material.opacity = Math.min(0.8, absSpeed / 5000.0); // Adjusted for new speed scale
        } else {
            this.trailParticles.material.opacity *= 0.95;
        }
    }
}
