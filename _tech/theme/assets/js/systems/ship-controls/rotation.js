import { ROTATION_CONFIG } from './config.js';
import { isKeyPressed } from './state.js';

export const applyRotationalInertia = (state, controls) => {
  const { ACCELERATION, DECAY } = ROTATION_CONFIG;

  if (isKeyPressed(state, controls.yawLeft) || state.keys.ArrowLeft) state.rotVel.y += ACCELERATION;
  if (isKeyPressed(state, controls.yawRight) || state.keys.ArrowRight) state.rotVel.y -= ACCELERATION;

  if (isKeyPressed(state, controls.pitchUp)) state.rotVel.x += ACCELERATION;
  if (isKeyPressed(state, controls.pitchDown)) state.rotVel.x -= ACCELERATION;

  if (isKeyPressed(state, controls.rollLeft)) state.rotVel.z += ACCELERATION * ROTATION_CONFIG.ROLL_GAIN;
  if (isKeyPressed(state, controls.rollRight)) state.rotVel.z -= ACCELERATION * ROTATION_CONFIG.ROLL_GAIN;
  if (isKeyPressed(state, controls.strafeLeft)) state.rotVel.z += ACCELERATION * ROTATION_CONFIG.ROLL_FROM_STRAFE;
  if (isKeyPressed(state, controls.strafeRight)) state.rotVel.z -= ACCELERATION * ROTATION_CONFIG.ROLL_FROM_STRAFE;

  state.rotVel.x *= DECAY;
  state.rotVel.y *= DECAY;
  state.rotVel.z *= DECAY;

  if (state.axes.yaw) state.rotVel.y += (-state.axes.yaw) * ACCELERATION;
  if (state.axes.pitch) state.rotVel.x += (-state.axes.pitch) * ACCELERATION;
  if (state.axes.strafe) state.rotVel.z += (-state.axes.strafe) * ACCELERATION * ROTATION_CONFIG.ROLL_FROM_STRAFE;
};

const calculateBankingAngle = (state, controls) => {
  const { MAX_BANK_ANGLE, YAW_BANK_FACTOR, STRAFE_BANK_FACTOR } = ROTATION_CONFIG;
  const yawBanking = -state.rotVel.y * YAW_BANK_FACTOR;
  let strafeBanking = 0;
  if (isKeyPressed(state, controls.strafeLeft)) strafeBanking = -STRAFE_BANK_FACTOR;
  if (isKeyPressed(state, controls.strafeRight)) strafeBanking = STRAFE_BANK_FACTOR;
  const targetAngle = (yawBanking + strafeBanking) * MAX_BANK_ANGLE;
  return Math.max(-MAX_BANK_ANGLE, Math.min(MAX_BANK_ANGLE, targetAngle));
};

export const updateBanking = (state, controls) => {
  state.targetBankAngle = calculateBankingAngle(state, controls);
  state.currentBankAngle += (state.targetBankAngle - state.currentBankAngle) * ROTATION_CONFIG.BANK_SPEED;
  state.currentBankAngle *= 0.99;
};

export const applyRotation = (shipGroup, state) => {
  shipGroup.rotation.x += state.rotVel.x;
  shipGroup.rotation.y += state.rotVel.y;
  state.rollAngle += state.rotVel.z;
  shipGroup.rotation.z = state.currentBankAngle + state.rollAngle;
};
