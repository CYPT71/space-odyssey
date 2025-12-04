import * as THREE from 'three';
import { isKeyPressed } from './state.js';
import { ROTATION_CONFIG } from './config.js';

export const applyRotationalInertia = (state, controls, config = ROTATION_CONFIG) => {
  const { ACCELERATION, DECAY, ROLL_FROM_STRAFE } = config;

  if (isKeyPressed(state, controls.yawLeft) || state.keys.ArrowLeft) state.rotVel.y += ACCELERATION;
  if (isKeyPressed(state, controls.yawRight) || state.keys.ArrowRight) state.rotVel.y -= ACCELERATION;

  if (isKeyPressed(state, controls.pitchUp)) state.rotVel.x += ACCELERATION;
  if (isKeyPressed(state, controls.pitchDown)) state.rotVel.x -= ACCELERATION;

  if (isKeyPressed(state, controls.strafeLeft)) state.rotVel.z += ACCELERATION * ROLL_FROM_STRAFE;
  if (isKeyPressed(state, controls.strafeRight)) state.rotVel.z -= ACCELERATION * ROLL_FROM_STRAFE;

  state.rotVel.x *= DECAY;
  state.rotVel.y *= DECAY;
  state.rotVel.z *= DECAY;

  if (state.axes.yaw) state.rotVel.y += (-state.axes.yaw) * ACCELERATION;
  if (state.axes.pitch) state.rotVel.x += (-state.axes.pitch) * ACCELERATION;
  if (state.axes.strafe) state.rotVel.z += (-state.axes.strafe) * ACCELERATION * ROLL_FROM_STRAFE;
};

const calculateBankingAngle = (state, controls, config) => {
  const { MAX_BANK_ANGLE, YAW_BANK_FACTOR, STRAFE_BANK_FACTOR } = config;
  const yawBanking = -state.rotVel.y * YAW_BANK_FACTOR;
  let strafeBanking = 0;
  if (isKeyPressed(state, controls.strafeLeft)) strafeBanking = -STRAFE_BANK_FACTOR;
  if (isKeyPressed(state, controls.strafeRight)) strafeBanking = STRAFE_BANK_FACTOR;
  const targetAngle = (yawBanking + strafeBanking) * MAX_BANK_ANGLE;
  return Math.max(-MAX_BANK_ANGLE, Math.min(MAX_BANK_ANGLE, targetAngle));
};

export const updateBanking = (state, controls, config = ROTATION_CONFIG) => {
  state.targetBankAngle = calculateBankingAngle(state, controls, config);
  state.currentBankAngle += (state.targetBankAngle - state.currentBankAngle) * config.BANK_SPEED;
  state.currentBankAngle *= 0.99;
};

export const applyRotation = (shipGroup, state) => {
  if (!shipGroup.quaternion || typeof shipGroup.rotateOnAxis !== 'function') {
    // Fallback for mocked objects (tests)
    shipGroup.rotation.x += state.rotVel.x;
    shipGroup.rotation.y += state.rotVel.y;
    state.rollAngle += state.rotVel.z;
    shipGroup.rotation.z = state.currentBankAngle + state.rollAngle;
    return;
  }

  // Local axes derived from current orientation keep controls ship-relative
  const upAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(shipGroup.quaternion);
  const rightAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(shipGroup.quaternion);
  const forward = new THREE.Vector3();

  shipGroup.rotateOnAxis(upAxis, state.rotVel.y);
  shipGroup.rotateOnAxis(rightAxis, state.rotVel.x);

  state.rollAngle += state.rotVel.z;
  // Keep roll pure (no extra banking) so A/E stays a clean roll around forward
  const desiredRoll = state.rollAngle;
  const rollDelta = desiredRoll - (state.lastRollApplied || 0);

  if (shipGroup.getWorldDirection) {
    shipGroup.getWorldDirection(forward);
  } else {
    forward.set(0, 0, 1).applyQuaternion(shipGroup.quaternion);
  }
  shipGroup.rotateOnAxis(forward.normalize(), rollDelta);
  state.lastRollApplied = desiredRoll;
};
