import { hashToColor } from './placement.js';

export const createGalaxies = (galaxiesData, { scene, navigation, createGalaxyFn, createTrailsFn, createAnimatedTrailsFn, animatedTrails }) => {
  const galaxyArray = Object.values(galaxiesData || {});
  return galaxyArray.map((galaxyData, i) => {
    const angle = (i / galaxyArray.length) * Math.PI * 2;
    const radius = 8000000000;
    const galaxy = createGalaxyFn(galaxyData, {
      x: Math.cos(angle) * radius,
      y: 0,
      z: Math.sin(angle) * radius
    });

    if (galaxy.planets && galaxy.planets.length > 1) {
      const galaxyColor = hashToColor(galaxy.data.name);
      createTrailsFn(scene, galaxy.planets, galaxyColor);
      const animTrail = createAnimatedTrailsFn(scene, galaxy.planets, galaxyColor);
      if (animTrail) animatedTrails.push(animTrail);
    }

    if (galaxy.group?.userData) {
      galaxy.group.userData.objectType = galaxy.group.userData.objectType || 'galaxy';
    }
    return galaxy;
  });
};
