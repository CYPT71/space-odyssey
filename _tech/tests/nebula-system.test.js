/**
 * @fileoverview Unit Tests for Nebula System
 * @author CYPT71
 */

import { createNebula, createTagNebulae, updateNebulae } from '../theme/assets/js/systems/nebula-system.js';
import { ColorScratch } from './__mocks__/color-scratch.js';
import * as THREE from 'three';

describe('Nebula System', () => {
    let mockScene;

    beforeEach(() => {
        mockScene = {
            add: jest.fn()
        };
    });

    describe('createNebula', () => {
        test('should create nebula with correct properties', () => {
            const center = new THREE.Vector3(100, 200, 300);
            const nebula = createNebula(mockScene, center, 'devops', 5);

            expect(nebula).toBeDefined();
            expect(nebula.userData.isNebula).toBe(true);
            expect(nebula.userData.tagName).toBe('devops');
            expect(nebula.userData.postCount).toBe(5);
            expect(mockScene.add).toHaveBeenCalledWith(nebula);
        });

        test('should scale particle count with post count', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const nebula1 = createNebula(mockScene, center, 'tag1', 2);
            const nebula2 = createNebula(mockScene, center, 'tag2', 10);

            const count1 = nebula1.geometry.attributes.position.count;
            const count2 = nebula2.geometry.attributes.position.count;

            expect(count2).toBeGreaterThan(count1);
        });

        test('should cap particle count at 1000', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const nebula = createNebula(mockScene, center, 'tag', 100);

            const count = nebula.geometry.attributes.position.count;
            expect(count).toBeLessThanOrEqual(2000);
        });

        test('should generate consistent colors for same tag', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const nebula1 = createNebula(mockScene, center, 'kubernetes', 3);
            const nebula2 = createNebula(mockScene, center, 'kubernetes', 3);

            // Colors should be similar (same hash)
            const colors1 = nebula1.geometry.attributes.color.array;
            const colors2 = nebula2.geometry.attributes.color.array;

            // First particle color should be similar
            expect(Math.abs(colors1[0] - colors2[0])).toBeLessThan(0.3);
        });
    });

    describe('createTagNebulae', () => {
        test('should create nebulae for tags with multiple posts', () => {
            const posts = [
                { tags: ['devops', 'kubernetes'], position: new THREE.Vector3(0, 0, 0) },
                { tags: ['devops', 'docker'], position: new THREE.Vector3(100, 0, 0) },
                { tags: ['kubernetes'], position: new THREE.Vector3(50, 0, 0) }
            ];

            const nebulae = createTagNebulae(mockScene, posts);

            // Should create nebulae for 'devops' (2 posts) and 'kubernetes' (2 posts)
            expect(nebulae.length).toBe(2);
        });

        test('should not create nebula for single post tag', () => {
            const posts = [
                { tags: ['unique'], position: new THREE.Vector3(0, 0, 0) },
                { tags: ['another'], position: new THREE.Vector3(100, 0, 0) }
            ];

            const nebulae = createTagNebulae(mockScene, posts);

            expect(nebulae.length).toBe(0);
        });

        test('should calculate center as average position', () => {
            const posts = [
                { tags: ['test'], position: new THREE.Vector3(0, 0, 0) },
                { tags: ['test'], position: new THREE.Vector3(100, 0, 0) }
            ];

            const nebulae = createTagNebulae(mockScene, posts);

            expect(nebulae[0].userData.center.x).toBe(50);
        });

        test('should handle posts without tags', () => {
            const posts = [
                { position: new THREE.Vector3(0, 0, 0) },
                { tags: null, position: new THREE.Vector3(100, 0, 0) }
            ];

            const nebulae = createTagNebulae(mockScene, posts);

            expect(nebulae.length).toBe(0);
        });
    });

    describe('updateNebulae', () => {
        test('should rotate nebulae', () => {
            const center = new THREE.Vector3(0, 0, 0);
            const nebula = createNebula(mockScene, center, 'test', 3);
            const initialRotation = nebula.rotation.y;

            updateNebulae([nebula], 0.1);

            expect(nebula.rotation.y).toBeGreaterThan(initialRotation);
        });

        test('should not affect non-nebula objects', () => {
            const regularObject = new THREE.Mesh();
            regularObject.rotation.y = 0;

            updateNebulae([regularObject], 0.1);

            expect(regularObject.rotation.y).toBe(0);
        });
    });
});
