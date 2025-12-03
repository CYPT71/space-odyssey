import * as THREE from 'three';

export const createStarfield = (scene, span, count) => {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * span;
    positions[i * 3 + 1] = (Math.random() - 0.5) * span;
    positions[i * 3 + 2] = (Math.random() - 0.5) * span;

    const starType = Math.random();
    if (starType < 0.1) {
      colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
    } else if (starType < 0.25) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 0.3;
    } else if (starType < 0.4) {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.7;
    } else {
      colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 1500,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const mesh = new THREE.Points(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return { mesh, material, count };
};

export const updateStarfield = ({ mesh, material, count, span }, shipPos, speed, isWarp20) => {
  const absSpeed = Math.abs(speed);

  if (isWarp20) {
    material.size = 8000;
    material.opacity = 1.0;
    material.size += Math.sin(Date.now() * 0.01) * 2000 * 0.2;
  } else if (absSpeed > 27000) {
    const warpIntensity = Math.min((absSpeed - 27000) / 98000, 1);
    material.size = 1500 + warpIntensity * 3000;
    material.opacity = 0.8 + warpIntensity * 0.2;
  } else {
    material.size = 1500;
    material.opacity = 0.8;
  }

  const positions = mesh.geometry.attributes.position.array;
  const halfSize = span / 2;

  for (let i = 0; i < count; i++) {
    const ix = i * 3;
    const dx = positions[ix] - shipPos.x;
    const dy = positions[ix + 1] - shipPos.y;
    const dz = positions[ix + 2] - shipPos.z;

    if (dx < -halfSize) positions[ix] += span;
    else if (dx > halfSize) positions[ix] -= span;
    if (dy < -halfSize) positions[ix + 1] += span;
    else if (dy > halfSize) positions[ix + 1] -= span;
    if (dz < -halfSize) positions[ix + 2] += span;
    else if (dz > halfSize) positions[ix + 2] -= span;
  }

  mesh.geometry.attributes.position.needsUpdate = true;
};
