// Scene Setup Module
// Initializes Three.js scene, camera, renderer, and post-processing

import * as THREE from 'three';
import { SimpleComposer } from './post-processing.js';
import { CSS2DRenderer } from './css2d-renderer.js';

export function initScene() {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera - ULTRA MASSIVE UNIVERSE
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,        // Near plane - doit rester petit pour voir le vaisseau
        10000000    // x1000: Far plane pour voir tout l'univers
    );
    camera.position.set(0, 2, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.getElementById('webgl-container').appendChild(renderer.domElement);

    // Lighting - SPACE ENGINEERS STYLE
    // Lumière ambiante plus forte pour voir les planètes et le vaisseau
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Augmenté de 0.6 à 1.0
    scene.add(ambientLight);

    // Lumière directionnelle principale (soleil)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2); // Augmenté de 0.8 à 1.2
    directionalLight.position.set(5000000, 10000000, 7500000); // x1000 pour suivre l'échelle
    scene.add(directionalLight);

    // Lumière de remplissage pour éviter les zones trop sombres
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5000000, -5000000, -5000000);
    scene.add(fillLight);

    // Post-processing (Simple Bloom)
    const composer = new SimpleComposer(renderer, scene, camera);

    // CSS2D Renderer for labels
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.getElementById('webgl-container').appendChild(labelRenderer.domElement);

    // Window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, composer, labelRenderer };
}
