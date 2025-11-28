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
import * as THREE from 'three';
import { getObjectName, getObjectType, getDetectionRange } from './space-object-utils.js';
import { emitGameplayEvent } from '../systems/gameplay-hooks.js';
import { updateAmbientForScene } from '../effects/audio-effects.js';

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
        updateLighting
    } = systems;
    const discovered = new Set();
    let selectionHalo = null;
    let lastTargetUuid = null;

    const attachSelectionHalo = (target) => {
        if (!target) return;
        if (selectionHalo && selectionHalo.parent) {
            selectionHalo.parent.remove(selectionHalo);
            selectionHalo.geometry.dispose();
            selectionHalo.material.dispose();
        }
        const ud = target.userData || {};
        const type = getObjectType(ud);
        const baseRadius = ud.radius || (target.geometry?.boundingSphere?.radius || 50000);
        const ringRadius = Math.max(baseRadius * 1.2, getDetectionRange(type) * 0.1);
        const geom = new THREE.RingGeometry(ringRadius * 0.9, ringRadius * 1.05, 48);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x00F0FF,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        selectionHalo = new THREE.Mesh(geom, mat);
        selectionHalo.rotation.x = Math.PI / 2;
        selectionHalo.userData.isSelectionHalo = true;
        target.add(selectionHalo);
        lastTargetUuid = target.uuid;
    };

    /**
     * Main physics/game update loop
     * @param {number} delta - Delta time
     */
    const update = (delta) => {
        // Update ship physics
        shipControls.update(uiManager.isReadingMode);

        // Get current speed and warp factor
        const currentSpeed = shipControls.getSpeed();
        let warpFactor = shipControls.getWarpFactor();
        const isWarp20 = shipControls.isWarp20Active();

        // Validate warp factor to prevent audio errors
        if (!isFinite(warpFactor)) {
            console.warn('Invalid warp factor detected:', warpFactor);
            warpFactor = 0;
        }

        // Update camera (handle reverse mode AND shake)
        const speedRatio = Math.min(Math.abs(currentSpeed) / 125000, 1);
        cameraController.update(currentSpeed < 0, speedRatio);

        // Update particles with current speed and Warp 20 state for deformation effects
        particleSystem.update(currentSpeed, isWarp20);

        // Update Navigation HUD
        navigationHUD.update(shipGroup.position);

        // Update Scanner
        scannerSystem.update(delta);

        // Update Ambient Audio
        audioSystem.updateAmbient(speedRatio);

        // Apply planetary gravity
        const allPlanets = galaxyManager.getAllObjects();
        shipControls.applyGravity(allPlanets);

        // Update audio (with validated warp factor)
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

        // Resolve target: manual selection takes precedence over proximity
        let closestObject = null;
        const manualTarget = window.manualTarget;
        if (manualTarget && manualTarget.parent) {
            const ud = manualTarget.userData || {};
            const type = getObjectType(ud);
            const pos = new THREE.Vector3();
            manualTarget.getWorldPosition(pos);
            const dist = shipGroup.position.distanceTo(pos);
            closestObject = {
                distance: dist,
                planetData: ud.planetData,
                galaxyData: ud.galaxyData,
                cloudData: ud.cloudData,
                isGasCloud: ud.isGasCloud,
                isNebula: ud.isNebula,
                type,
                obj: manualTarget
            };
        } else {
            closestObject = galaxyManager.findClosest(shipGroup.position);
        }
        updateAmbientForScene(galaxyManager, shipGroup, audioSystem);
        if (closestObject) {
            const rawName = getObjectName(closestObject.obj);
            const type = closestObject.type || getObjectType(closestObject.obj?.userData);
            if (closestObject.obj?.uuid !== lastTargetUuid) {
                attachSelectionHalo(closestObject.obj);
            }
            if (!discovered.has(closestObject.obj.uuid)) {
                discovered.add(closestObject.obj.uuid);
                emitGameplayEvent('objectDiscovered', {
                    name: rawName,
                    type,
                    distance: closestObject.distance
                });
            }
            const prefixed = type === 'planet' ? `🌍 ${rawName}`
                : type === 'galaxy' ? `🌌 ${rawName}`
                    : type === 'gasCloud' ? `🌫️ ${rawName}`
                        : type === 'nebula' ? `✨ ${rawName}`
                            : rawName;
            uiManager.hudTarget.textContent = `TARGET: ${prefixed}`;
        } else {
            uiManager.hudTarget.textContent = 'TARGET: NONE';
        }

        uiManager.updateHUD(warpFactor, closestObject, currentSpeed);
        // Optional: could emit a short-lived ping here; halo already indicates selection.
    };

    return { update };
}
