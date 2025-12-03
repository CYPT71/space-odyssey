import { applyPulseScale } from '../../effects/visual-effects.js';

export const updateGasClouds = (gasClouds, delta) => {
  gasClouds.forEach((cloud) => {
    if (!cloud.userData?.isGasCloud) return;
    cloud.rotation.y += delta * 0.02;
    cloud.rotation.x += delta * 0.01;
    const time = Date.now() * 0.001;
    if (cloud.material) cloud.material.opacity = 0.3 + Math.sin(time) * 0.1;
    applyPulseScale(cloud, time, 0.6, 0.05);
  });
};
