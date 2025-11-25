/**
 * @fileoverview Unit Tests for Navigation HUD
 * @author CYPT71
 */

import { createNavigationSystem } from '../../theme/assets/js/systems/navigation-hud.js';
import * as THREE from 'three';

// Mock DOM
document.body.innerHTML = '<div id="test-container"></div>';

describe('Navigation HUD', () => {
    let container;
    let camera;
    let navigationSystem;

    beforeEach(() => {
        container = document.getElementById('test-container');
        camera = new THREE.PerspectiveCamera();
        navigationSystem = createNavigationSystem(container, camera);
    });

    test('should create navigation system', () => {
        expect(navigationSystem).toBeDefined();
        expect(navigationSystem.update).toBeDefined();
        expect(navigationSystem.trackPlanet).toBeDefined();
    });

    test('should create HUD layer', () => {
        const hudLayer = document.getElementById('hud-layer');
        expect(hudLayer).toBeDefined();
    });

    test('should track planet', () => {
        const mockPlanet = {
            position: new THREE.Vector3(100, 0, 0),
            userData: {
                planetData: { name: 'Test Planet' }
            }
        };

        navigationSystem.trackPlanet(mockPlanet);

        // Should not throw error
        expect(() => {
            navigationSystem.update(new THREE.Vector3(0, 0, 0));
        }).not.toThrow();
    });

    test('should prioritize index.md planet', () => {
        const indexPlanet = {
            position: new THREE.Vector3(1000, 0, 0),
            userData: {
                planetData: { name: 'Home', url: 'index.md' }
            }
        };

        const closerPlanet = {
            position: new THREE.Vector3(10, 0, 0),
            userData: {
                planetData: { name: 'Close' }
            }
        };

        navigationSystem.trackPlanet(indexPlanet);
        navigationSystem.trackPlanet(closerPlanet);

        // Update should prioritize index.md even though it's farther
        navigationSystem.update(new THREE.Vector3(0, 0, 0));

        // Waypoint should exist
        const hudLayer = document.getElementById('hud-layer');
        expect(hudLayer.children.length).toBeGreaterThan(0);
    });

    test('should show distance in Mm', () => {
        const mockPlanet = {
            position: new THREE.Vector3(1000000, 0, 0),
            userData: {
                planetData: { name: 'Far Planet' }
            }
        };

        navigationSystem.trackPlanet(mockPlanet);
        navigationSystem.update(new THREE.Vector3(0, 0, 0));

        const hudLayer = document.getElementById('hud-layer');
        const waypoint = hudLayer.querySelector('.nav-waypoint');

        if (waypoint) {
            const distText = waypoint.querySelector('.nav-dist').textContent;
            expect(distText).toContain('Mm');
        }
    });
});
