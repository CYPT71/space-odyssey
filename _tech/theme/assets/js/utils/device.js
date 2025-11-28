/**
 * @fileoverview Device helpers (mobile detection & preferences)
 */

const MOBILE_WIDTH = 900;
const UA_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const isMobile = () => (
    typeof window !== 'undefined'
    && (window.innerWidth <= MOBILE_WIDTH || UA_MOBILE.test(navigator.userAgent))
);

export const prefersReducedEffects = () => (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);
