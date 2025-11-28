/**
 * @fileoverview Unit Tests for Galaxy Trails
 * @author CYPT71
 */

import { createGalaxyTrails, createAnimatedTrails, updateAnimatedTrails, removeAllTrails } from '../theme/assets/js/systems/galaxy-trails.js';
import * as THREE from 'three';

describe('Galaxy Trails System', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: jest.fn(),
            remove: jest.fn(),
            traverse: jest.fn()
        };
    });

    describe('createGalaxyTrails', () => {
        test('should return null for less than 2 planets', () => {
            const result = createGalaxyTrails(mockScene, [], new THREE.Color());
            expect(result).toBeNull();
        });

        test('should create trail group for multiple planets', () => {
            const planets = [
                { position: new THREE.Vector3(0, 0, 0) },
                { position: new THREE.Vector3(100, 0, 0) },
                { position: new THREE.Vector3(0, 100, 0) }
            ];

            const trailGroup = createGalaxyTrails(mockScene, planets, new THREE.Color(0xff0000));

            expect(trailGroup).toBeDefined();
            expect(trailGroup.userData.isTrailGroup).toBe(true);
            expect(mockScene.add).toHaveBeenCalled();
        });

        test('should connect planets to nearest neighbors', () => {
            const planets = [
                { position: new THREE.Vector3(0, 0, 0) },
                { position: new THREE.Vector3(100, 0, 0) }
            ];

            const trailGroup = createGalaxyTrails(mockScene, planets, new THREE.Color(0x00ff00));

            expect(trailGroup.children.length).toBeGreaterThan(0);
        });
    });

    describe('createAnimatedTrails', () => {
        test('should return null for less than 2 planets', () => {
            const result = createAnimatedTrails(mockScene, [{ position: new THREE.Vector3() }], new THREE.Color());
            expect(result).toBeNull();
        });

        test('should create animated particle system', () => {
            const planets = [
                { position: new THREE.Vector3(0, 0, 0) },
                { position: new THREE.Vector3(1000, 0, 0) }
            ];

            const particles = createAnimatedTrails(mockScene, planets, new THREE.Color(0x0000ff));

            expect(particles).toBeDefined();
            expect(particles.userData.isAnimatedTrail).toBe(true);
            expect(particles.userData.velocities).toBeDefined();
        });

        test('should create particles along trail paths', () => {
            const planets = [
                { position: new THREE.Vector3(0, 0, 0) },
                { position: new THREE.Vector3(1000, 0, 0) }
            ];

            const particles = createAnimatedTrails(mockScene, planets, new THREE.Color());
            const positions = particles.geometry.attributes.position;

            expect(positions.count).toBeGreaterThan(0);
        });
    });

    describe('updateAnimatedTrails', () => {
        test('should update particle positions', () => {
            const planets = [
                { position: new THREE.Vector3(0, 0, 0) },
                { position: new THREE.Vector3(1000, 0, 0) }
            ];

            const particles = createAnimatedTrails(mockScene, planets, new THREE.Color());
            const initialPos = particles.geometry.attributes.position.array[0];

            updateAnimatedTrails(particles, 0.1);

            // Position should change due to animation
            expect(particles.geometry.attributes.position.needsUpdate).toBe(true);
        });

        test('should handle non-trail objects gracefully', () => {
            const regularObject = new THREE.Points();
            expect(() => updateAnimatedTrails(regularObject, 0.1)).not.toThrow();
        });
    });

    describe('removeAllTrails', () => {
        test('should remove trails from scene', () => {
            const mockTrail = {
                userData: { isTrail: true },
                geometry: { dispose: jest.fn() },
                material: { dispose: jest.fn() }
            };

            mockScene.traverse = jest.fn((callback) => {
                callback(mockTrail);
            });

            removeAllTrails(mockScene);

            expect(mockTrail.geometry.dispose).toHaveBeenCalled();
            expect(mockTrail.material.dispose).toHaveBeenCalled();
            expect(mockScene.remove).toHaveBeenCalledWith(mockTrail);
        });
    });
});
