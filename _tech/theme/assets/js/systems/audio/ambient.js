import { createAmbientNoise, createTone } from './nodes.js';

export const ensureAmbientNoise = (ambientSoundRef, audioContext) => {
  if (!ambientSoundRef.current) {
    ambientSoundRef.current = createAmbientNoise(audioContext);
  }
};

export const ensureAmbientTones = (ambientGasRef, ambientNebulaRef, audioContext) => {
  if (!ambientGasRef.current) ambientGasRef.current = createTone(audioContext, 32);
  if (!ambientNebulaRef.current) ambientNebulaRef.current = createTone(audioContext, 48);
};

export const updateAmbient = (ambientSoundRef, speedRatio, audioContext) => {
  if (!ambientSoundRef.current) return;
  ambientSoundRef.current.gainNode.gain.setTargetAtTime(0.05 + speedRatio * 0.2, audioContext.currentTime, 0.1);
  ambientSoundRef.current.filter.frequency.setTargetAtTime(100 + speedRatio * 1000, audioContext.currentTime, 0.1);
};

export const updateAmbientProximity = ({ gasDist = Infinity, nebulaDist = Infinity }, ambientGasRef, ambientNebulaRef, audioContext) => {
  ensureAmbientTones(ambientGasRef, ambientNebulaRef, audioContext);

  const falloff = (d, max) => {
    if (!isFinite(d)) return 0;
    return Math.max(0, 1 - d / max);
  };
  const gasGain = Math.min(0.25, falloff(gasDist, 12000000) * 0.25);
  const nebGain = Math.min(0.25, falloff(nebulaDist, 12000000) * 0.25);
  ambientGasRef.current.gainNode.gain.setTargetAtTime(gasGain, audioContext.currentTime, 0.1);
  ambientNebulaRef.current.gainNode.gain.setTargetAtTime(nebGain, audioContext.currentTime, 0.1);
};
