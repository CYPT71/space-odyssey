export function attachWarpBoost({ uiManager, shipControls }) {
    const originalActivateBoost = uiManager.activateWarpBoost.bind(uiManager);
    uiManager.activateWarpBoost = function () {
        const shouldBoost = originalActivateBoost();
        if (shouldBoost) {
            shipControls.activateWarpBoost();
        }
    };
}
