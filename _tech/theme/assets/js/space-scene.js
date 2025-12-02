/**
 * @fileoverview Main Space Scene Orchestrator (Refactored)
 * @author CYPT71
 * @description Clean architecture entry point - coordinates all modules
 * @version 3.0.0
 * 
 */

import * as THREE from 'three';

// Infrastructure
import { initScene } from './infrastructure/scene-setup.js';

// Entities
import { createShip } from './entities/ship-model.js';
import { createProceduralPlanets } from './entities/procedural-planets.js';

// Systems
import { createShipControls } from './systems/ship-controls.js';
import { loadPageContent } from './init/content-loader.js';
import { createAudioSystem } from './systems/audio.js';
import { ParticleSystem } from './systems/particles.js';
import { createNavigationSystem } from './systems/navigation-hud.js';
import { createRadar } from './systems/radar.js';
import { createScannerSystem } from './systems/scanner-system.js';
import { createUIManager } from './systems/ui.js';
import { createEngagementSystem } from './systems/engagement-system.js';
import { createGalaxyManager } from './systems/space-object-manager.js';
import { createSettingsPanel } from './systems/settings.js';
import { createCameraController } from './systems/camera-controller.js';
import { createAsteroidField } from './systems/asteroid-system.js';
import { createMapSystem } from './systems/map-system.js';

// Core Modules (Refactored)
import { createRenderingSystem } from './core/rendering.js';
import { createPhysicsSystem } from './core/physics.js';
import { setupEventListeners as createInputSystem } from './core/input/index.js';
import { updateMinimap, updateCompass, openObjectTerminal } from './core/hud/index.js';
import { showLoading, hideLoading } from './systems/tutorial.js';
import { createXRManager } from './xr/xr-manager.js';
import { isMobile } from './utils/device.js';
import { parseHtml } from './utils/html-parser.js';

// ============================================================
// INITIALIZATION
// ============================================================

// Initialize scene, camera, and renderers
const { scene, camera, renderer, composer, labelRenderer } = initScene();
showLoading();
const clock = new THREE.Clock();
const mobileMode = isMobile();
if (mobileMode) {
    document.body.classList.add('mobile-mode');
    if (labelRenderer?.domElement) {
        labelRenderer.domElement.style.pointerEvents = 'auto';
    }
}

// Create the player's ship
const { shipGroup, updateLighting } = createShip(scene);

// Create camera controller
const cameraController = createCameraController(camera, shipGroup);

// Initialize all game systems
const shipControls = createShipControls(shipGroup);
const audioSystem = createAudioSystem();
const particleSystem = new ParticleSystem(scene, shipGroup);
const uiManager = createUIManager(audioSystem);
const galaxyManager = createGalaxyManager(scene, audioSystem);
const settingsPanel = createSettingsPanel();

// Initialize Navigation HUD (Must be before initGalaxy)
const navigationHUD = createNavigationSystem(document.body, camera);

// ============================================================
// GALAXY INITIALIZATION
// ============================================================

const initGalaxy = () => {
    if (window.fileSystem) {
        console.log('✓ File system found, initializing galaxy...');
        galaxyManager.initialize();

        // Add procedural planets
        const proceduralPlanets = createProceduralPlanets(150);
        proceduralPlanets.forEach(planet => {
            scene.add(planet);
            navigationHUD.trackPlanet(planet);

            // Add asteroid fields around some planets (30% chance)
            if (Math.random() > 0.7) {
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 500000,
                    (Math.random() - 0.5) * 100000,
                    (Math.random() - 0.5) * 500000
                );
                createAsteroidField(scene, 500, planet.position.clone().add(offset));
            }
        });

        // Create deep space asteroid fields
        for (let i = 0; i < 5; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * 20000000,
                (Math.random() - 0.5) * 5000000,
                (Math.random() - 0.5) * 20000000
            );
            createAsteroidField(scene, 1000, pos);
        }
        hideLoading();
        window.dispatchEvent(new CustomEvent('universeReady'));
    } else {
        fsPollAttempts += 1;
        const pct = Math.min(99, Math.floor((fsPollAttempts / 300) * 100)); // ~30s to 99%
        console.log(`⏳ Waiting for file system... ${pct}%`);
        setTimeout(initGalaxy, 100);
    }
};

let fsPollAttempts = 0;
initGalaxy();

// ============================================================
// CORE SYSTEMS INITIALIZATION
// ============================================================

// Initialize Scanner
const scannerSystem = createScannerSystem(scene, camera, audioSystem);
const engagementSystem = createEngagementSystem();

// Create core systems
const renderingSystem = createRenderingSystem({
    scene,
    camera,
    renderer,
    composer,
    labelRenderer,
    usePostProcessing: !mobileMode
});

const physicsSystem = createPhysicsSystem({
    shipControls,
    shipGroup,
    audioSystem,
    cameraController,
    particleSystem,
    navigationHUD,
    scannerSystem,
    galaxyManager,
    uiManager,
    updateLighting,
    clock
});

const inputSystem = createInputSystem({
    shipGroup,
    shipControls,
    audioSystem,
    uiManager,
    galaxyManager,
    scannerSystem,
    loadPageContent
})();


// Initialize Map System
const mapSystem = createMapSystem({
    galaxyManager,
    shipGroup,
    shipControls
});
const radar = createRadar({ galaxyManager, shipGroup });


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

let frameCount = 0;
let xrActive = false;
if (mobileMode) {
    const mobileStop = document.createElement('button');
    mobileStop.id = 'mobile-stop';
    mobileStop.textContent = 'STOP';
    mobileStop.addEventListener('click', () => {
        shipControls.disengageAutopilot && shipControls.disengageAutopilot();
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
    mobileTerminal.addEventListener('click', () => {
        // open terminal for closest object with content
        const closest = galaxyManager.findClosest(shipGroup.position);
        if (closest && closest.obj && openObjectTerminal(closest.obj)) return;
        const all = galaxyManager.getAllObjects();
        const hit = all.find(o => o.userData?.planetData?.url);
        if (hit) openObjectTerminal(hit);
    });
    document.body.appendChild(mobileTerminal);
    // Show utility buttons after first user interaction
    const revealMobileButtons = () => {
        mobileStop.style.display = 'inline-flex';
        mobileTerminal.style.display = 'inline-flex';
        window.removeEventListener('touchstart', revealMobileButtons);
        window.removeEventListener('click', revealMobileButtons);
    };
    window.addEventListener('touchstart', revealMobileButtons, { once: true });
    window.addEventListener('click', revealMobileButtons, { once: true });
}

const tick = () => {
    const delta = clock.getDelta();
    frameCount++;

    physicsSystem.update(delta);
    updateMinimap(shipGroup, galaxyManager, frameCount);
    updateCompass(shipGroup, galaxyManager, frameCount);
    radar.update();
    renderingSystem.render();
};

function animate() {
    if (xrActive) return;
    requestAnimationFrame(animate);
    tick();
}

// XR manager (progressive enhancement)
const xrManager = createXRManager({
    renderer,
    onXRFrame: () => {
        xrActive = true;
        renderingSystem.setXRActive(true);
        tick();
    }
});

const enterXRMode = async () => {
    if (!xrManager.hasXR || xrActive) return false;
    xrActive = true;
    renderingSystem.setXRActive(true);
    const ok = await xrManager.enterXR();
    if (!ok) {
        xrActive = false;
        renderingSystem.setXRActive(false);
        animate();
    }
    return ok;
};

const exitXRMode = async () => {
    if (!xrActive) return;
    await xrManager.exitXR();
    xrActive = false;
    renderingSystem.setXRActive(false);
    clock.getDelta(); // reset delta so next frame isn't huge
    animate();
};

// XR trigger: only on mobile and hidden as easter egg in settings button
const xrButton = document.createElement('button');
xrButton.id = 'xr-toggle';
xrButton.textContent = 'Enter VR (experimental)';
xrButton.className = 'xr-toggle-btn';
if (mobileMode && xrManager.hasXR) {
    const settingsBtn = document.getElementById('settings-button');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', async () => {
            xrButton.style.display = 'inline-flex';
            const ok = await enterXRMode();
            if (ok) {
                xrButton.textContent = 'Exit VR';
            } else {
                xrButton.textContent = 'Enter VR (experimental)';
            }
        }, { once: true });
    }
    document.body.appendChild(xrButton);
    xrButton.style.display = 'none';
    xrButton.addEventListener('click', async () => {
        if (xrActive) {
            await exitXRMode();
            xrButton.textContent = 'Enter VR (experimental)';
        } else {
            const ok = await enterXRMode();
            if (ok) xrButton.textContent = 'Exit VR';
        }
    });
} else {
    xrButton.style.display = 'none';
}

// Start the animation loop (non-XR)
animate();

// Implement planet teleportation (legacy support)
window.teleportToPlanetImpl = function (planetName) {
    const allPlanets = galaxyManager.getAllObjects();
    const planetMap = {};

    allPlanets.forEach(planet => {
        const planetData = planet.userData?.planetData;
        if (planetData && planetData.name && planetData.url) {
            const normalizedName = planetData.name.toUpperCase().trim();
            planetMap[normalizedName] = planetData.url;
        }
    });

    const normalizedInput = planetName.toUpperCase().trim();
    const targetUrl = planetMap[normalizedInput];

    if (!targetUrl) {
        console.warn(`Planet "${planetName}" not found in map`, planetMap);
        return;
    }

    // Custom Teleport Confirmation UI
    const showTeleportConfirmation = (targetName, onConfirm) => {
        // Create modal container
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

        // Title
        const title = document.createElement('h3');
        title.textContent = 'INITIATE TELEPORT SEQUENCE?';
        title.style.margin = '0 0 20px 0';
        title.style.textShadow = '0 0 5px #00F0FF';
        modal.appendChild(title);

        // Target info
        const info = document.createElement('p');
        info.textContent = `TARGET: ${targetName}`;
        info.style.marginBottom = '20px';
        modal.appendChild(info);

        // Buttons container
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'space-around';
        modal.appendChild(btnContainer);

        // Confirm Button
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

        // Cancel Button
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

    const targetPlanet = allPlanets.find(mesh => {
        return mesh.userData.planetData && mesh.userData.planetData.url === targetUrl;
    });

    if (!targetPlanet) {
        window.location.href = targetUrl;
        return;
    }

    const openTerminalUrl = (url) => {
        if (!url || !mobileMode) return false;
        const terminal = document.getElementById('reading-overlay');
        const terminalContent = document.getElementById('reading-content');
        if (!terminal || !terminalContent) return false;
        loadPageContent(url)
            .then(html => {
                const doc = parseHtml(html);
                const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;
                terminalContent.innerHTML = content ? content.innerHTML : html;
                terminal.classList.remove('hidden');
                if (window.uiManager && window.uiManager.openReadingMode) {
                    window.uiManager.openReadingMode();
                }
            })
            .catch(err => console.warn('Failed to open terminal content for', url, err));
        return true;
    };

    showTeleportConfirmation(planetName, () => {
        if (targetUrl) openTerminalUrl(targetUrl);
        audioSystem.playTeleportSound();

        const offset = 50;
        if (!targetPlanet.geometry.boundingSphere) targetPlanet.geometry.computeBoundingSphere();
        const size = targetPlanet.geometry.boundingSphere ? targetPlanet.geometry.boundingSphere.radius : 20;

        const targetPos = new THREE.Vector3();
        targetPlanet.getWorldPosition(targetPos);

        shipGroup.position.set(
            targetPos.x,
            targetPos.y,
            targetPos.z + size + offset
        );

        shipGroup.lookAt(targetPos);
        shipControls.setSpeed(0);

        inputSystem.triggerTeleportEffect();

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    });
};
