import * as THREE from 'three';
import { initScene } from '../infrastructure/scene-setup.js';
import { createShip } from '../entities/ship-model.js';
import { createProceduralPlanets } from '../entities/procedural-planets.js';
import { createShipControls } from '../inputs/ship-controls.js';
import { loadPageContent } from '../init/content-loader.js';
import { createAudioSystem } from '../systems/audio.js';
import { ParticleSystem } from '../systems/particles.js';
import { createNavigationSystem } from '../systems/navigation-hud.js';
import { createRadar } from '../systems/radar.js';
import { createScannerSystem } from '../systems/scanner-system.js';
import { createUIManager } from '../systems/ui.js';
import { createEngagementSystem } from '../systems/engagement-system.js';
import { createGalaxyManager } from '../systems/space-object-manager.js';
import { createSettingsPanel } from '../systems/settings.js';
import { createCameraController } from '../systems/camera-controller.js';
import { createAsteroidField } from '../systems/asteroid-system.js';
import { createMapSystem } from '../systems/map-system.js';
import { createRenderingSystem } from '../core/rendering.js';
import { createPhysicsSystem } from '../core/physics.js';
import { setupEventListeners as createInputSystem } from '../core/input/index.js';
import { updateMinimap, updateCompass } from '../core/hud/index.js';
import { showLoading } from '../systems/tutorial.js';
import { isMobile } from '../utils/device.js';

export const bootstrapCore = () => {
  const { scene, camera, renderer, composer, labelRenderer } = initScene();
  showLoading();
  const clock = new THREE.Clock();
  const mobileMode = isMobile();
  if (mobileMode) {
    document.body.classList.add('mobile-mode');
    if (labelRenderer?.domElement) labelRenderer.domElement.style.pointerEvents = 'auto';
  }

  const { shipGroup, updateLighting } = createShip(scene);
  const cameraController = createCameraController(camera, shipGroup);
  const shipControls = createShipControls(shipGroup);
  const audioSystem = createAudioSystem();
  const particleSystem = new ParticleSystem(scene, shipGroup);
  const uiManager = createUIManager(audioSystem);
  const galaxyManager = createGalaxyManager(scene, audioSystem);
  const settingsPanel = createSettingsPanel();
  const navigationHUD = createNavigationSystem(document.body, camera);
  const scannerSystem = createScannerSystem(scene, camera, audioSystem);
  const engagementSystem = createEngagementSystem();

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

  const mapSystem = createMapSystem({ galaxyManager, shipGroup, shipControls });
  const radar = createRadar({ galaxyManager, shipGroup });

  return {
    scene,
    camera,
    renderer,
    composer,
    labelRenderer,
    clock,
    mobileMode,
    shipGroup,
    shipControls,
    audioSystem,
    particleSystem,
    uiManager,
    galaxyManager,
    settingsPanel,
    navigationHUD,
    scannerSystem,
    engagementSystem,
    renderingSystem,
    physicsSystem,
    inputSystem,
    mapSystem,
    radar,
    createAsteroidField,
    createProceduralPlanets,
    updateMinimap,
    updateCompass
  };
};
