export const registerUIControls = ({
  shipControls,
  audioSystem,
  triggerTeleportEffect,
  uiManager,
  exitPointerLock,
  toggleFineControl,
}) => {
  const cleanupFns = [];

  const bind = (selector, event, handler) => {
    const el = document.getElementById(selector);
    if (!el) return;
    el.addEventListener(event, handler);
    cleanupFns.push(() => el.removeEventListener(event, handler));
  };

  bind("warp-boost", "mousedown", () => {
    shipControls.setSpeed(500);
    audioSystem.playSound("warp");
  });
  bind("warp-boost", "mouseup", () => {
    shipControls.setSpeed(0);
  });

  bind("return-base", "click", () => {
    shipControls.shipGroup?.position?.set?.(0, 0, 200);
    shipControls.setSpeed(0);
    triggerTeleportEffect();
    audioSystem.playSound("warp");
  });

  bind("fine-control", "click", () => {
    toggleFineControl();
  });

  const pointerLockHandler = () => {
    if (
      document.pointerLockElement !== document.body &&
      shipControls.isFineControlActive()
    ) {
      shipControls.setFineControl(false);
      const fineBtn = document.getElementById("fine-control");
      if (fineBtn) {
        fineBtn.classList.remove("active");
        fineBtn.textContent = "Fine Pilot";
      }
    }
  };
  document.addEventListener("pointerlockchange", pointerLockHandler);
  cleanupFns.push(() =>
    document.removeEventListener("pointerlockchange", pointerLockHandler)
  );

  const clickHandler = (e) => {
    const fineBtn = document.getElementById("fine-control");
    if (fineBtn && fineBtn.contains(e.target)) return;
    if (shipControls.isFineControlActive()) {
      shipControls.setFineControl(false);
      exitPointerLock();
    }
  };
  window.addEventListener("click", clickHandler);
  cleanupFns.push(() => window.removeEventListener("click", clickHandler));

  const backHandler = () => {
    const terminal = document.getElementById("reading-overlay");
    const terminalContent = document.getElementById("reading-content");
    if (!terminal || !terminalContent) return;
    if (window.readingHistory && window.readingHistory.length > 0) {
      const prev = window.readingHistory.pop();
      terminalContent.innerHTML = prev;
      terminal.classList.remove("hidden");
      uiManager.openReadingMode();
    } else {
      terminal.classList.add("hidden");
      uiManager.closeReadingMode();
      window.location.href = `${window.siteBase}/`;
    }
  };
  bind("reading-back", "click", backHandler);

  const escHandler = (e) => {
    if (e.key === "Escape") {
      shipControls.disengageAutopilot();
      const terminal = document.getElementById("reading-overlay");
      // const terminalContent = document.getElementById("reading-content");
      if (terminal) {
        terminal.classList.add("hidden");
        terminal.classList.remove("content-only");
        uiManager.closeReadingMode();
      }
      if (shipControls.isFineControlActive()) {
        shipControls.setFineControl(false);
      }
    }
  };
  window.addEventListener("keydown", escHandler);
  cleanupFns.push(() => window.removeEventListener("keydown", escHandler));

  return () => cleanupFns.forEach((fn) => fn && fn());
};
