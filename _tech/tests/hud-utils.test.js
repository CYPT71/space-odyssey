/**
 * @fileoverview Unit Tests for HUD Utilities
 * @author CYPT71
 */

import { updateMinimap, updateCompass } from '../../theme/assets/js/core/hud-utils.js';

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
            position: { x: 0, y: 0, z: 0, distanceTo: jest.fn(() => 1000) },
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
            const mockPlanet = {
                userData: { planetData: { name: 'Test Planet' } },
                getWorldPosition: jest.fn((vec) => {
                    vec.x = 100;
                    vec.y = 0;
                    vec.z = 0;
                }),
                uuid: 'test-uuid'
            };

            mockGalaxyManager.getAllObjects.mockReturnValue([mockPlanet]);
            mockShipGroup.position.distanceTo = jest.fn(() => 500);

            updateMinimap(mockShipGroup, mockGalaxyManager, 10);

            const content = document.getElementById('minimap-list').innerHTML;
            expect(content).toContain('Test Planet');
            expect(content).toContain('m'); // Check for meters unit
        });

        test('should mark closest item', () => {
            const mockPlanets = [
                {
                    userData: { planetData: { name: 'Close Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 10; vec.y = 0; vec.z = 0; }),
                    uuid: 'close-uuid'
                },
                {
                    userData: { planetData: { name: 'Far Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 1000; vec.y = 0; vec.z = 0; }),
                    uuid: 'far-uuid'
                }
            ];

            mockGalaxyManager.getAllObjects.mockReturnValue(mockPlanets);
            mockShipGroup.position.distanceTo = jest.fn()
                .mockReturnValueOnce(10)
                .mockReturnValueOnce(1000);

            updateMinimap(mockShipGroup, mockGalaxyManager, 10);

            const content = document.getElementById('minimap-list').innerHTML;
            expect(content).toContain('closest');
        });

        test('should categorize objects by type', () => {
            const mockObjects = [
                {
                    userData: { planetData: { name: 'Planet' } },
                    getWorldPosition: jest.fn((vec) => { vec.x = 100; vec.y = 0; vec.z = 0; }),
                    uuid: 'planet-uuid'
                },
                {
                    userData: { isNebula: true, tagName: 'Nebula' },
                    getWorldPosition: jest.fn((vec) => { vec.x = 200; vec.y = 0; vec.z = 0; }),
                    uuid: 'nebula-uuid'
                }
            ];

            mockGalaxyManager.getAllObjects.mockReturnValue(mockObjects);
            mockShipGroup.position.distanceTo = jest.fn(() => 100);

            updateMinimap(mockShipGroup, mockGalaxyManager, 10);

            const content = document.getElementById('minimap-list').innerHTML;
            expect(content).toContain('Planets');
            expect(content).toContain('Nebulae');
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
