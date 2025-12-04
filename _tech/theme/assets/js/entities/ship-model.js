import * as THREE from 'three';
import { createShipLights } from './ship-lighting.js';
import { createShipMaterials } from './ship-materials.js';
import {
    addImpulseEngines,
    addNacelles,
    addSaucerSection,
    addSecondaryHull
} from './ship-structure.js';

export const createShip = (scene) => {
    const shipGroup = new THREE.Group();
    shipGroup.userData.impulseEngines = [];

    const materials = createShipMaterials();

    addSaucerSection(shipGroup, materials);
    addSecondaryHull(shipGroup, materials);
    const impulseLights = addImpulseEngines(shipGroup, materials);
    addNacelles(shipGroup, materials);

    const { updateLighting } = createShipLights(shipGroup, materials, impulseLights);

    shipGroup.rotation.set(0, Math.PI, 0);
    scene.add(shipGroup);

    return { shipGroup, updateLighting };
};
