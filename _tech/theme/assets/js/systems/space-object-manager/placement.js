import * as THREE from 'three';
import { OBJECT_TYPES } from '../../config/types.js';
import { dist3 } from '../../native/fast-math.js';

export const hashToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = (hash % 360) / 360;
  return new THREE.Color().setHSL(hue, 0.7, 0.6);
};

export const createRootPlanets = (files, createPlanetFn) => {
  if (!files) return [];

  const placed = [];
  const MIN_SEPARATION = 2_000_000;

  return files.map((file, i) => {
    const angle = (i / files.length) * Math.PI * 2;
    const radius = 8000000 + Math.random() * 20000000;
    const height = (Math.random() - 0.5) * 4000000;

    const tryPlace = (attempts = 24) => {
      let chosen = { x: 0, y: 0, z: 0 };
      for (let n = 0; n < attempts; n++) {
        const ang = angle + (Math.random() - 0.5) * 0.4;
        const rad = radius + (Math.random() - 0.5) * 1_000_000;
        const h = height + (Math.random() - 0.5) * 200_000;
        const x = Math.cos(ang) * rad + (Math.random() - 0.5) * 300_000;
        const z = Math.sin(ang) * rad + (Math.random() - 0.5) * 300_000;
        const y = h;
        const tooClose = placed.some((p) => dist3(p.x, p.y, p.z, x, y, z) < MIN_SEPARATION);
        if (!tooClose) {
          chosen = { x, y, z };
          return chosen;
        }
      }
      return chosen;
    };

    const pos = tryPlace();
    const displayTitle = file.tiitle || file.title || file.name;
    const mesh = createPlanetFn({ name: displayTitle, url: file.url });
    mesh.position.set(pos.x, pos.y, pos.z);
    placed.push({ x: pos.x, y: pos.y, z: pos.z });

    mesh.userData = {
      ...mesh.userData,
      planetData: { ...file, title: displayTitle },
      objectType: OBJECT_TYPES.PLANET,
      distFn: (vec) => dist3(mesh.position.x, mesh.position.y, mesh.position.z, vec.x, vec.y, vec.z)
    };

    return mesh;
  });
};
