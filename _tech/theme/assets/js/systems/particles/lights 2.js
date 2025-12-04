import * as THREE from 'three';

export const createLightParticles = (scene, count) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3000000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3000000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3000000;
    const hue = Math.random();
    const color = new THREE.Color().setHSL(hue, 1.0, 0.6);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 3000,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  return particles;
};

export const updateLightParticles = (particles, count, shipPos, speed) => {
  const positions = particles.geometry.attributes.position.array;
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    positions[idx + 2] += speed * 0.5;
    const dx = positions[idx] - shipPos.x;
    const dy = positions[idx + 1] - shipPos.y;
    const dz = positions[idx + 2] - shipPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist > 2000000) {
      positions[idx] = shipPos.x + (Math.random() - 0.5) * 3000000;
      positions[idx + 1] = shipPos.y + (Math.random() - 0.5) * 3000000;
      positions[idx + 2] = shipPos.z + (Math.random() - 0.5) * 3000000;
    }
  }
  particles.geometry.attributes.position.needsUpdate = true;
};
