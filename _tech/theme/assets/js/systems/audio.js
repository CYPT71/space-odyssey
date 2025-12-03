/**
 * @fileoverview Functional audio system (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

import { AUDIO_CONFIG as AUDIO } from '../config/audio-config.js';
import { createEngineSound, createWarpSound, createTone } from './audio/nodes.js';
import { updateEngineSound, updateWarpSound, playBoostSound, playTeleportSound } from './audio/engine-warp.js';
import { ensureAmbientNoise, updateAmbient, updateAmbientProximity } from './audio/ambient.js';
import { playScanSound } from './audio/scan.js';

export const createAudioSystem = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let engineSound = null;
  let warpSound = null;
  let ambientSoundRef = { current: null };
  let ambientGasRef = { current: null };
  let ambientNebulaRef = { current: null };
  let initialized = false;

  const initOnUserGesture = () => {
    const handler = () => {
      if (initialized) return;
      engineSound = createEngineSound(audioContext, AUDIO);
      warpSound = createWarpSound(audioContext, AUDIO);
      ambientGasRef.current = createTone(audioContext, 32);
      ambientNebulaRef.current = createTone(audioContext, 48);
      ensureAmbientNoise(ambientSoundRef, audioContext);
      initialized = true;
    };
    document.addEventListener('keydown', handler, { once: true });
  };

  initOnUserGesture();

  const handleEngine = (warpLevel) => {
    if (!initialized || !engineSound) return;
    updateEngineSound(engineSound, warpLevel, audioContext, AUDIO);
  };

  const handleWarp = (warpLevel) => {
    if (!initialized || !warpSound) return;
    updateWarpSound(warpSound, warpLevel, audioContext, AUDIO);
  };

  const handleBoost = () => {
    if (!initialized || !warpSound) return;
    playBoostSound(warpSound, audioContext, AUDIO);
  };

  const handleTeleport = () => {
    if (!initialized || !warpSound) return;
    playTeleportSound(warpSound, audioContext, AUDIO);
  };

  const handleAmbient = (speedRatio) => {
    if (!initialized) return;
    ensureAmbientNoise(ambientSoundRef, audioContext);
    updateAmbient(ambientSoundRef, speedRatio, audioContext);
  };

  const handleAmbientProximity = (distances) => {
    if (!initialized) return;
    updateAmbientProximity(distances, ambientGasRef, ambientNebulaRef, audioContext);
  };

  const handleScan = () => {
    if (!initialized) return;
    playScanSound(audioContext);
  };

  const playSound = (name) => {
    switch (name) {
      case 'warp':
      case 'teleport':
        handleTeleport();
        break;
      case 'boost':
        handleBoost();
        break;
      case 'scan':
        handleScan();
        break;
      default:
        console.warn(`Sound '${name}' not found`);
    }
  };

  return {
    updateEngineSound: handleEngine,
    updateWarpSound: handleWarp,
    updateAmbient: handleAmbient,
    updateAmbientProximity: handleAmbientProximity,
    playBoostSound: handleBoost,
    playTeleportSound: handleTeleport,
    playSound
  };
};
