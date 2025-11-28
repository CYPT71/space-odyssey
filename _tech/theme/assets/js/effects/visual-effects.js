/**
 * Shared visual effects helpers.
 */

export const applyPulseScale = (object3d, time = Date.now() * 0.001, freq = 0.6, amplitude = 0.05) => {
    if (!object3d) return;
    const scalePulse = 1 + Math.sin(time * freq) * amplitude;
    object3d.scale.set(scalePulse, scalePulse, scalePulse);
};
