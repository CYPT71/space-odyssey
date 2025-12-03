export const attachMobileControls = ({ shipControls, galaxyManager, shipGroup, openObjectTerminal }) => {
  const mobileStop = document.createElement('button');
  mobileStop.id = 'mobile-stop';
  mobileStop.textContent = 'STOP';
  mobileStop.style.display = 'none';
  mobileStop.addEventListener('click', () => {
    shipControls.disengageAutopilot();
    shipControls.setForward(0);
    shipControls.setStrafe(0);
    shipControls.setYaw(0);
    shipControls.setPitch(0);
    shipControls.setSpeed(0);
  });
  document.body.appendChild(mobileStop);

  const mobileTerminal = document.createElement('button');
  mobileTerminal.id = 'mobile-terminal';
  mobileTerminal.textContent = 'TERMINAL';
  mobileTerminal.style.display = 'none';
  mobileTerminal.addEventListener('click', () => {
    const closest = galaxyManager.findClosest(shipGroup.position);
    if (closest && closest.obj && openObjectTerminal(closest.obj)) return;
    const all = galaxyManager.getAllObjects();
    const hit = all.find((o) => o.userData?.planetData?.url);
    if (hit) openObjectTerminal(hit);
  });
  document.body.appendChild(mobileTerminal);

  const reveal = () => {
    mobileStop.style.display = 'inline-flex';
    mobileTerminal.style.display = 'inline-flex';
    window.removeEventListener('touchstart', reveal);
    window.removeEventListener('click', reveal);
  };

  window.addEventListener('touchstart', reveal, { once: true });
  window.addEventListener('click', reveal, { once: true });
};
