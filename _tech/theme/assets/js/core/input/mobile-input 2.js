import { initMobileJoysticks } from "./mobile-joysticks.js";

export const setupMobileInput = ({ shipControls, uiManager }) => {
    
    document.body.classList.add("mobile-mode");
    const disposeJoysticks = initMobileJoysticks(document.body, shipControls, { radius: 130 });
    if (uiManager?.reduceEffects) {
        uiManager.reduceEffects();
    }

    let lastTap = { t: 0, x: 0, y: 0 };
    const ignoreSelectors = [
        ".touch-zone",
        "#hud-minimap",
        "#reading-overlay",
        "#settings-panel",
        "#mobile-known-toggle"
    ];

    const shouldIgnore = (target) => {
        if (!target || !(target instanceof Element)) return false;
        return ignoreSelectors.some(selector => target.closest(selector));
    };

    const onTouchEnd = (e) => {
        const target = e.target;
        if (shouldIgnore(target)) return;
        const now = Date.now();
        const touch = e.changedTouches[0];
        if (!touch || e.touches.length > 0) return;
        const dx = touch.clientX - lastTap.x;
        const dy = touch.clientY - lastTap.y;
        const dist2 = dx * dx + dy * dy;
        if (now - lastTap.t < 250 && dist2 < 900) {
            shipControls.disengageAutopilot();
            shipControls.setForward(0);
            shipControls.setStrafe(0);
            shipControls.setYaw(0);
            shipControls.setPitch(0);
            shipControls.setSpeed(0);
        }
        lastTap = { t: now, x: touch.clientX, y: touch.clientY };
    };

    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
        window.removeEventListener("touchend", onTouchEnd);
        disposeJoysticks();
    };
};
