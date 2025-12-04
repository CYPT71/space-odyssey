import { createVolumetricCloud } from '../volumetric-cloud-factory.js';
import { GAS_CLOUD_CONFIG } from './config.js';

export const createGasCloud = (scene, center, categoryName, postCount) => {
  const gasCloud = createVolumetricCloud({
    center,
    name: categoryName,
    count: postCount,
    config: GAS_CLOUD_CONFIG,
    extraUserData: {
      isGasCloud: true,
      isGalaxy: false,
      spaceType: 'nebula',
      cloudName: categoryName,
      postCount,
    },
  });

  scene.add(gasCloud);
  return gasCloud;
};
