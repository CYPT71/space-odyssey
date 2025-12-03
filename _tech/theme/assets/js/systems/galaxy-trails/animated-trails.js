import * as THREE from 'three';

export const createAnimatedTrails = (scene, planets, galaxyColor) => {
    if (!planets || planets.length < 2) return null;

    const particleCount = planets.length * 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

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
};

export const updateAnimatedTrails = (trailParticles, delta) => {
    if (!trailParticles || !trailParticles.userData.isAnimatedTrail) return;

    const positions = trailParticles.geometry.attributes.position.array;
    const velocities = trailParticles.userData.velocities;

    velocities.forEach((vel, index) => {
        vel.progress += delta * 0.2;
        if (vel.progress > 1) vel.progress = 0;

        const i3 = index * 3;
        const pos = new THREE.Vector3().lerpVectors(vel.start, vel.end, vel.progress);

        positions[i3] = pos.x;
        positions[i3 + 1] = pos.y;
        positions[i3 + 2] = pos.z;
    });

    trailParticles.geometry.attributes.position.needsUpdate = true;
};
