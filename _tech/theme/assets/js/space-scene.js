import { bootstrapCore } from './space-scene/core-setup.js';
import { initializeGalaxy } from './space-scene/galaxy-init.js';
import { attachMobileControls } from './space-scene/mobile-ui.js';
import { setupXRLoop } from './space-scene/xr-loop.js';
import { createMainLoop } from './space-scene/loop.js';
import { attachLegacyTeleport } from './space-scene/teleport-legacy.js';
import { openObjectTerminal } from './core/hud/index.js';
import { attachWarpBoost } from './space-scene/warp-boost.js';

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

attachWarpBoost({ uiManager, shipControls });

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
const { xrManager } = setupXRLoop({
    renderer,
    renderingSystem,
    clock,
    mobileMode,
    loop
});

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
