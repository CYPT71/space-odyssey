import { bootstrapCore } from './space-scene/core-setup.js';
import { initializeGalaxy } from './space-scene/galaxy-init.js';
import { attachMobileControls } from './space-scene/mobile-ui.js';
import { createXRHooks } from './space-scene/xr-hooks.js';
import { createMainLoop } from './space-scene/loop.js';
import { attachLegacyTeleport } from './space-scene/teleport-legacy.js';
import { createXRManager } from './xr/xr-manager.js';
import { openObjectTerminal } from './core/hud/index.js';

const core = bootstrapCore();
const {
    scene,
    renderer,
    clock,
    mobileMode,
    shipGroup,
    shipControls,
    audioSystem,
    uiManager,
    galaxyManager,
    navigationHUD,
    renderingSystem,
    physicsSystem,
    inputSystem,
    radar,
    createAsteroidField,
    createProceduralPlanets,
    updateMinimap,
    updateCompass
} = core;

// ============================================================
// GALAXY INITIALIZATION
// ============================================================

initializeGalaxy({
    scene,
    navigationHUD,
    galaxyManager,
    createProceduralPlanets,
    createAsteroidField
});

// ============================================================
// CORE SYSTEMS INITIALIZATION
// ============================================================

// Initialize Scanner
// Warp boost integration
const originalActivateBoost = uiManager.activateWarpBoost.bind(uiManager);
uiManager.activateWarpBoost = function () {
    const shouldBoost = originalActivateBoost();
    if (shouldBoost) {
        shipControls.activateWarpBoost();
    }
};

// ============================================================
// MAIN ANIMATION LOOP
// ============================================================

const loop = createMainLoop({
    renderingSystem,
    physicsSystem,
    updateMinimap,
    updateCompass,
    radar,
    shipGroup,
    galaxyManager,
    clock
});

if (mobileMode) {
    attachMobileControls({ shipControls, galaxyManager, shipGroup, openObjectTerminal });
}

// XR manager (progressive enhancement)
const xrManager = createXRManager({
    renderer,
    onXRFrame: () => {
        loop.markXRActive(true);
        loop.tick();
    }
});

const xrHooks = createXRHooks({
    renderer,
    renderingSystem,
    clock,
    xrManager,
    mobileMode,
    markXRActive: loop.markXRActive
});
xrHooks.attachEasterEggButton(loop.tick);

// Start the animation loop (non-XR)
loop.animate();

attachLegacyTeleport({
    galaxyManager,
    audioSystem,
    shipGroup,
    shipControls,
    inputSystem,
    mobileMode,
    loadPageContent
});
