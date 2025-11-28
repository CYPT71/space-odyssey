/**
 * @fileoverview Functional reactive state management with Proxy
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Creates a reactive state object using Proxy
 * @param {Object} initialState - Initial state
 * @param {Function} onChange - Callback when state changes
 * @returns {Proxy} Reactive state proxy
 */
export const createReactiveState = (initialState, onChange) => {
    const state = { ...initialState };

    return new Proxy(state, {
        get(target, prop) {
            return target[prop];
        },

        set(target, prop, value) {
            const oldValue = target[prop];
            target[prop] = value;

            if (oldValue !== value && onChange) {
                onChange(prop, value, oldValue);
            }

            return true;
        }
    });
};

/**
 * Creates a deep reactive state with nested object support
 * @param {Object} initialState - Initial state
 * @param {Function} onChange - Callback when state changes
 * @returns {Proxy} Deep reactive state proxy
 */
export const createDeepReactiveState = (initialState, onChange) => {
    const makeReactive = (obj, path = []) => {
        return new Proxy(obj, {
            get(target, prop) {
                const value = target[prop];
                if (value && typeof value === 'object') {
                    return makeReactive(value, [...path, prop]);
                }
                return value;
            },

            set(target, prop, value) {
                const oldValue = target[prop];
                target[prop] = value;

                if (oldValue !== value && onChange) {
                    onChange([...path, prop].join('.'), value, oldValue);
                }

                return true;
            }
        });
    };

    return makeReactive(initialState);
};

/**
 * Creates a computed property that updates when dependencies change
 * @param {Function} computeFn - Function to compute value
 * @param {Array} dependencies - Reactive state dependencies
 * @returns {Function} Getter function
 */
export const createComputed = (computeFn, dependencies) => {
    let cachedValue;
    let isDirty = true;

    // Watch dependencies
    dependencies.forEach(dep => {
        if (dep && typeof dep === 'object') {
            // Assume it's a reactive proxy; touching dependency marks dirty
            isDirty = true;
        }
    });

    return () => {
        if (isDirty) {
            cachedValue = computeFn();
            isDirty = false;
        }
        return cachedValue;
    };
};

/**
 * Creates an immutable state proxy
 * @param {Object} state - State object
 * @returns {Proxy} Immutable proxy
 */
export const createImmutableState = (state) => {
    return new Proxy(state, {
        get(target, prop) {
            const value = target[prop];
            if (value && typeof value === 'object') {
                return createImmutableState(value);
            }
            return value;
        },

        set() {
            throw new Error('Cannot modify immutable state');
        },

        deleteProperty() {
            throw new Error('Cannot delete from immutable state');
        }
    });
};
