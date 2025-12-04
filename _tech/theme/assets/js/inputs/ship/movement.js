import { MOVEMENT_CONFIG } from './config.js';
import { isKeyPressed } from './state.js';

/**
 * Factory to keep physics dependency injectable.
 * @param {Object} physicsConfig
 */
export const createMovementHandlers = (physicsConfig) => {
  const applyForwardMovement = (shipGroup, state) => {
    shipGroup.translateZ(state.speed);
  };

  const applyStrafeMovement = (shipGroup, state, controls) => {
    const speed = physicsConfig.VERTICAL_SPEED * (MOVEMENT_CONFIG.STRAFE_MULTIPLIER * 0.7);
    if (isKeyPressed(state, controls.strafeLeft)) shipGroup.translateX(-speed);
    if (isKeyPressed(state, controls.strafeRight)) shipGroup.translateX(speed);
    if (state.axes.strafe) shipGroup.translateX(state.axes.strafe * speed);
  };

  const applyVerticalMovement = (shipGroup, state, controls) => {
    const speed = physicsConfig.VERTICAL_SPEED * MOVEMENT_CONFIG.VERTICAL_MULTIPLIER;
    if (isKeyPressed(state, controls.moveUp) || state.keys.Space) shipGroup.translateY(speed);
    if (isKeyPressed(state, controls.moveDown) || state.keys.Shift) shipGroup.translateY(-speed);
  };

  return { applyForwardMovement, applyStrafeMovement, applyVerticalMovement };
};
