/**
 * @fileoverview Progressive WebXR manager (optional).
 * Delegates the render loop to caller for physics/HUD updates.
 */
export const hasXR = () => typeof navigator !== 'undefined' && !!navigator.xr;

export const createXRManager = ({ renderer, onXRFrame }) => {
    let xrSession = null;

    const enterXR = async () => {
        if (!hasXR() || xrSession) return false;
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (!supported) return false;
        xrSession = await navigator.xr.requestSession('immersive-vr');
        renderer.xr.enabled = true;
        await renderer.xr.setSession(xrSession);
        renderer.setAnimationLoop((timestamp, frame) => {
            if (onXRFrame) onXRFrame(timestamp, frame);
        });
        return true;
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
