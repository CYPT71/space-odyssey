/**
 * @fileoverview Unit Tests for Camera Controller
 * @author CYPT71
 */

import { createCameraController } from '../theme/assets/js/systems/camera-controller.js';
import * as THREE from 'three';

describe('Camera Controller', () => {
    let mockCamera;
    let mockTarget;
    let cameraController;

    beforeEach(() => {
        mockCamera = {
            position: new THREE.Vector3(),
            rotation: new THREE.Euler(),
            parent: null
        };

        mockTarget = {
            add: jest.fn(),
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0)
        };

        cameraController = createCameraController(mockCamera, mockTarget);
    });

    test('should create camera controller', () => {
        expect(cameraController).toBeDefined();
        expect(cameraController.update).toBeDefined();
        expect(cameraController.setOffset).toBeDefined();
    });

    test('should attach camera to target', () => {
        expect(mockTarget.add).toHaveBeenCalledWith(mockCamera);
    });

    test('should set initial camera position', () => {
        expect(mockCamera.position.y).toBe(40);
        expect(mockCamera.position.z).toBe(-100);
    });

    test('should switch to reverse mode', () => {
        cameraController.update(true, 0);
        expect(mockCamera.position.z).toBe(100);
    });

    test('should switch back to forward mode', () => {
        cameraController.update(true, 0);
        cameraController.update(false, 0);
        expect(mockCamera.position.z).toBe(-100);
    });

    test('should apply camera shake at high speed', () => {
        const initialZ = mockCamera.position.z;
        cameraController.update(false, 0.8);

        // Position should be different due to shake
        expect(mockCamera.position.z).not.toBe(initialZ);
    });

    test('should not shake at low speed', () => {
        cameraController.update(false, 0);
        expect(mockCamera.position.z).toBe(-100);
    });

    test('should allow setting custom offset', () => {
        cameraController.setOffset(10, 20, 30);
        expect(mockCamera.position.x).toBe(10);
        expect(mockCamera.position.y).toBe(20);
        expect(mockCamera.position.z).toBe(30);
    });
});
