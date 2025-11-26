/**
 * @fileoverview Main Space Scene Orchestrator (Refactored)
 * @author CYPT71
 * @description Clean architecture entry point - coordinates all modules
 * @version 3.0.0
 */

import * as THREE from 'three';

// Infrastructure
import { initScene } from './infrastructure/scene-setup.js';

// Entities
import { createShip } from './entities/ship-model.js';
import { createProceduralPlanets } from './entities/procedural-planets.js';

// Systems
import { createShipControls } from './systems/ship-controls.js';
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
import { createInputSystem } from './core/input.js';
import { updateMinimap, updateCompass } from './core/hud-utils.js';
import { showLoading, hideLoading } from './systems/tutorial.js';

// ============================================================
// INITIALIZATION
// ============================================================

// Initialize scene, camera, and renderers
const { scene, camera, renderer, composer, labelRenderer } = initScene();
showLoading();
const clock = new THREE.Clock();

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
        console.log('⏳ Waiting for file system...');
        setTimeout(initGalaxy, 100);
    }
};

initGalaxy();

// ============================================================
// CORE SYSTEMS INITIALIZATION
// ============================================================

// Initialize Scanner
const scannerSystem = createScannerSystem(scene, camera, audioSystem);
const engagementSystem = createEngagementSystem();

// Create core systems
const renderingSystem = createRenderingSystem({ scene, camera, composer, labelRenderer });

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
    scannerSystem
});

// Setup all event listeners
inputSystem.setupEventListeners();

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

function animate() {
    requestAnimationFrame(animate);
    frameCount++;

    const delta = clock.getDelta();

    // Update physics/game logic
    physicsSystem.update(delta);

    // Update HUD utilities
    updateMinimap(shipGroup, galaxyManager, frameCount);
    updateCompass(shipGroup, galaxyManager, frameCount);
    radar.update();

    // Render frame
    renderingSystem.render();
}

// Start the animation loop
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

    showTeleportConfirmation(planetName, () => {
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
