import * as THREE from 'three';

export const applyGravityForces = (shipGroup, planets, warpLevel) => {
  if (Math.abs(warpLevel) > 1) return;

  const G_FORCE = 200.0;
  const pullVector = new THREE.Vector3();

  planets.forEach((planet) => {
    if (!planet.position) return;

    const planetRadius = planet.scale.x || 50000;
    const gravityRadius = planetRadius * 4.0;
    const distance = shipGroup.position.distanceTo(planet.position);

    if (distance < gravityRadius && distance > planetRadius) {
      const gravityFactor = (gravityRadius - distance) / (gravityRadius - planetRadius);
      pullVector
        .subVectors(planet.position, shipGroup.position)
        .normalize()
        .multiplyScalar(G_FORCE * gravityFactor);
      shipGroup.position.add(pullVector);
    }
  });
};
