import * as THREE from 'three';
import { hideLoading } from '../systems/tutorial.js';

export const initializeGalaxy = ({
  scene,
  navigationHUD,
  galaxyManager,
  createProceduralPlanets,
  createAsteroidField,
  onReady = () => {}
}) => {
  let fsPollAttempts = 0;

  const initGalaxy = () => {
    if (window.fileSystem) {
      console.log('✓ File system found, initializing galaxy...');
      galaxyManager.initialize();

      const proceduralPlanets = createProceduralPlanets(150);
      proceduralPlanets.forEach((planet) => {
        scene.add(planet);
        navigationHUD.trackPlanet(planet);
        if (Math.random() > 0.7) {
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 500000,
            (Math.random() - 0.5) * 100000,
            (Math.random() - 0.5) * 500000
          );
          createAsteroidField(scene, 500, planet.position.clone().add(offset));
        }
      });

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
      onReady();
      return;
    }

    fsPollAttempts += 1;
    const pct = Math.min(99, Math.floor((fsPollAttempts / 300) * 100));
    console.log(`⏳ Waiting for file system... ${pct}%`);
    setTimeout(initGalaxy, 100);
  };

  initGalaxy();
};
