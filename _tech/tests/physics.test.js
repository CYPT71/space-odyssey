/**
 * @fileoverview Unit Tests for Core Physics System
 * @author CYPT71
 */

import { createPhysicsSystem } from '../theme/assets/js/core/physics.js';

// Mock systems
const createMockSystems = () => ({
    shipControls: {
        update: jest.fn(),
        getSpeed: jest.fn(() => 1000),
        getWarpFactor: jest.fn(() => 2),
        applyGravity: jest.fn(),
        isWarp20Active: jest.fn(() => false)
    },
    shipGroup: {
        position: { x: 0, y: 0, z: 0 }
    },
    audioSystem: {
        updateAmbient: jest.fn(),
        updateEngineSound: jest.fn(),
        updateWarpSound: jest.fn()
    },
    cameraController: {
        update: jest.fn()
    },
    particleSystem: {
        update: jest.fn()
    },
    navigationHUD: {
        update: jest.fn()
    },
    scannerSystem: {
        update: jest.fn()
    },
    galaxyManager: {
        getAllObjects: jest.fn(() => []),
        update: jest.fn(),
        findClosest: jest.fn(() => null)
    },
    uiManager: {
        isReadingMode: false,
        hudTarget: { textContent: '' },
        updateHUD: jest.fn()
    },
    updateLighting: jest.fn(),
    clock: { getDelta: jest.fn(() => 0.016) }
});

describe('Physics System', () => {
    let systems;
    let physicsSystem;

    beforeEach(() => {
        systems = createMockSystems();
        physicsSystem = createPhysicsSystem(systems);
    });

    test('should create physics system', () => {
        expect(physicsSystem).toBeDefined();
        expect(physicsSystem.update).toBeDefined();
    });

    test('should update all subsystems', () => {
        physicsSystem.update(0.016);

        expect(systems.shipControls.update).toHaveBeenCalled();
        expect(systems.cameraController.update).toHaveBeenCalled();
        expect(systems.particleSystem.update).toHaveBeenCalled();
        expect(systems.navigationHUD.update).toHaveBeenCalled();
        expect(systems.scannerSystem.update).toHaveBeenCalled();
    });

    test('should update audio systems', () => {
        physicsSystem.update(0.016);

        expect(systems.audioSystem.updateAmbient).toHaveBeenCalled();
        expect(systems.audioSystem.updateEngineSound).toHaveBeenCalled();
        expect(systems.audioSystem.updateWarpSound).toHaveBeenCalled();
    });

    test('should apply gravity to planets', () => {
        const mockPlanets = [
            { position: { x: 100, y: 0, z: 0, distanceTo: () => 100 }, rotation: { y: 0 }, userData: { rotationSpeed: 0.001 } }
        ];
        systems.galaxyManager.getAllObjects.mockReturnValue(mockPlanets);

        physicsSystem.update(0.016);

        expect(systems.shipControls.applyGravity).toHaveBeenCalledWith(mockPlanets);
    });

    test('should update HUD target when closest object exists', () => {
        const mockClosest = {
            type: 'planet',
            planetData: { name: 'Test Planet', title: 'Test Title' },
            obj: {
                uuid: 'uuid-1',
                userData: { planetData: { title: 'Test Title' } },
                getWorldPosition: jest.fn(),
                rotation: { y: 0 },
                geometry: { boundingSphere: { radius: 1 } },
                add: jest.fn()
            }
        };
        systems.galaxyManager.findClosest.mockReturnValue(mockClosest);

        physicsSystem.update(0.016);

        expect(systems.uiManager.hudTarget.textContent).toContain('Test Title');
    });

    test('should show "NONE" when no closest object', () => {
        systems.galaxyManager.findClosest.mockReturnValue(null);

        physicsSystem.update(0.016);

        expect(systems.uiManager.hudTarget.textContent).toBe('TARGET: NONE');
    });
});
