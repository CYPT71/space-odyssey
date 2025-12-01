/**
 * @fileoverview Optional gamepad loop mapping sticks -> ship controls.
 */
const DEADZONE = 0.22;
const applyDeadzone = (v) => (Math.abs(v) < DEADZONE ? 0 : v);

export const startGamepadLoop = (shipControls, actions = {}) => {
    if (typeof window === 'undefined' || !shipControls) return () => {};
    let rafId = null;
    const prevButtons = [];

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
            const onPress = (i, fn) => {
                const pressed = btn(i);
                if (pressed && !prevButtons[i] && fn) fn();
                prevButtons[i] = pressed;
            };
            onPress(0, actions.autopilot);     // A
            onPress(1, actions.stop);          // B
            onPress(4, actions.cycleTarget);   // LB
            onPress(5, actions.cycleTarget);   // RB
        }
        rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
};
