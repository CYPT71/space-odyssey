/**
 * @fileoverview Scanner System
 * @author CYPT71
 * @description Visual sonar effect and object detection
 * @version 1.0.0
 */

import * as THREE from 'three';

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
        // Calculate distance from center (0,0,0 local)
        float dist = length(vPosition);
        
        // Create expanding ring effect
        // Ring moves outward with time
        float radius = time * 500000.0; // Speed of wave
        float width = 50000.0; // Width of ring
        
        // Intensity based on distance from current radius
        float intensity = 1.0 - smoothstep(0.0, width, abs(dist - radius));
        
        // Fade out as it gets larger
        float alpha = intensity * (1.0 - (radius / 10000000.0));
        
        if (alpha <= 0.01) discard;
        
        gl_FragColor = vec4(color, alpha * 0.5);
    }
`;

export function createScannerSystem(scene, camera, audioSystem) {
    let isScanning = false;
    let scanTime = 0;
    let scanMesh = null;

    // Create scanner mesh (invisible initially)
    const geometry = new THREE.SphereGeometry(10000000, 64, 64); // Max range 10M
    const material = new THREE.ShaderMaterial({
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

    scanMesh = new THREE.Mesh(geometry, material);
    scanMesh.visible = false;
    scene.add(scanMesh);

    /**
     * Triggers a scan
     * @param {THREE.Vector3} origin - Ship position
     */
    const triggerScan = (origin) => {
        if (isScanning) return;

        isScanning = true;
        scanTime = 0;

        scanMesh.position.copy(origin);
        scanMesh.visible = true;
        material.uniforms.time.value = 0;

        // Play sound
        if (audioSystem && audioSystem.playSound) {
            audioSystem.playSound('scan');
        }

        // Logic to detect objects would go here
        // For now, purely visual
    };

    /**
     * Updates scanner effect
     * @param {number} dt - Delta time
     */
    const update = (dt) => {
        if (!isScanning) return;

        scanTime += dt;
        material.uniforms.time.value = scanTime;

        // End scan after duration
        if (scanTime > 5.0) { // 5 seconds duration
            isScanning = false;
            scanMesh.visible = false;
        }
    };

    // Listen for Tab key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent focus change
            // We need ship position, passed via update or stored reference
            // For now, we assume update is called with correct position context
            // But triggerScan needs to be called from outside or we need a ref to ship
        }
    });

    return {
        triggerScan,
        update
    };
}
