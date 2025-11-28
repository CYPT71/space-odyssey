/**
 * @fileoverview Device helpers (mobile detection & preferences)
 */

const MOBILE_WIDTH = 900;
const UA_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

// Mildly conservative mobile check: viewport, UA or coarse pointer
export const isMobile = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const touch = navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    return window.innerWidth <= MOBILE_WIDTH || UA_MOBILE.test(navigator.userAgent) || coarse || touch;
};

export const prefersReducedEffects = () => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
