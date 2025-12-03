import * as THREE from 'three';

export const createShipLights = (shipGroup, materials, impulseLights) => {
    const { warpGlowMat, bussardMat, deflectorMat, impulseEngineMat } = materials;
    const { impulseLightL, impulseLightR } = impulseLights;

    const deflectorLight = new THREE.PointLight(0x0088FF, 2, 40);
    deflectorLight.position.set(0, -3, 8);
    shipGroup.add(deflectorLight);

    const bussardLightL = new THREE.PointLight(0xFF4400, 2, 30);
    bussardLightL.position.set(-10, 5, 10);
    shipGroup.add(bussardLightL);

    const bussardLightR = new THREE.PointLight(0xFF4400, 2, 30);
    bussardLightR.position.set(10, 5, 10);
    shipGroup.add(bussardLightR);

    const navLightL = new THREE.PointLight(0xFF0000, 1, 10);
    navLightL.position.set(-14, 4, 10);
    shipGroup.add(navLightL);

    const navLightR = new THREE.PointLight(0x00FF00, 1, 10);
    navLightR.position.set(14, 4, 10);
    shipGroup.add(navLightR);

    const shipFill = new THREE.PointLight(0xFFFFFF, 2.0, 100);
    shipFill.position.set(0, 10, 5);
    shipGroup.add(shipFill);

    const updateLighting = (warpFactor, speed = 0) => {
        const time = Date.now() * 0.005;

        const pulse = 1 + Math.sin(time * 2) * 0.3 + warpFactor;
        warpGlowMat.emissiveIntensity = 1.5 * pulse;

        bussardMat.emissiveIntensity = 2.0 + Math.sin(time * 5) * 0.5;
        deflectorMat.emissiveIntensity = 1.0 + Math.sin(time) * 0.2;

        const blink = Math.floor(Date.now() / 1000) % 2 === 0;
        navLightL.intensity = blink ? 1 : 0;
        navLightR.intensity = blink ? 0 : 1;

        const absSpeed = Math.abs(speed);
        const engineIntensity = Math.min(absSpeed / 500, 3);
        impulseEngineMat.emissiveIntensity = engineIntensity;
        if (impulseLightL) impulseLightL.intensity = engineIntensity * 2;
        if (impulseLightR) impulseLightR.intensity = engineIntensity * 2;
    };

    return { updateLighting };
};
