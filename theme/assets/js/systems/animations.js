/**
 * Ship animation helpers for smoother transitions (banking/accel).
 */

export const applyShipAnimations = (shipGroup, state) => {
    // Gentle damping on bank to avoid snapping
    state.currentBankAngle *= 0.99;
    // Add small bob based on speed
    const bob = Math.sin(Date.now() * 0.0015) * Math.min(0.02, Math.abs(state.speed) / 500000);
    shipGroup.position.y += bob;
};
