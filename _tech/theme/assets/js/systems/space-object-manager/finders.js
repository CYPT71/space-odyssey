import * as THREE from 'three';

export const getAllObjectsFactory = (galaxies, gasClouds, rootPlanets) => () => {
  const all = [];
  galaxies.forEach((g) => {
    if (g.planets) all.push(...g.planets);
    if (g.group) all.push(g.group);
  });
  gasClouds.forEach((cloud) => {
    if (cloud) all.push(cloud);
    const nebulae = cloud?.userData?.nebulae || [];
    if (Array.isArray(nebulae)) all.push(...nebulae);
  });
  rootPlanets.forEach((p) => all.push(p));
  galaxies.forEach((g) => g.posts?.forEach((post) => all.push(post)));
  const orphans = gasClouds.flatMap((c) => c?.userData?.posts || []);
  orphans.forEach((p) => all.push(p));
  return all;
};

export const findClosestFactory = (octree, objectTypeFn, detectionRangeFn) => (position) => {
  const maxSearchDist = 50000000;
  const closestObj = octree.findClosest(position, maxSearchDist);
  if (!closestObj) return null;

  const ud = closestObj.userData || {};
  const type = objectTypeFn(ud);
  if (type === 'unknown') return null;

  const scratchPos = new THREE.Vector3();
  closestObj.getWorldPosition(scratchPos);
  const dist = position.distanceTo(scratchPos);
  const range = detectionRangeFn(type);

  return {
    distance: dist,
    planetData: ud.planetData,
    galaxyData: ud.galaxyData,
    cloudData: ud.cloudData,
    isGasCloud: ud.isGasCloud,
    isNebula: ud.isNebula,
    type,
    obj: closestObj,
    inRange: range ? dist < range : true
  };
};
