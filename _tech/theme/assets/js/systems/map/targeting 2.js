import * as THREE from 'three';
import { isMobile } from '../../utils/device.js';
import { loadPageContent } from '../../init/content-loader.js';
import { parseHtml } from '../../utils/html-parser.js';

const isTargetable = (ud) => ud.planetData || ud.isNebula || ud.isGasCloud || ud.galaxyData || ud.isGalaxy;

const openTerminalMobile = async (closest) => {
  const userData = closest.userData || {};
  if (!userData.planetData?.url) return false;
  try {
    const html = await loadPageContent(userData.planetData.url);
    const doc = parseHtml(html);
    const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;
    const terminal = document.getElementById('reading-overlay');
    const terminalContent = document.getElementById('reading-content');
    if (terminal && terminalContent) {
      terminalContent.textContent = content ? content.textContent || '' : html;
      terminal.classList.remove('hidden');
      if (window.uiManager?.openReadingMode) window.uiManager.openReadingMode();
    }
    return true;
  } catch {
    return false;
  }
};

export const handleTargeting = (state, event) => {
  const { canvas, galaxyManager, shipGroup, shipControls } = state;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const worldX = (event.clientX - cx - state.offset.x) / state.scale;
  const worldZ = (event.clientY - cy - state.offset.y) / state.scale;

  const allObjects = galaxyManager.getAllObjects();
  let closest = null;
  let minD = Infinity;

  allObjects.forEach((obj) => {
    if (!isTargetable(obj.userData || {})) return;
    const objPos = new THREE.Vector3();
    obj.getWorldPosition(objPos);
    const d = new THREE.Vector2(objPos.x - worldX, objPos.z - worldZ).length();
    const hitRadius = 20 / state.scale;
    if (d < hitRadius && d < minD) {
      minD = d;
      closest = obj;
    }
  });

  if (!closest) {
    const shipPos = new THREE.Vector3();
    shipGroup.getWorldPosition(shipPos);
    const NEAR_FALLBACK_DIST = 10000;
    allObjects.forEach((obj) => {
      if (!isTargetable(obj.userData || {})) return;
      const objPos = new THREE.Vector3();
      obj.getWorldPosition(objPos);
      const d = shipPos.distanceTo(objPos);
      if (d < NEAR_FALLBACK_DIST && d < minD) {
        minD = d;
        closest = obj;
      }
    });
  }

  if (!closest) return;
  const userData = closest.userData || {};
  const requireConfirmation = localStorage.getItem('autopilotConfirmation') !== 'false';

  if (isMobile() && userData.planetData?.url) {
    openTerminalMobile(closest).then((opened) => {
      if (!opened) window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid: closest.uuid } }));
    });
    return;
  }

  const engageAutopilot = () => {
    const targetPos = new THREE.Vector3();
    closest.getWorldPosition(targetPos);
    let stopDistance = 100000;
    if (userData.isGasCloud || userData.cloudData) stopDistance = 500000;
    if (userData.galaxyData || userData.isGalaxy) stopDistance = 0;
    if (userData.isNebula) stopDistance = 0;
    const approachOffset = stopDistance > 0 ? new THREE.Vector3(0, 0, 20000) : new THREE.Vector3(0, 0, 0);
    shipControls.engageAutopilot(targetPos.clone().add(approachOffset), stopDistance, closest);
    state.isOpen = false;
    state.overlay.style.display = 'none';
    const notification = document.createElement('div');
    notification.textContent = '⚡ WARP 20 ENGAGED - MAXIMUM SPEED UNTIL ATMOSPHERE';
    notification.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,0,255,0.9);color:#fff;padding:20px;border-radius:10px;font-family:monospace;z-index:10000;font-size:18px;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  if (requireConfirmation) {
    window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid: closest.uuid } }));
  } else {
    engageAutopilot();
  }
};
