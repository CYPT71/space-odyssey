import { GAS_CLOUD_VISUAL } from '../../config/visual-config.js';
import { hashStringToColor } from '../../systems/volumetric-cloud-factory.js';

export const GAS_CLOUD_CONFIG = Object.freeze({
  particleMultiplier: GAS_CLOUD_VISUAL.particleMultiplier,
  particleCap: GAS_CLOUD_VISUAL.particleCap,
  baseRadius: GAS_CLOUD_VISUAL.baseRadius,
  radiusPerUnit: GAS_CLOUD_VISUAL.radiusPerUnit,
  distributionPower: 0.5,
  baseColorFn: (name) => hashStringToColor(name),
  colorJitterFn: (baseColor, distRatio, scratch) => {
    const variation = distRatio * 0.3;
    scratch.copy(baseColor);
    scratch.r += (Math.random() - 0.5) * variation;
    scratch.g += (Math.random() - 0.5) * variation;
    scratch.b += (Math.random() - 0.5) * variation;
    return scratch;
  },
  sizeFn: (distRatio) => 800 * (1 - distRatio * 0.5),
  material: {
    size: 800,
    opacity: 0.4,
  },
  labelClass: 'planet-label',
  labelTextFn: (name) => name.toUpperCase(),
  labelHeightFn: () => 20000,
  spaceType: 'nebula',
});
