/**
 * @fileoverview Camera Controller - Flight Simulator Style
 * @author CYPT71
 * @description Simple fixed camera attached to ship (like flight simulators)
 */

import * as THREE from 'three';

/**
 * Creates a flight simulator style camera controller
 * The camera is rigidly attached to the ship as a child object.
 * This guarantees perfect synchronization with ship movements.
 * @param {THREE.Camera} camera - The camera to control
 * @param {THREE.Object3D} target - The ship to attach to
 * @returns {Object} Camera controller functions
 */
export function createCameraController(camera, target) {
    // Fixed camera offset (behind and above ship)
    const offset = new THREE.Vector3(0, 40, -100);

    // ATTACH CAMERA TO SHIP
    // This makes the camera a child of the ship, so it follows all rotations automatically.
    target.add(camera);
    camera.position.copy(offset);

    // Point camera forward (ship's local forward direction)
    // Default: Look at ship's back (0, PI, 0)
    camera.rotation.set(0, Math.PI, 0);

    let isReverse = false;

    /**
     * Update function
     * Handles camera rotation for reverse mode AND camera shake
     * @param {boolean} reverseMode - True if ship is moving backward
     * @param {number} speedRatio - 0 to 1 (ratio of max speed) for shake intensity
     * @returns {void}
     */
    const update = (reverseMode, speedRatio = 0) => {
        // 1. Handle Reverse Rotation
        if (reverseMode !== isReverse) {
            isReverse = reverseMode;
            if (isReverse) {
                // Look backward (0, 0, 0) - See where we are going
                camera.rotation.set(0, 0, 0);
                camera.position.set(0, 40, 100); // Move camera in front of ship
            } else {
                // Look forward (0, PI, 0) - See ship's back
                camera.rotation.set(0, Math.PI, 0);
                camera.position.set(0, 40, -100); // Move camera behind ship
            }
        }

        // 2. Apply Camera Shake (Juice!)
        // Only shake if speed is significant
        if (speedRatio > 0.1) {
            const shakeAmount = speedRatio * 0.5; // Max shake 0.5 units

            // Add random jitter to position (relative to base offset)
            // We use the base positions set above (0, 40, +/-100)
            const baseX = 0;
            const baseY = 40;
            const baseZ = isReverse ? 100 : -100;

            camera.position.x = baseX + (Math.random() - 0.5) * shakeAmount;
            camera.position.y = baseY + (Math.random() - 0.5) * shakeAmount;
            camera.position.z = baseZ + (Math.random() - 0.5) * shakeAmount;
        } else {
            // Reset to stable position if stopped
            if (isReverse) camera.position.set(0, 40, 100);
            else camera.position.set(0, 40, -100);
        }
    };

    /**
     * Sets new camera offset
     * @param {number} x - X offset
     * @param {number} y - Y offset  
     * @param {number} z - Z offset
     * @returns {void}
     */
    const setOffset = (x, y, z) => {
        camera.position.set(x, y, z);
    };

    return {
        update,
        setOffset
    };
}
