/**
 * @fileoverview Input Handling Module
 * @author CYPT71
 * @description Handles user input, teleportation, and UI interactions
 */

import { Vector3 } from 'three';
import { setupTeleportHandlers } from "./teleport-handlers.js";
import { setupKeyboardHandlers } from "./keyboard-handlers.js";
import { registerUIControls } from "./ui-controls.js";
import { setupFineControl } from "./fine-control.js";
import { setupAutopilotCycle } from "./autopilot-cycle.js";
import { createTeleportEffect } from "./effects.js";
import { createContentNavigator } from "./content-navigation.js";
import { createTeleportConfirm } from "./teleport-modal.js";
import { setupMobileInput } from "./mobile-input.js";

/**
 * Creates the input handling system
 * @param {shipGroup, shipControls, audioSystem, uiManager, galaxyManager, scannerSystem, } systems - All game systems
 * @returns {Object} Input handling functions
 */
export function setupEventListeners(systems) {
  const { shipControls } = systems;

  const scratchVector = new Vector3();
  systems.scratchVector = scratchVector;

  const { triggerTeleportEffect } = createTeleportEffect(systems);
  systems.triggerTeleportEffect = triggerTeleportEffect;

  const { showTeleportConfirm } = createTeleportConfirm();
  systems.showTeleportConfirm = showTeleportConfirm;

  const terminal = document.getElementById('reading-overlay');
  const terminalContent = document.getElementById('reading-content');
  systems.terminal = terminal;
  systems.terminalContent = terminalContent;

  const { interceptLinksInContent } = createContentNavigator({
    ...systems,
    terminal,
    terminalContent,
  });
  systems.interceptLinksInContent = interceptLinksInContent;

  setupKeyboardHandlers(systems);
  setupMobileInput(systems);
  setupTeleportHandlers(systems);
  registerUIControls(systems);
  setupAutopilotCycle(systems);
  const { exitPointerLock } = setupFineControl(systems);

  const cleanupFns = [];

  const pointerLockHandler = () => {
    if (!document.pointerLockElement && shipControls.isFineControlActive()) {
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

  return () => {
    cleanupFns.forEach((fn) => fn && fn());
  }
}
