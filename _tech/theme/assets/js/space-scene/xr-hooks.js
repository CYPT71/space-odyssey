export const createXRHooks = ({  renderingSystem, clock, xrManager, mobileMode, markXRActive }) => {
  let xrActive = false;

  const tickXR = (tick) => {
    xrActive = true;
    renderingSystem.setXRActive(true);
    markXRActive?.(true);
    tick();
  };

  const enterXRMode = async (tick) => {
    if (!xrManager.hasXR || xrActive) return false;
    xrActive = true;
    renderingSystem.setXRActive(true);
    markXRActive?.(true);
    const ok = await xrManager.enterXR();
    if (!ok) {
      xrActive = false;
      renderingSystem.setXRActive(false);
      markXRActive?.(false);
      tick();
    }
    return ok;
  };

  const exitXRMode = async (tick) => {
    if (!xrActive) return;
    await xrManager.exitXR();
    xrActive = false;
    renderingSystem.setXRActive(false);
    markXRActive?.(false);
    clock.getDelta();
    tick();
  };

  const attachEasterEggButton = (tick) => {
    const xrButton = document.createElement('button');
    xrButton.id = 'xr-toggle';
    xrButton.textContent = 'Enter VR (experimental)';
    xrButton.className = 'xr-toggle-btn';

    if (mobileMode && xrManager.hasXR) {
      const settingsBtn = document.getElementById('settings-button');
      if (settingsBtn) {
        settingsBtn.addEventListener(
          'click',
          async () => {
            xrButton.style.display = 'inline-flex';
            const ok = await enterXRMode(tick);
            xrButton.textContent = ok ? 'Exit VR' : 'Enter VR (experimental)';
          },
          { once: true }
        );
      }
      document.body.appendChild(xrButton);
      xrButton.style.display = 'none';
      xrButton.addEventListener('click', async () => {
        if (xrActive) {
          await exitXRMode(tick);
          xrButton.textContent = 'Enter VR (experimental)';
        } else {
          const ok = await enterXRMode(tick);
          if (ok) xrButton.textContent = 'Exit VR';
        }
      });
    } else {
      xrButton.style.display = 'none';
    }
  };

  return {
    tickXR,
    enterXRMode,
    exitXRMode,
    attachEasterEggButton,
    isXRActive: () => xrActive
  };
};
