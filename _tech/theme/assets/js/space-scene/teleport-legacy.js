import * as THREE from 'three';
import { parseHtml } from '../utils/html-parser.js';

const createTeleportModal = (planetName, onConfirm) => {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'rgba(0, 20, 40, 0.95)';
  modal.style.border = '2px solid #00F0FF';
  modal.style.padding = '20px';
  modal.style.zIndex = '10000';
  modal.style.color = '#00F0FF';
  modal.style.fontFamily = 'monospace';
  modal.style.textAlign = 'center';
  modal.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)';
  modal.style.minWidth = '300px';

  const title = document.createElement('h3');
  title.textContent = 'INITIATE TELEPORT SEQUENCE?';
  title.style.margin = '0 0 20px 0';
  title.style.textShadow = '0 0 5px #00F0FF';
  modal.appendChild(title);

  const info = document.createElement('p');
  info.textContent = `TARGET: ${planetName}`;
  info.style.marginBottom = '20px';
  modal.appendChild(info);

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.justifyContent = 'space-around';
  modal.appendChild(btnContainer);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'ENGAGE';
  confirmBtn.style.backgroundColor = '#00F0FF';
  confirmBtn.style.color = '#000';
  confirmBtn.style.border = 'none';
  confirmBtn.style.padding = '10px 20px';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.style.fontWeight = 'bold';
  confirmBtn.style.fontFamily = 'monospace';
  confirmBtn.onclick = () => {
    document.body.removeChild(modal);
    onConfirm();
  };
  btnContainer.appendChild(confirmBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'ABORT';
  cancelBtn.style.backgroundColor = 'transparent';
  cancelBtn.style.color = '#FF3300';
  cancelBtn.style.border = '1px solid #FF3300';
  cancelBtn.style.padding = '10px 20px';
  cancelBtn.style.cursor = 'pointer';
  cancelBtn.style.fontWeight = 'bold';
  cancelBtn.style.fontFamily = 'monospace';
  cancelBtn.onclick = () => {
    document.body.removeChild(modal);
  };
  btnContainer.appendChild(cancelBtn);

  document.body.appendChild(modal);
};

export const attachLegacyTeleport = ({
  galaxyManager,
  audioSystem,
  shipGroup,
  shipControls,
  inputSystem,
  mobileMode,
  loadPageContent
}) => {
  window.teleportToPlanetImpl = function (planetName) {
    const allPlanets = galaxyManager.getAllObjects();
    const planetMap = {};
    allPlanets.forEach((planet) => {
      const planetData = planet.userData?.planetData;
      if (planetData?.name && planetData.url) {
        planetMap[planetData.name.toUpperCase().trim()] = planetData.url;
      }
    });
    const targetUrl = planetMap[planetName.toUpperCase().trim()];
    if (!targetUrl) {
      console.warn(`Planet "${planetName}" not found in map`, planetMap);
      return;
    }

    const openTerminalUrl = (url) => {
      if (!url || !mobileMode) return false;
      const terminal = document.getElementById('reading-overlay');
      const terminalContent = document.getElementById('reading-content');
      if (!terminal || !terminalContent) return false;
      loadPageContent(url)
        .then((html) => {
          const doc = parseHtml(html);
          const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;
          terminalContent.innerHTML = content ? content.innerHTML : html;
          terminal.classList.remove('hidden');
          if (window.uiManager?.openReadingMode) window.uiManager.openReadingMode();
        })
        .catch((err) => console.warn('Failed to open terminal content for', url, err));
      return true;
    };

    const targetPlanet = allPlanets.find((mesh) => mesh.userData?.planetData?.url === targetUrl);
    if (!targetPlanet) {
      window.location.href = targetUrl;
      return;
    }

    createTeleportModal(planetName, () => {
      if (targetUrl) openTerminalUrl(targetUrl);
      audioSystem.playTeleportSound();

      if (!targetPlanet.geometry.boundingSphere) targetPlanet.geometry.computeBoundingSphere();
      const size = targetPlanet.geometry.boundingSphere ? targetPlanet.geometry.boundingSphere.radius : 20;

      const targetPos = new THREE.Vector3();
      targetPlanet.getWorldPosition(targetPos);
      shipGroup.position.set(targetPos.x, targetPos.y, targetPos.z + size + 50);
      shipGroup.lookAt(targetPos);
      shipControls.setSpeed(0);
      inputSystem.triggerTeleportEffect();

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500);
    });
  };
};
