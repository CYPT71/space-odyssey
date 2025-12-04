export const removeAllTrails = (scene) => {
    const toRemove = [];
    scene.traverse(obj => {
        if (obj.userData.isTrail || obj.userData.isTrailGroup || obj.userData.isAnimatedTrail) {
            toRemove.push(obj);
        }
    });

    toRemove.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
        scene.remove(obj);
    });
};
