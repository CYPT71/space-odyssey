export const updateEngineSound = (engineSound, warpLevel, audioContext, config) => {
  if (!engineSound || !isFinite(warpLevel)) {
    console.warn('Invalid warpLevel in updateEngineSound:', warpLevel);
    return;
  }
  const absLevel = Math.abs(warpLevel);
  const clampedLevel = Math.min(absLevel, 5);
  const engineFreq = config.ENGINE.FREQUENCIES[clampedLevel] || config.ENGINE.BASE_FREQUENCY;
  engineSound.gainNode.gain.setTargetAtTime(absLevel > 0 ? config.ENGINE.VOLUME : 0.01, audioContext.currentTime, 0.05);
  engineSound.oscillator.frequency.setTargetAtTime(engineFreq, audioContext.currentTime, 0.05);
};

export const updateWarpSound = (warpSound, warpLevel, audioContext, config) => {
  if (!warpSound || warpLevel === null || warpLevel === undefined || !isFinite(warpLevel)) {
    console.warn('Invalid warpLevel in updateWarpSound:', warpLevel);
    return;
  }
  const clampedLevel = Math.min(Math.max(Math.floor(warpLevel), 0), 5);
  if (clampedLevel >= 3) {
    const freqIndex = Math.min(clampedLevel - 3, 2);
    const frequency = config.WARP.FREQUENCIES[freqIndex];
    if (!isFinite(frequency)) {
      console.error('Invalid frequency for warp level:', clampedLevel, frequency);
      return;
    }
    warpSound.gainNode.gain.setTargetAtTime(config.WARP.VOLUME, audioContext.currentTime, 0.01);
    warpSound.oscillator.frequency.setTargetAtTime(frequency, audioContext.currentTime, 0.01);
  } else {
    warpSound.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
  }
};

export const playBoostSound = (warpSound, audioContext, config) => {
  if (!warpSound) return;
  warpSound.gainNode.gain.setTargetAtTime(config.BOOST.VOLUME, audioContext.currentTime, 0.01);
  warpSound.oscillator.frequency.setTargetAtTime(config.BOOST.FREQUENCY, audioContext.currentTime, 0.01);
  setTimeout(() => {
    warpSound.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.5);
  }, config.BOOST.DURATION);
};

export const playTeleportSound = (warpSound, audioContext, config) => {
  if (!warpSound) return;
  warpSound.gainNode.gain.setTargetAtTime(config.TELEPORT.VOLUME, audioContext.currentTime, 0.01);
  warpSound.oscillator.frequency.setTargetAtTime(config.TELEPORT.FREQUENCY, audioContext.currentTime, 0.01);
  setTimeout(() => {
    warpSound.gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
  }, config.TELEPORT.DURATION);
};
