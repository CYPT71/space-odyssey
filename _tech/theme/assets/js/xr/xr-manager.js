/**
 * @fileoverview Progressive WebXR manager (optional).
 */
export const hasXR = () => typeof navigator !== 'undefined' && !!navigator.xr;

export const createXRManager = (renderer, scene, camera) => {
    let xrSession = null;

    const enterXR = async () => {
        if (!hasXR() || xrSession) return;
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!supported) return;
        xrSession = await navigator.xr.requestSession('immersive-vr');
        renderer.xr.enabled = true;
        await renderer.xr.setSession(xrSession);
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    };

    const exitXR = async () => {
        if (!xrSession) return;
        await xrSession.end();
        xrSession = null;
        renderer.xr.enabled = false;
        renderer.setAnimationLoop(null);
    };

    return { enterXR, exitXR, hasXR: hasXR() };
};
