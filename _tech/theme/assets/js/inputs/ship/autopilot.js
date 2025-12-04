import * as THREE from 'three';
import { calculateSpeed } from './warp.js';
import { resetAutopilotSpeed } from './state.js';

export const updateAutopilot = (shipGroup, state) => {
  try {
    if (!state.autopilot.active) return;

    let targetPos;
    if (state.autopilot.targetObject?.getWorldPosition) {
      targetPos = new THREE.Vector3();
      state.autopilot.targetObject.getWorldPosition(targetPos);
    } else if (state.autopilot.targetPos) {
      targetPos = state.autopilot.targetPos.clone();
    } else {
      console.warn('Autopilot active but no target defined');
      state.autopilot.active = false;
      return;
    }

    const currentPos = shipGroup.position;
    if (!isFinite(targetPos.x) || !isFinite(targetPos.y) || !isFinite(targetPos.z)) {
      console.error('Invalid target position in autopilot:', targetPos);
      resetAutopilotSpeed(state);
      return;
    }

    const distance = currentPos.distanceTo(targetPos);
    if (!isFinite(distance)) {
      console.error('Invalid distance in autopilot:', distance);
      resetAutopilotSpeed(state);
      return;
    }

    const ud = state.autopilot.targetObject?.userData || {};
    let stopDist = 100000;
    if (ud.isGasCloud || ud.cloudData) stopDist = 500000;
    else if (ud.galaxyData || ud.isGalaxy) stopDist = 200000;
    else if (ud.isNebula) stopDist = 200000;
    stopDist = Math.max(stopDist, 50000);
    state.autopilot.minDistance = stopDist;

    if (state.autopilot.lastDistance !== null && distance > state.autopilot.lastDistance * 1.02) {
      console.warn('Autopilot: distance increasing, disengaging');
      resetAutopilotSpeed(state);
      state.autopilot.lastDistance = null;
      return;
    }
    state.autopilot.lastDistance = distance;

    if (distance <= stopDist + 5000) {
      resetAutopilotSpeed(state);
      if (state.autopilot.targetObject?.getWorldPosition) {
        const lookPos = new THREE.Vector3();
        state.autopilot.targetObject.getWorldPosition(lookPos);
        shipGroup.lookAt(lookPos);
      } else if (state.autopilot.targetPos) {
        shipGroup.lookAt(state.autopilot.targetPos);
      }
      state.rotVel.x = state.rotVel.y = state.rotVel.z = 0;
      state.autopilot.lastDistance = null;
      console.log('Autopilot: Arrived at destination');
      return;
    }

    const direction = new THREE.Vector3().subVectors(targetPos, currentPos).normalize();
    const targetRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    shipGroup.quaternion.slerp(targetRotation, 0.05);

    let desiredWarp = 0;
    if (distance > stopDist + 200000) {
      desiredWarp = 20;
      state.autopilot.warp20Active = true;
    } else {
      state.autopilot.warp20Active = false;
      if (distance > stopDist + 50000) desiredWarp = 5;
      else if (distance > stopDist + 10000) desiredWarp = 4;
      else if (distance > stopDist + 5000) desiredWarp = 3;
      else if (distance > stopDist + 2000) desiredWarp = 2;
      else if (distance > stopDist + 500) desiredWarp = 1;
      else desiredWarp = 0;
    }

    if (state.warpLevel !== desiredWarp) {
      state.warpLevel = desiredWarp;
      state.speed = calculateSpeed(state.warpLevel);
      state.lastWarpChange = Date.now();
    }

    const targetSpeed = calculateSpeed(state.warpLevel);
    if (isFinite(targetSpeed)) {
      const approachFactor = Math.min(1, Math.max(0, (distance - stopDist) / (stopDist + 200000)));
      const cappedSpeed = targetSpeed * (0.2 + 0.8 * approachFactor);
      state.speed = Math.max(state.speed, 0);
      if (state.speed < cappedSpeed) state.speed = cappedSpeed;
      state.speed = Math.min(state.speed, cappedSpeed);
    }
  } catch (error) {
    console.error('Error in autopilot update:', error);
    resetAutopilotSpeed(state);
  }
};
