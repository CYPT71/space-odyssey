/**
 * @fileoverview Minimal dual virtual joysticks for mobile/touch
 * Zones are invisible by default; optional halos via CSS.
 */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const initMobileJoysticks = (rootEl, shipControls, opts = {}) => {
    if (!rootEl || !shipControls) return () => {};
    const radius = opts.radius || 80; // px

    const left = document.createElement('div');
    const right = document.createElement('div');
    left.className = 'touch-zone touch-zone-left';
    right.className = 'touch-zone touch-zone-right';
    rootEl.append(left, right);

    const state = {
        leftId: null,
        rightId: null,
        leftCenter: { x: 0, y: 0 },
        rightCenter: { x: 0, y: 0 }
    };

    const norm = (dx, dy) => ({
        x: clamp(dx / radius, -1, 1),
        y: clamp(dy / radius, -1, 1)
    });

    const handleStart = (ev) => {
        for (const t of ev.changedTouches) {
            const isLeft = t.clientX < window.innerWidth * 0.5;
            if (isLeft && state.leftId === null) {
                state.leftId = t.identifier;
                state.leftCenter = { x: t.clientX, y: t.clientY };
            } else if (!isLeft && state.rightId === null) {
                state.rightId = t.identifier;
                state.rightCenter = { x: t.clientX, y: t.clientY };
            }
        }
    };

    const handleMove = (ev) => {
        for (const t of ev.changedTouches) {
            if (t.identifier === state.leftId) {
                const { x, y } = norm(t.clientX - state.leftCenter.x, t.clientY - state.leftCenter.y);
                shipControls.setForward(-y); // swipe up = forward
                shipControls.setStrafe(x);
            }
            if (t.identifier === state.rightId) {
                const { x, y } = norm(t.clientX - state.rightCenter.x, t.clientY - state.rightCenter.y);
                shipControls.setYaw(x);
                shipControls.setPitch(-y);
            }
        }
    };

    const resetLeft = () => {
        shipControls.setForward(0);
        shipControls.setStrafe(0);
        state.leftId = null;
    };
    const resetRight = () => {
        shipControls.setYaw(0);
        shipControls.setPitch(0);
        state.rightId = null;
    };

    const handleEnd = (ev) => {
        for (const t of ev.changedTouches) {
            if (t.identifier === state.leftId) resetLeft();
            if (t.identifier === state.rightId) resetRight();
        }
    };

    left.addEventListener('touchstart', handleStart, { passive: true });
    right.addEventListener('touchstart', handleStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd, { passive: true });
    window.addEventListener('touchcancel', handleEnd, { passive: true });

    return () => {
        left.remove();
        right.remove();
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
    };
};
