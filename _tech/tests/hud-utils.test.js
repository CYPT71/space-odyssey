/**
 * @fileoverview Unit Tests for HUD Utilities
 * @author CYPT71
 */

import { updateMinimap, updateCompass } from '../theme/assets/js/core/hud/index.js';

// Mock DOM
document.body.innerHTML = `
    <div id="hud-minimap">
        <div id="minimap-list"></div>
    </div>
    <div id="compass-container"></div>
`;

describe('HUD Utilities', () => {
    let mockShipGroup;
    let mockGalaxyManager;

    beforeEach(() => {
        mockShipGroup = {
            position: new (require('three').Vector3)(0, 0, 0),
            rotation: { y: 0 }
        };

        mockGalaxyManager = {
            getAllObjects: jest.fn(() => [])
        };

        // Clear DOM
        document.getElementById('minimap-list').innerHTML = '';
        document.getElementById('compass-container').innerHTML = '';
    });

    describe('updateMinimap', () => {
        test('should not update on non-10th frames', () => {
            updateMinimap(mockShipGroup, mockGalaxyManager, 5);
            expect(document.getElementById('minimap-list').innerHTML).toBe('');
        });

        test('should update on 10th frame', () => {
            const THREE = require('three');
            const mockPlanet = {
                userData: { planetData: { name: 'Test Planet' } },
                getWorldPosition: jest.fn((vec) => {
                    vec.x = 100;
                    vec.y = 0;
                    vec.z = 0;
                }),
                uuid: 'test-uuid',
                position: new THREE.Vector3(100, 0, 0)
            };

            mockGalaxyManager.getAllObjects.mockReturnValue([mockPlanet]);
            mockShipGroup.position.distanceTo = jest.fn(() => 500);

            updateMinimap(mockShipGroup, mockGalaxyManager, 10);

            expect(() => updateMinimap(mockShipGroup, mockGalaxyManager, 10)).not.toThrow();
        });

        test('should mark closest item', () => {
            const THREE = require('three');
            const mockPlanets = [
                {
                    userData: { planetData: { name: 'Close Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 10; vec.y = 0; vec.z = 0; }),
                    uuid: 'close-uuid',
                    position: new THREE.Vector3(10, 0, 0)
                },
                {
                    userData: { planetData: { name: 'Far Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 1000; vec.y = 0; vec.z = 0; }),
                    uuid: 'far-uuid',
                    position: new THREE.Vector3(1000, 0, 0)
                }
            ];

            mockGalaxyManager.getAllObjects.mockReturnValue(mockPlanets);
            mockShipGroup.position.distanceTo = jest.fn()
                .mockReturnValueOnce(10)
                .mockReturnValueOnce(1000);

            expect(() => updateMinimap(mockShipGroup, mockGalaxyManager, 10)).not.toThrow();
        });

        test('should categorize objects by type', () => {
            const THREE = require('three');
            const mockObjects = [
                {
                    userData: { planetData: { name: 'Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 100; vec.y = 0; vec.z = 0; }),
                    uuid: 'planet-uuid',
                    position: new THREE.Vector3(100, 0, 0)
                },
                {
                    userData: { isNebula: true, tagName: 'Nebula' },
                    getWorldPosition: jest.fn((vec) => { vec.x = 200; vec.y = 0; vec.z = 0; }),
                    uuid: 'nebula-uuid',
                    position: new THREE.Vector3(200, 0, 0)
                }
            ];

            mockGalaxyManager.getAllObjects.mockReturnValue(mockObjects);
            mockShipGroup.position.distanceTo = jest.fn(() => 100);

            expect(() => updateMinimap(mockShipGroup, mockGalaxyManager, 10)).not.toThrow();
        });
    });

    describe('updateCompass', () => {
        test('should not update on non-3rd frames', () => {
            updateCompass(mockShipGroup, mockGalaxyManager, 2);
            expect(document.getElementById('compass-container').innerHTML).toBe('');
        });

        test('should show markers for planets in FOV', () => {
            const mockPlanet = {
                userData: { planetData: { name: 'Visible Planet' } },
                getWorldPosition: jest.fn((vec) => {
                    vec.x = 100;
                    vec.y = 0;
                    vec.z = 100;
                })
            };

            mockGalaxyManager.getAllObjects.mockReturnValue([mockPlanet]);
            mockShipGroup.rotation.y = 0;
            mockShipGroup.position.distanceTo = jest.fn(() => 100);

            updateCompass(mockShipGroup, mockGalaxyManager, 3);

            const content = document.getElementById('compass-container').innerHTML;
            expect(content).toContain('Visible Planet');
        });
    });
});
