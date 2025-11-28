/**
 * Centralized visual parameters for gas clouds and nebulae.
 */

const isMobile = () => {
    if (typeof navigator === 'undefined') return false;
    return /Mobi|Android/i.test(navigator.userAgent);
};

const PARTICLE_SCALE = isMobile() ? 0.6 : 1;

export const GAS_CLOUD_VISUAL = Object.freeze({
    particleMultiplier: 500 * PARTICLE_SCALE,
    particleCap: 5000 * PARTICLE_SCALE,
    baseRadius: 550000,
    radiusPerUnit: 50000
});

export const NEBULA_VISUAL = Object.freeze({
    particleMultiplier: 200 * PARTICLE_SCALE,
    particleCap: 2000 * PARTICLE_SCALE,
    baseRadius: 220000,
    radiusPerUnit: 20000,
    distributionPower: 0.35
});
