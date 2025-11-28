/**
 * @fileoverview Functional event system (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Creates an event emitter (functional approach)
 * @returns {Object} Event emitter functions
 */
export const createEventEmitter = () => {
    const listeners = new Map();

    const on = (event, callback) => {
        if (!listeners.has(event)) {
            listeners.set(event, []);
        }
        listeners.get(event).push(callback);

        // Return unsubscribe function
        return () => off(event, callback);
    };

    const once = (event, callback) => {
        const wrapper = (...args) => {
            callback(...args);
            off(event, wrapper);
        };
        return on(event, wrapper);
    };

    const off = (event, callback) => {
        if (!listeners.has(event)) return;

        const callbacks = listeners.get(event);
        const index = callbacks.indexOf(callback);

        if (index !== -1) {
            callbacks.splice(index, 1);
        }

        if (callbacks.length === 0) {
            listeners.delete(event);
        }
    };

    const emit = (event, data) => {
        if (!listeners.has(event)) return;

        const callbacks = listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    };

    const removeAll = (event) => {
        if (event) {
            listeners.delete(event);
        } else {
            listeners.clear();
        }
    };

    const count = (event) => {
        return listeners.has(event) ? listeners.get(event).length : 0;
    };

    return { on, once, off, emit, removeAll, count };
};
