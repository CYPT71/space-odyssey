import * as THREE from 'three';

const createTrail = (start, end, color) => {
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const offset = new THREE.Vector3(
    (Math.random() - 0.5) * 50000,
    (Math.random() - 0.5) * 50000,
    (Math.random() - 0.5) * 50000
  );
  midPoint.add(offset);

  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  const curvePoints = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    linewidth: 2,
    blending: THREE.AdditiveBlending
  });

  const trail = new THREE.Line(geometry, material);
  trail.userData.isTrail = true;
  return trail;
};

export const createGalaxyTrails = (scene, planets, galaxyColor) => {
  if (!planets || planets.length < 2) return null;

  const trailGroup = new THREE.Group();
  trailGroup.userData.isTrailGroup = true;

  planets.forEach((planet, index) => {
    const distances = planets
      .map((other, otherIndex) => ({
        planet: other,
        index: otherIndex,
        distance: planet.userData?.distFn ? planet.userData.distFn(other.position) : planet.position.distanceTo(other.position)
      }))
      .filter((d) => d.index !== index)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    distances.forEach(({ planet: neighbor }) => {
      if (planets.indexOf(neighbor) > index) {
        const trail = createTrail(planet.position.clone(), neighbor.position.clone(), galaxyColor);
        trailGroup.add(trail);
      }
    });
  });

  scene.add(trailGroup);
  return trailGroup;
};
