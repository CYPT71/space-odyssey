import { WARP_SPEEDS, WARP_DEBOUNCE_MS } from './config.js';

export const calculateSpeed = (warpLevel) => {
  if (warpLevel > 0) return WARP_SPEEDS[warpLevel];
  if (warpLevel === 0) return WARP_SPEEDS[0];
  return -WARP_SPEEDS[Math.abs(warpLevel)];
};

export const changeWarpLevel = (state, delta) => {
  const now = Date.now();
  if (now - state.lastWarpChange < WARP_DEBOUNCE_MS) return false;

  const newLevel = state.warpLevel + delta;
  if (delta > 0 && newLevel > 5) return false;
  if (delta < 0 && newLevel < -3) return false;

  state.warpLevel = newLevel;
  state.speed = calculateSpeed(state.warpLevel);
  state.lastWarpChange = now;
  return true;
};

export const activateWarpBoost = (state) => {
  state.warpLevel = 5;
  state.speed = WARP_SPEEDS[5];
};
