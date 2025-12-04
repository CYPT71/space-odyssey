import { createXRManager } from '../xr/xr-manager.js';
import { createXRHooks } from './xr-hooks.js';

export function setupXRLoop({ renderer, renderingSystem, clock, mobileMode, loop }) {
    const xrManager = createXRManager({
        renderer,
        onXRFrame: () => {
            loop.markXRActive(true);
            loop.tick();
        }
    });

    const xrHooks = createXRHooks({
        renderer,
        renderingSystem,
        clock,
        xrManager,
        mobileMode,
        markXRActive: loop.markXRActive
    });
    xrHooks.attachEasterEggButton(loop.tick);

    return { xrManager, xrHooks };
}
