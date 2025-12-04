import * as THREE from "three";
import { getObjectType, getDetectionRange } from "../space-object-utils.js";

export const setupAutopilotCycle = ({
  shipGroup,
  galaxyManager,
  uiManager,
}) => {
  let cycleIndex = 0;
  const handler = (key) => {
    if (key !== (uiManager?.targetCycleKey || "n")) return;
    const shipPos = shipGroup.position;
    const allObjects = galaxyManager.getAllObjects();
    const candidates = allObjects
      .map((obj) => {
        const ud = obj.userData || {};
        const type = getObjectType(ud);
        if (type === "unknown") return null;
        const pos = new THREE.Vector3();
        obj.getWorldPosition(pos);
        const dist = shipPos.distanceTo(pos);
        const range = getDetectionRange(type);
        return { obj, dist, type, range };
      })
      .filter(Boolean);

    if (!candidates.length) return;
    const minDist = Math.min(...candidates.map((c) => c.dist));
    const filtered = candidates
      .filter(
        (c) =>
          c.range && c.dist <= Math.min(c.range * 0.25, minDist + 20000)
      )
      .sort((a, b) => a.dist - b.dist);
    if (!filtered.length) return;
    cycleIndex = (cycleIndex + 1) % filtered.length;
    const pick = filtered[cycleIndex];
    const name =
      pick.obj.userData?.planetData?.title ||
      pick.obj.userData?.planetData?.name ||
      pick.obj.userData?.cloudName ||
      pick.obj.userData?.categoryName ||
      "Object";
    uiManager.hudTarget.textContent = `TARGET: ${name}`;
    window.manualTarget = pick.obj;
  };

  const listener = (e) => handler(e.key.toLowerCase());
  window.addEventListener("keydown", listener);
  return () => window.removeEventListener("keydown", listener);
};
