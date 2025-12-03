import { WARP_SPEEDS } from './config.js';
import { loadControls as loadControlsShared } from '../../config/controls.js';

export const createShipState = () => ({
  warpLevel: 0,
  speed: 0,
  keys: {},
  lastWarpChange: 0,
  axes: { forward: 0, strafe: 0, yaw: 0, pitch: 0 },
  rotVel: { x: 0, y: 0, z: 0 },
  rollAngle: 0,
  targetBankAngle: 0,
  currentBankAngle: 0,
  lastRollApplied: 0,
  fineControl: false,
  mouseDelta: { x: 0, y: 0 },
  autopilot: {
    active: false,
    targetPos: null,
    targetObj: null,
    minDistance: 15000000,
    warp20Active: false,
    lastDistance: null,
  },
});

export const loadControlMappings = () => loadControlsShared();

export const resetAutopilotSpeed = (state) => {
  state.autopilot.active = false;
  state.autopilot.warp20Active = false;
  state.speed = 0;
  state.warpLevel = 0;
};

export const isKeyPressed = (state, key) => state.keys[key] || state.keys[key?.toUpperCase()];

export const clampAxis = (v) => Math.max(-1, Math.min(1, v));

export const engineIntensityFromSpeed = (speed) => Math.min(1, Math.abs(speed) / WARP_SPEEDS[5]);
