/**
 * @fileoverview Gameplay hooks placeholder for future engaging mechanics.
 * @description Provides a simple event-driven hook to plug interactive features.
 */

const listeners = new Map();

export const onGameplayEvent = (eventName, handler) => {
    if (!listeners.has(eventName)) listeners.set(eventName, new Set());
    listeners.get(eventName).add(handler);
    return () => listeners.get(eventName)?.delete(handler);
};

export const emitGameplayEvent = (eventName, payload) => {
    const set = listeners.get(eventName);
    if (!set || set.size === 0) return;
    set.forEach(fn => {
        try { fn(payload); } catch (e) { /* swallow to avoid breaking loop */ }
    });
};

// Example hook point: call when scan completes, teleport, or collect item, etc.
