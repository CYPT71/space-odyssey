/**
 * @fileoverview Unit Tests for Ship Controls
 * @author CYPT71
 */

import { createShipControls } from '../theme/assets/js/systems/ship-controls.js';

// Mock THREE.js Object3D
class MockShipGroup {
    constructor() {
        const THREE = require('three');
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = { x: 0, y: 0, z: 0 };
        this.translateZ = (distance) => {
            this.position.z += distance;
        };
        this.translateX = (distance) => {
            this.position.x += distance;
        };
        this.translateY = (distance) => {
            this.position.y += distance;
        };
    }
}

describe('Ship Controls', () => {
    let shipGroup;
    let controls;

    beforeEach(() => {
        shipGroup = new MockShipGroup();
        controls = createShipControls(shipGroup);

        // Mock localStorage
        global.localStorage = {
            getItem: () => null,
            setItem: () => { },
        };

        // Mock window events
        global.window = {
            addEventListener: () => { },
        };
    });

    test('should initialize with zero speed', () => {
        expect(controls.getSpeed()).toBe(0);
    });

    test('should initialize at warp level 0', () => {
        expect(controls.getWarpFactor()).toBe(0);
    });

    test('should set speed correctly', () => {
        controls.setSpeed(1000);
        expect(controls.getSpeed()).toBe(1000);
    });

    test('should activate warp boost to level 5', () => {
        controls.activateWarpBoost();
        expect(controls.getWarpFactor()).toBe(5);
        expect(controls.getSpeed()).toBe(125000); // WARP_SPEEDS[5]
    });

    test('should not move ship when in reading mode', () => {
        const initialZ = shipGroup.position.z;
        controls.setSpeed(1000);
        controls.update(true); // reading mode = true
        expect(shipGroup.position.z).toBe(initialZ);
    });

    test('should move ship forward when not in reading mode', () => {
        const initialZ = shipGroup.position.z;
        controls.setSpeed(1000);
        controls.update(false); // reading mode = false
        expect(shipGroup.position.z).toBeGreaterThan(initialZ);
    });
});

describe('Warp System', () => {
    let shipGroup;
    let controls;

    beforeEach(() => {
        shipGroup = new MockShipGroup();
        controls = createShipControls(shipGroup);
    });

    test('should handle positive warp speeds', () => {
        controls.setSpeed(2000);
        expect(controls.getSpeed()).toBe(2000);
    });

    test('should handle negative warp speeds (reverse)', () => {
        controls.setSpeed(-2000);
        expect(controls.getSpeed()).toBe(-2000);
    });

    test('should apply gravity only at low warp levels', () => {
        const mockPlanets = [
            {
                position: { x: 100, y: 0, z: 0, distanceTo: () => 1000 },
                scale: { x: 500 }
            }
        ];

        // At high warp, gravity should not apply
        controls.setSpeed(125000); // Warp 5
        const initialPos = { ...shipGroup.position };
        controls.applyGravity(mockPlanets);
        expect(shipGroup.position.x).toBe(initialPos.x);
    });
});
