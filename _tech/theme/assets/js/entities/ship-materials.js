import * as THREE from 'three';

export const createShipMaterials = () => {
    const hullMat = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE,
        metalness: 0.6,
        roughness: 0.25,
        emissive: 0x111111,
        emissiveIntensity: 0.1
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.5
    });

    const deflectorMat = new THREE.MeshStandardMaterial({
        color: 0x0088FF,
        emissive: 0x0066FF,
        emissiveIntensity: 2.0,
        metalness: 0.8,
        roughness: 0.1
    });

    const bussardMat = new THREE.MeshStandardMaterial({
        color: 0xFF4400,
        emissive: 0xFF2200,
        emissiveIntensity: 2.5,
        metalness: 0.2,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9
    });

    const warpGlowMat = new THREE.MeshStandardMaterial({
        color: 0x0066FF,
        emissive: 0x0044FF,
        emissiveIntensity: 1.5,
        metalness: 0.5,
        transparent: true,
        opacity: 0.8
    });

    const impulseEngineMat = new THREE.MeshStandardMaterial({
        color: 0xFF6600,
        emissive: 0xFF4400,
        emissiveIntensity: 0,
        metalness: 0.8,
        roughness: 0.2
    });

    return {
        hullMat,
        darkMat,
        deflectorMat,
        bussardMat,
        warpGlowMat,
        impulseEngineMat
    };
};
