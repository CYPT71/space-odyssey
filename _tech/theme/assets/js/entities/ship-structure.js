import * as THREE from 'three';

const addSaucerSection = (shipGroup, { hullMat, darkMat }) => {
    const saucerGeo = new THREE.CylinderGeometry(14, 14, 2.5, 64);
    const saucer = new THREE.Mesh(saucerGeo, hullMat);
    saucer.scale.set(1, 0.4, 1);
    saucer.position.set(0, 4, 10);
    shipGroup.add(saucer);

    const bridgeBaseGeo = new THREE.CylinderGeometry(3, 3, 1, 32);
    const bridgeBase = new THREE.Mesh(bridgeBaseGeo, hullMat);
    bridgeBase.position.set(0, 5, 10);
    shipGroup.add(bridgeBase);

    const bridgeDomeGeo = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bridgeDome = new THREE.Mesh(bridgeDomeGeo, hullMat);
    bridgeDome.position.set(0, 5.5, 10);
    shipGroup.add(bridgeDome);

    const sensorDomeGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const sensorDome = new THREE.Mesh(sensorDomeGeo, hullMat);
    sensorDome.rotation.x = Math.PI;
    sensorDome.position.set(0, 3.5, 10);
    shipGroup.add(sensorDome);

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
};

const addSecondaryHull = (shipGroup, { hullMat, deflectorMat }) => {
    const neckGeo = new THREE.BoxGeometry(2, 6, 4);
    const neck = new THREE.Mesh(neckGeo, hullMat);
    neck.position.set(0, 0, 6);
    neck.rotation.x = 0.4;
    shipGroup.add(neck);

    const secondaryGeo = new THREE.CylinderGeometry(3.5, 2.5, 30, 32);
    const secondary = new THREE.Mesh(secondaryGeo, hullMat);
    secondary.rotation.x = Math.PI / 2;
    secondary.position.set(0, -3, -8);
    shipGroup.add(secondary);

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

    const shuttleBayGeo = new THREE.SphereGeometry(2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const shuttleBay = new THREE.Mesh(shuttleBayGeo, hullMat);
    shuttleBay.rotation.x = Math.PI / 2;
    shuttleBay.position.set(0, -3, -11);
    shipGroup.add(shuttleBay);
};

const addImpulseEngines = (shipGroup, { impulseEngineMat }) => {
    const impulseGeoL = new THREE.ConeGeometry(0.8, 3, 16);
    const impulseL = new THREE.Mesh(impulseGeoL, impulseEngineMat);
    impulseL.rotation.x = Math.PI / 2;
    impulseL.position.set(-1.5, -1, -23);
    shipGroup.add(impulseL);

    const impulseR = new THREE.Mesh(impulseGeoL, impulseEngineMat);
    impulseR.rotation.x = Math.PI / 2;
    impulseR.position.set(1.5, -1, -23);
    shipGroup.add(impulseR);

    const impulseLightL = new THREE.PointLight(0xFF4400, 0, 15);
    impulseLightL.position.set(-1.5, -1, -24);
    shipGroup.add(impulseLightL);

    const impulseLightR = new THREE.PointLight(0xFF4400, 0, 15);
    impulseLightR.position.set(1.5, -1, -24);
    shipGroup.add(impulseLightR);

    shipGroup.userData.impulseEngines.push({ mesh: impulseL, light: impulseLightL });
    shipGroup.userData.impulseEngines.push({ mesh: impulseR, light: impulseLightR });

    return { impulseLightL, impulseLightR };
};

const addNacelles = (shipGroup, { hullMat, bussardMat, warpGlowMat }) => {
    const pylonL = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 3), hullMat);
    pylonL.position.set(-6, 1.5, -18);
    pylonL.rotation.z = -0.6;
    shipGroup.add(pylonL);

    const pylonR = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 3), hullMat);
    pylonR.position.set(6, 1.5, -18);
    pylonR.rotation.z = 0.6;
    shipGroup.add(pylonR);

    const nacelleGeo = new THREE.CylinderGeometry(2, 2, 24, 32);
    const createNacelle = (x) => {
        const nacelleGroup = new THREE.Group();

        const body = new THREE.Mesh(nacelleGeo, hullMat);
        body.rotation.x = Math.PI / 2;
        nacelleGroup.add(body);

        const bussard = new THREE.Mesh(
            new THREE.SphereGeometry(2.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
            bussardMat
        );
        bussard.rotation.x = -Math.PI / 2;
        bussard.position.set(0, 0, 12);
        nacelleGroup.add(bussard);

        const grilleGeo = new THREE.BoxGeometry(4.1, 0.5, 18);
        const grille = new THREE.Mesh(grilleGeo, warpGlowMat);
        grille.position.set(0, 0, -1);
        nacelleGroup.add(grille);

        const cap = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 16, 16),
            hullMat
        );
        cap.position.set(0, 0, -12);
        nacelleGroup.add(cap);

        nacelleGroup.position.set(x, 6, -18);
        return nacelleGroup;
    };

    const nacelleL = createNacelle(-12);
    shipGroup.add(nacelleL);

    const nacelleR = createNacelle(12);
    shipGroup.add(nacelleR);
};

export {
    addImpulseEngines,
    addNacelles,
    addSaucerSection,
    addSecondaryHull
};
