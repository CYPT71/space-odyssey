import * as THREE from 'three';

export const createSpeedTrails = (scene, maxTrailParticles) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(maxTrailParticles * 3);
  const colors = new Float32Array(maxTrailParticles * 3);

  for (let i = 0; i < maxTrailParticles; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
    const ratio = i / maxTrailParticles;
    colors[i * 3] = 0.5 + ratio * 0.5;
    colors[i * 3 + 1] = 0.9 + ratio * 0.1;
    colors[i * 3 + 2] = 1.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 2000,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  return particles;
};

export const updateTrails = (trailParticles, maxTrailParticles, shipGroup, absSpeed, tempVecRef, trailIndexRef) => {
  if (absSpeed > 0.3) {
    const spawnRate = Math.floor(5 / (absSpeed + 0.1));
    if (Math.random() < 1 / Math.max(1, spawnRate)) {
      const positions = trailParticles.geometry.attributes.position.array;
      if (!tempVecRef.current) tempVecRef.current = new THREE.Vector3();
      tempVecRef.current.set(0, 0, 3).applyQuaternion(shipGroup.quaternion);
      const idx = trailIndexRef.value * 3;
      positions[idx] = shipGroup.position.x + tempVecRef.current.x;
      positions[idx + 1] = shipGroup.position.y + tempVecRef.current.y;
      positions[idx + 2] = shipGroup.position.z + tempVecRef.current.z;
      trailIndexRef.value = (trailIndexRef.value + 1) % maxTrailParticles;
      trailParticles.geometry.attributes.position.needsUpdate = true;
    }
    trailParticles.material.size = 2000 + absSpeed * 1500;
    trailParticles.material.opacity = Math.min(0.8, absSpeed / 5000.0);
  } else {
    trailParticles.material.opacity *= 0.95;
  }
};
