import { Vector3 } from 'three';

const isValidTarget = (obj) => obj && typeof obj.getWorldPosition === 'function' && obj.matrixWorld;

export const setupTeleportHandlers = ({
  galaxyManager,
  shipGroup,
  shipControls,
  audioSystem,
  uiManager,
  showTeleportConfirm,
  triggerTeleportEffect,
  scratchVector = new Vector3(),
}) => {
  const moveShip = (target, verticalOffset = 0) => {
    if (!isValidTarget(target)) return;
    target.getWorldPosition(scratchVector);
    shipGroup.position.copy(scratchVector);
    shipGroup.position.y += verticalOffset;
    shipControls.setSpeed(0);
    triggerTeleportEffect?.();
    audioSystem?.playSound('warp');
  };

  const dispatchTeleport = (target) => {
    if (!isValidTarget(target)) return;

    if (target.userData?.galaxyData) {
      const galaxyName = target.userData.galaxyData.name || 'Galaxy';
      showTeleportConfirm?.(
        'PILOT CONFIRMATION',
        `Teleport to galaxy "${galaxyName}"?`,
        () => moveShip(target, 50)
      );
      return;
    }

    if (target.userData?.isNebula) {
      const nebulaName = target.userData.nebulaName || target.userData.tagName || 'Nebula';
      showTeleportConfirm?.(
        'PILOT CONFIRMATION',
        `Teleport to nebula "${nebulaName}"?`,
        () => moveShip(target, 50)
      );
      return;
    }

    if (target.userData?.isGasCloud) {
      moveShip(target, 150);
      return;
    }

    if (target.userData?.planetData) {
      moveShip(target, 8);
    }
  };

  const resolveTarget = (detail) => {
    if (!detail) return null;
    if (detail.object && isValidTarget(detail.object)) return detail.object;
    return galaxyManager.getAllObjects().find((o) => o.uuid === detail.uuid) || null;
  };

  const teleportHandler = (event) => {
    const target = resolveTarget(event.detail);
    if (!target) return;
    uiManager?.closeReadingMode?.();
    dispatchTeleport(target);
  };

  window.teleportTo = (uuid, object) => {
    window.dispatchEvent(
      new CustomEvent('teleportRequest', { detail: { uuid, object } })
    );
  };

  window.addEventListener('teleportRequest', teleportHandler);

  return () => {
    window.removeEventListener('teleportRequest', teleportHandler);
  };
};
