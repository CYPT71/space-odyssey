import { applyShipAnimations } from '../animations.js';
import { loadControlMappings, createShipState, resetAutopilotSpeed, clampAxis, engineIntensityFromSpeed, isKeyPressed } from './state.js';
import { changeWarpLevel, calculateSpeed, activateWarpBoost } from './warp.js';
import { applyRotationalInertia, updateBanking, applyRotation } from './rotation.js';
import { createMovementHandlers } from './movement.js';
import { updateAutopilot } from './autopilot.js';
import { applyGravityForces } from './gravity.js';
import { WARP_SPEEDS, ROTATION_CONFIG } from './config.js';

import { PHYSICS } from '../../config/constants.js';

export const createShipControls = (shipGroup, deps = {}) => {
  const physicsConfig = deps.physics || PHYSICS;
  let controls = loadControlMappings();
  const state = createShipState();
  let analogProfile = 'default';
  const { applyForwardMovement, applyStrafeMovement, applyVerticalMovement } = createMovementHandlers(physicsConfig);

  window.addEventListener('controlsUpdated', () => {
    controls = loadControlMappings();
  });

  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    state.keys[key] = true;
    state.keys[e.key] = true;
    if (e.key === ' ') e.preventDefault();
    if (state.autopilot.active) {
      resetAutopilotSpeed(state);
      state.autopilot.targetPos = null;
      state.autopilot.targetObject = null;
      console.log('Autopilot: Disengaged by manual input');
    }
    if (key === controls.forward) changeWarpLevel(state, 1);
    if (key === controls.backward) changeWarpLevel(state, -1);
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    state.keys[key] = false;
    state.keys[e.key] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  const update = (isReadingMode) => {
    if (isReadingMode) return;

    if (isKeyPressed(state, controls.stop)) {
      resetAutopilotSpeed(state);
    }

    if (state.autopilot.active) {
      updateAutopilot(shipGroup, state);
      applyForwardMovement(shipGroup, state);
      state.currentBankAngle *= 0.95;
      applyRotation(shipGroup, state);
    } else {
      if (state.axes.forward) {
        if (analogProfile === 'mobile') {
          if (state.axes.forward > 0) {
            const targetWarp = Math.min(5, Math.max(0, Math.round(state.axes.forward * 5)));
            state.warpLevel = targetWarp;
            state.speed = calculateSpeed(targetWarp) * state.axes.forward;
          } else {
            state.warpLevel = 0;
            state.speed = state.axes.forward * (WARP_SPEEDS[0] * 0.6);
          }
        } else {
          state.warpLevel = 0;
          state.speed = state.axes.forward * (WARP_SPEEDS[0] * 0.6);
        }
      }

      applyForwardMovement(shipGroup, state);
      applyRotationalInertia(state, controls);
      updateBanking(state, controls);
      applyRotation(shipGroup, state);
      applyStrafeMovement(shipGroup, state, controls);
      applyVerticalMovement(shipGroup, state, controls);

      if (state.fineControl) {
        state.rotVel.y += (-state.mouseDelta.x * ROTATION_CONFIG.INPUT_SCALE);
        state.rotVel.x += (-state.mouseDelta.y * ROTATION_CONFIG.INPUT_SCALE);
        state.mouseDelta.x = 0;
        state.mouseDelta.y = 0;
        const fineSpeed = WARP_SPEEDS[0] / 8;
        state.speed = Math.min(state.speed, fineSpeed);
      }
    }

    applyShipAnimations(shipGroup, state);
    const engines = shipGroup.userData?.impulseEngines || [];
    const speedRatio = engineIntensityFromSpeed(state.speed);
    engines.forEach(({ mesh, light }) => {
      if (mesh?.material?.emissive) {
        mesh.material.emissiveIntensity = 0.5 + speedRatio * 4;
        mesh.material.opacity = 0.6 + speedRatio * 0.4;
      }
      if (light) light.intensity = speedRatio * 5;
    });
  };

  const applyGravity = (planets) => applyGravityForces(shipGroup, planets, state.warpLevel);

  return {
    update,
    applyGravity,
    getSpeed: () => state.speed,
    getWarpFactor: () => state.warpLevel,
    isFineControlActive: () => state.fineControl,
    setFineControl: (on) => { state.fineControl = !!on; },
    setAnalogProfile: (profile) => { analogProfile = profile || 'default'; },
    setForward: (v) => {
      state.axes.forward = clampAxis(v);
      if (state.axes.forward !== 0) resetAutopilotSpeed(state);
    },
    setStrafe: (v) => {
      state.axes.strafe = clampAxis(v);
      if (state.axes.strafe !== 0) resetAutopilotSpeed(state);
    },
    setYaw: (v) => { state.axes.yaw = clampAxis(v); },
    setPitch: (v) => { state.axes.pitch = clampAxis(v); },
    applyMouseDelta: (dx, dy) => {
      state.mouseDelta.x += dx;
      state.mouseDelta.y += dy;
    },
    setSpeed: (speed) => { state.speed = speed; },
    activateWarpBoost: () => activateWarpBoost(state),
    engageAutopilot: (targetPos, minDistance = 15000000, targetObject = null) => {
      state.autopilot.active = true;
      state.autopilot.targetPos = targetPos;
      state.autopilot.targetObject = targetObject;
      state.autopilot.minDistance = minDistance;
      console.log('Autopilot: Engaged', targetPos, minDistance, targetObject?.userData);
    },
    disengageAutopilot: () => {
      resetAutopilotSpeed(state);
      state.autopilot.targetPos = null;
      state.autopilot.targetObject = null;
    },
    isWarp20Active: () => state.autopilot.warp20Active,
  };
};
