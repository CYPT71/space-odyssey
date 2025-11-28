// Ship Model Module - USS Enterprise NCC-1701 (Refined)
// High-quality geometric construction

import * as THREE from 'three';

export const createShip = (scene) => {
    const shipGroup = new THREE.Group();
    shipGroup.userData.impulseEngines = [];

    // === MATERIALS ===
    // High-quality materials - couleur argentée d'origine
    const hullMat = new THREE.MeshStandardMaterial({
        color: 0xEEEEEE, // Argenté d'origine
        metalness: 0.6,
        roughness: 0.25,
        emissive: 0x111111, // Émission légère
        emissiveIntensity: 0.1
    });

    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.5,
        roughness: 0.5
        // Pas d'émission pour les parties sombres
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

    // === 1. SAUCER SECTION ===
    // Main disk
    const saucerGeo = new THREE.CylinderGeometry(14, 14, 2.5, 64);
    const saucer = new THREE.Mesh(saucerGeo, hullMat);
    saucer.scale.set(1, 0.4, 1);
    saucer.position.set(0, 4, 10);
    shipGroup.add(saucer);

    // Top dome (Bridge)
    const bridgeBaseGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const bridgeBase = new THREE.Mesh(bridgeBaseGeo, hullMat);
    bridgeBase.position.set(0, 5, 10);
    shipGroup.add(bridgeBase);

    const bridgeDomeGeo = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bridgeDome = new THREE.Mesh(bridgeDomeGeo, hullMat);
    bridgeDome.position.set(0, 5.5, 10);
    shipGroup.add(bridgeDome);

    // Bottom dome (Sensor array)
    const sensorDomeGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const sensorDome = new THREE.Mesh(sensorDomeGeo, hullMat);
    sensorDome.rotation.x = Math.PI;
    sensorDome.position.set(0, 3.5, 10);
    shipGroup.add(sensorDome);

    // Impulse engines (back of saucer)
    const impulseGeo = new THREE.BoxGeometry(4, 1, 1.5);
    const impulse = new THREE.Mesh(impulseGeo, darkMat);
    impulse.position.set(0, 4, 4);
    shipGroup.add(impulse);

    const impulseGlow = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.6, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    );
    impulseGlow.position.set(0, 4, 3.2);
    shipGroup.add(impulseGlow);

    // === 2. NECK ===
    // Angled neck connecting saucer to secondary hull
    const neckGeo = new THREE.BoxGeometry(2, 6, 4);
    const neck = new THREE.Mesh(neckGeo, hullMat);
    neck.position.set(0, 0, 6);
    neck.rotation.x = 0.4; // Angled forward
    shipGroup.add(neck);

    // === 3. SECONDARY HULL ===
    // Main cylinder - LENGTHENED for better proportions
    const secondaryGeo = new THREE.CylinderGeometry(3.5, 2.5, 30, 32); // Increased from 18 to 30
    const secondary = new THREE.Mesh(secondaryGeo, hullMat);
    secondary.rotation.x = Math.PI / 2;
    secondary.position.set(0, -3, -8); // Adjusted Z position for longer hull
    shipGroup.add(secondary);

    // Deflector Dish (Front)
    const deflectorHousingGeo = new THREE.CylinderGeometry(3.6, 3.0, 1.5, 32);
    const deflectorHousing = new THREE.Mesh(deflectorHousingGeo, hullMat);
    deflectorHousing.rotation.x = Math.PI / 2;
    deflectorHousing.position.set(0, -3, 6.5);
    shipGroup.add(deflectorHousing);

    const deflectorDishGeo = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.3);
    const deflectorDish = new THREE.Mesh(deflectorDishGeo, deflectorMat);
    deflectorDish.rotation.x = -Math.PI / 2;
    deflectorDish.position.set(0, -3, 6.8);
    shipGroup.add(deflectorDish);

    // Shuttle bay (Rear)
    const shuttleBayGeo = new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const shuttleBay = new THREE.Mesh(shuttleBayGeo, hullMat);
    shuttleBay.rotation.x = Math.PI / 2;
    shuttleBay.position.set(0, -3, -11);
    shipGroup.add(shuttleBay);

    // === IMPULSE ENGINES (Rear Thrusters) ===
    // Create glowing orange cones that react to speed
    const impulseEngineMat = new THREE.MeshStandardMaterial({
        color: 0xFF6600,
        emissive: 0xFF4400,
        emissiveIntensity: 0,
        metalness: 0.8,
        roughness: 0.2
    });

    // Left impulse engine - RECULÉ AU CUL DU VAISSEAU
    const impulseGeoL = new THREE.ConeGeometry(0.8, 3, 16);
    const impulseL = new THREE.Mesh(impulseGeoL, impulseEngineMat);
    impulseL.rotation.x = Math.PI / 2; // Point backwards
    impulseL.position.set(-1.5, -1, -23); // Reculé de -12 à -23
    shipGroup.add(impulseL);

    // Right impulse engine - RECULÉ AU CUL DU VAISSEAU
    const impulseR = new THREE.Mesh(impulseGeoL, impulseEngineMat);
    impulseR.rotation.x = Math.PI / 2;
    impulseR.position.set(1.5, -1, -23); // Reculé de -12 à -23
    shipGroup.add(impulseR);

    // Point lights for engine glow - RECULÉS
    const impulseLightL = new THREE.PointLight(0xFF4400, 0, 15);
    impulseLightL.position.set(-1.5, -1, -24); // Reculé de -13 à -24
    shipGroup.add(impulseLightL);

    const impulseLightR = new THREE.PointLight(0xFF4400, 0, 15);
    impulseLightR.position.set(1.5, -1, -24); // Reculé de -13 à -24
    shipGroup.add(impulseLightR);

    shipGroup.userData.impulseEngines.push({ mesh: impulseL, light: impulseLightL });
    shipGroup.userData.impulseEngines.push({ mesh: impulseR, light: impulseLightR });

    // === 4. NACELLES & PYLONS ===
    // Pylons (Angled supports) - RECULÉS AU CUL DU VAISSEAU
    // Raised starting point and angle

    // Increased length to 16 to span the distance
    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 3), hullMat);
    // RECULÉ AU CUL: de Z=-10 à Z=-18
    pylonL.position.set(-6, 1.5, -18);
    pylonL.rotation.z = -0.6;
    shipGroup.add(pylonL);

    const pylonR = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 3), hullMat);
    // RECULÉ AU CUL: de Z=-10 à Z=-18
    pylonR.position.set(6, 1.5, -18);
    pylonR.rotation.z = 0.6;
    shipGroup.add(pylonR);

    // Nacelles (Engines)
    const nacelleGeo = new THREE.CylinderGeometry(2, 2, 24, 32);

    const createNacelle = (x) => {
        const nacelleGroup = new THREE.Group();

        // Main body
        const body = new THREE.Mesh(nacelleGeo, hullMat);
        body.rotation.x = Math.PI / 2;
        nacelleGroup.add(body);

        // Bussard Collector (Front)
        const bussard = new THREE.Mesh(
            new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
            bussardMat
        );
        bussard.rotation.x = -Math.PI / 2;
        bussard.position.set(0, 0, 12);
        nacelleGroup.add(bussard);

        // Warp Grilles (Sides) - Glowing strips
        const grilleGeo = new THREE.BoxGeometry(4.1, 0.5, 18);
        const grille = new THREE.Mesh(grilleGeo, warpGlowMat);
        grille.position.set(0, 0, -1);
        nacelleGroup.add(grille);

        // Rear cap
        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 16, 16),
            hullMat
        );
        cap.position.set(0, 0, -12);
        nacelleGroup.add(cap);

        // RECULÉ AU CUL pour matcher les pylons (Z=-18)
        nacelleGroup.position.set(x, 6, -18);
        return nacelleGroup;
    };

    // Widened nacelle spacing to match pylon length
    const nacelleL = createNacelle(-12);
    shipGroup.add(nacelleL);

    const nacelleR = createNacelle(12);
    shipGroup.add(nacelleR);

    // === LIGHTING ===
    // Self-illumination lights
    const deflectorLight = new THREE.PointLight(0x0088FF, 2, 40);
    deflectorLight.position.set(0, -3, 8);
    shipGroup.add(deflectorLight);

    const bussardLightL = new THREE.PointLight(0xFF4400, 2, 30);
    bussardLightL.position.set(-10, 5, 10);
    shipGroup.add(bussardLightL);

    const bussardLightR = new THREE.PointLight(0xFF4400, 2, 30);
    bussardLightR.position.set(10, 5, 10);
    shipGroup.add(bussardLightR);

    // Navigation lights (Blinking)
    const navLightL = new THREE.PointLight(0xFF0000, 1, 10);
    navLightL.position.set(-14, 4, 10);
    shipGroup.add(navLightL);

    const navLightR = new THREE.PointLight(0x00FF00, 1, 10);
    navLightR.position.set(14, 4, 10);
    shipGroup.add(navLightR);

    // Ambient fill for the ship itself - FORTE pour visibilité garantie
    const shipFill = new THREE.PointLight(0xFFFFFF, 2.0, 100); // Intensité x4, portée x2
    shipFill.position.set(0, 10, 5);
    shipGroup.add(shipFill);

    // === DYNAMIC UPDATE ===
    const updateLighting = (warpFactor, speed = 0) => {
        const time = Date.now() * 0.005;

        // Pulse warp engines
        const pulse = 1 + Math.sin(time * 2) * 0.3 + warpFactor;
        warpGlowMat.emissiveIntensity = 1.5 * pulse;

        // Rotate bussard effect
        bussardMat.emissiveIntensity = 2.0 + Math.sin(time * 5) * 0.5;

        // Deflector pulse (Reduced intensity)
        deflectorMat.emissiveIntensity = 1.0 + Math.sin(time) * 0.2;

        // Nav lights blink
        const blink = Math.floor(Date.now() / 1000) % 2 === 0;
        navLightL.intensity = blink ? 1 : 0;
        navLightR.intensity = blink ? 0 : 1;

        // Impulse engines react to speed
        const absSpeed = Math.abs(speed);
        const engineIntensity = Math.min(absSpeed / 500, 3);
        impulseEngineMat.emissiveIntensity = engineIntensity;
        impulseLightL.intensity = engineIntensity * 2;
        impulseLightR.intensity = engineIntensity * 2;
    };

    // Rotate entire ship to face forward (-Z)
    shipGroup.rotation.set(0, Math.PI, 0);

    scene.add(shipGroup);

    return { shipGroup, updateLighting };
};
