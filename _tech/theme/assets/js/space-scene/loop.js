export const createMainLoop = ({ renderingSystem, physicsSystem, updateMinimap, updateCompass, radar, shipGroup, galaxyManager, clock }) => {
  let frameCount = 0;
  let xrActiveRef = { value: false };

  const tick = () => {
    const delta = clock.getDelta();
    frameCount += 1;
    physicsSystem.update(delta);
    updateMinimap(shipGroup, galaxyManager, frameCount);
    updateCompass(shipGroup, galaxyManager, frameCount);
    radar.update();
    renderingSystem.render();
  };

  const animate = () => {
    if (xrActiveRef.value) return;
    requestAnimationFrame(animate);
    tick();
  };

  return {
    tick,
    animate,
    markXRActive: (active) => {
      xrActiveRef.value = active;
      renderingSystem.setXRActive(active);
    }
  };
};
