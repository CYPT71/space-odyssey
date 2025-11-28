/**
 * @fileoverview Scanner System (refined)
 * @description Visual sonar effect and object detection with encapsulated state.
 * @version 2.0.0
 */

import * as THREE from 'three';
import { emitGameplayEvent } from './gameplay-hooks.js';

// Shader for the scanner wave
const vertexShader = `
    varying vec3 vPosition;
    void main() {
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float time;
    uniform vec3 color;
    varying vec3 vPosition;

    void main() {
        float dist = length(vPosition);
        float radius = time * 500000.0;
        float width = 50000.0;
        float intensity = 1.0 - smoothstep(0.0, width, abs(dist - radius));
        float alpha = intensity * (1.0 - (radius / 10000000.0));
        if (alpha <= 0.01) discard;
        gl_FragColor = vec4(color, alpha * 0.5);
    }
`;

class ScannerSystem {
    #sceneRef;
    #audioRef;
    #mesh;
    #material;
    #isScanning = false;
    #scanTime = 0;
    #abortController = new AbortController();
    #scratchOrigin = new THREE.Vector3();

    constructor(scene, camera, audioSystem) {
        this.#sceneRef = new WeakRef(scene);
        this.#audioRef = audioSystem ? new WeakRef(audioSystem) : null;
        const geometry = new THREE.SphereGeometry(10000000, 64, 64);
        this.#material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00FFFF) }
            },
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        this.#mesh = new THREE.Mesh(geometry, this.#material);
        this.#mesh.visible = false;

        const sceneRef = this.#sceneRef.deref();
        if (sceneRef) sceneRef.add(this.#mesh);

        // Keyboard listener with AbortController for clean teardown
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                // No-op here; triggerScan should be called by external system with a position.
            }
        }, { signal: this.#abortController.signal });
    }

    triggerScan(origin) {
        if (this.#isScanning) return;
        const target = origin || this.#scratchOrigin.set(0, 0, 0);

        this.#isScanning = true;
        this.#scanTime = 0;

        this.#mesh.position.copy(target);
        this.#mesh.visible = true;
        this.#material.uniforms.time.value = 0;

        const audio = this.#audioRef?.deref();
        if (audio && typeof audio.playSound === 'function') {
            audio.playSound('scan');
        }
    }

    update(dt) {
        if (!this.#isScanning) return;
        this.#scanTime += dt;
        this.#material.uniforms.time.value = this.#scanTime;

        if (this.#scanTime > 5.0) {
            this.#isScanning = false;
            this.#mesh.visible = false;
            emitGameplayEvent('scanComplete', { position: this.#mesh.position.clone(), duration: this.#scanTime });
        }
    }

    dispose() {
        this.#abortController.abort();
        if (this.#mesh) {
            const sceneRef = this.#sceneRef.deref();
            if (sceneRef) sceneRef.remove(this.#mesh);
            this.#mesh.geometry.dispose();
            this.#mesh.material.dispose();
            this.#mesh = null;
        }
    }
}

export function createScannerSystem(scene, camera, audioSystem) {
    return new ScannerSystem(scene, camera, audioSystem);
}
