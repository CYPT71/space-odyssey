/**
 * @fileoverview Optional gamepad loop mapping sticks -> ship controls.
 */
const DEADZONE = 0.15;
const applyDeadzone = (v) => (Math.abs(v) < DEADZONE ? 0 : v);

export const startGamepadLoop = (shipControls, actions = {}) => {
    if (typeof window === 'undefined' || !shipControls) return () => {};
    let rafId = null;

    const tick = () => {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        const pad = pads.find(Boolean);
        if (pad) {
            const lx = applyDeadzone(pad.axes[0] || 0);
            const ly = applyDeadzone(pad.axes[1] || 0);
            const rx = applyDeadzone(pad.axes[2] || 0);
            const ry = applyDeadzone(pad.axes[3] || 0);
            shipControls.setStrafe(lx);
            shipControls.setForward(-ly);
            shipControls.setYaw(rx);
            shipControls.setPitch(-ry);

            const btn = (i) => pad.buttons[i] && pad.buttons[i].pressed;
            if (btn(0) && actions.autopilot) actions.autopilot();     // A
            if (btn(1) && actions.stop) actions.stop();               // B
            if (btn(4) && actions.cycleTarget) actions.cycleTarget(); // LB
            if (btn(5) && actions.cycleTarget) actions.cycleTarget(); // RB
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
};
