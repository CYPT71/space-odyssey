/**
 * Audio effects helper: updates ambient proximity based on nearest gas/nebula.
 */
import * as THREE from 'three';

export const updateAmbientForScene = (galaxyManager, shipGroup, audioSystem) => {
    if (!galaxyManager || !shipGroup || !audioSystem?.updateAmbientProximity) return;
    let closestGas = Infinity;
    let closestNeb = Infinity;
    const all = galaxyManager.getAllObjects ? galaxyManager.getAllObjects() : [];
    const pos = shipGroup.position;
    const wp = new THREE.Vector3();

    all.forEach(obj => {
        const ud = obj.userData || {};
        if (!ud.isGasCloud && !ud.isNebula) return;
        obj.getWorldPosition(wp);
        const d = pos.distanceTo(wp);
        if (ud.isGasCloud) closestGas = Math.min(closestGas, d);
        if (ud.isNebula) closestNeb = Math.min(closestNeb, d);
    });

    audioSystem.updateAmbientProximity({ gasDist: closestGas, nebulaDist: closestNeb });
};
