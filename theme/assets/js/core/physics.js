/**
 * @fileoverview Physics Update Module
 * @author CYPT71
 * @description Handles physics updates and game loop logic
 */

/**
 * Creates the physics update system
 * @param {Object} systems - All game systems
 * @returns {Object} Physics update functions
 */
export function createPhysicsSystem(systems) {
    const {
        shipControls,
        shipGroup,
        audioSystem,
        cameraController,
        particleSystem,
        navigationHUD,
        scannerSystem,
        galaxyManager,
        uiManager,
        updateLighting,
        clock
    } = systems;

    /**
     * Main physics/game update loop
     * @param {number} delta - Delta time
     */
    const update = (delta) => {
        const now = Date.now();

        // Update ship physics
        shipControls.update(uiManager.isReadingMode);

        // Get current speed and warp factor
        const currentSpeed = shipControls.getSpeed();
        const warpFactor = shipControls.getWarpFactor();

        // Update camera (handle reverse mode AND shake)
        const speedRatio = Math.min(Math.abs(currentSpeed) / 125000, 1);
        cameraController.update(currentSpeed < 0, speedRatio);

        // Update particles with current speed for warp effects
        particleSystem.update(currentSpeed);

        // Update Navigation HUD
        navigationHUD.update(shipGroup.position);

        // Update Scanner
        scannerSystem.update(delta);

        // Update Ambient Audio
        audioSystem.updateAmbient(speedRatio);

        // Apply planetary gravity
        const allPlanets = galaxyManager.getAllObjects();
        shipControls.applyGravity(allPlanets);

        // Update audio
        audioSystem.updateEngineSound(warpFactor);
        audioSystem.updateWarpSound(warpFactor);

        // Update galaxies
        galaxyManager.update();

        // Rotate planets
        allPlanets.forEach(obj => {
            if (obj.userData?.rotationSpeed) {
                obj.rotation.y += obj.userData.rotationSpeed;
            }
        });

        // Update ship lighting
        updateLighting(warpFactor, currentSpeed);

        // Find closest object and update HUD
        const closestObject = galaxyManager.findClosest(shipGroup.position);
        if (closestObject) {
            const name = closestObject.type === 'planet'
                ? closestObject.planetData.title || closestObject.planetData.name
                : `🌌 ${closestObject.galaxyData.name}`;
            uiManager.hudTarget.textContent = `TARGET: ${name}`;
        } else {
            uiManager.hudTarget.textContent = 'TARGET: NONE';
        }

        uiManager.updateHUD(warpFactor, closestObject, currentSpeed);
    };

    return { update };
}
