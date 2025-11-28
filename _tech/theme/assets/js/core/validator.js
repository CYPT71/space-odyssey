/**
 * @fileoverview Functional validation utilities (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

import { ValidationError } from './errors.js';

/**
 * Validates if value is a number
 * @param {*} value - Value to validate
 * @param {string} [name='value'] - Name for error message
 * @throws {ValidationError} If validation fails
 * @returns {boolean} True if valid
 */
export const isNumber = (value, name = 'value') => {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationError(`${name} must be a valid number`, { value });
    }
    return true;
};

/**
 * Validates if value is positive
 * @param {*} value - Value to validate
 * @param {string} [name='value'] - Name for error message
 * @throws {ValidationError} If validation fails
 * @returns {boolean} True if valid
 */
export const isPositive = (value, name = 'value') => {
    isNumber(value, name);
    if (value <= 0) {
        throw new ValidationError(`${name} must be positive`, { value });
    }
    return true;
};

/**
 * Validates if value is a Vector3-like object
 * @param {*} value - Value to validate
 * @param {string} [name='vector'] - Name for error message
 * @throws {ValidationError} If validation fails
 * @returns {boolean} True if valid
 */
export const isVector3 = (value, name = 'vector') => {
    if (!value || typeof value !== 'object') {
        throw new ValidationError(`${name} must be an object`, { value });
    }

    isNumber(value.x, `${name}.x`);
    isNumber(value.y, `${name}.y`);
    isNumber(value.z, `${name}.z`);

    return true;
};

/**
 * Validates ship configuration
 * @param {Object} config - Ship configuration
 * @throws {ValidationError} If validation fails
 * @returns {boolean} True if valid
 */
export const validateShipConfig = (config) => {
    if (!config || typeof config !== 'object') {
        throw new ValidationError('Ship config must be an object', { config });
    }

    if (config.maxSpeed !== undefined) {
        isPositive(config.maxSpeed, 'maxSpeed');
    }

    if (config.position !== undefined) {
        isVector3(config.position, 'position');
    }

    if (config.acceleration !== undefined) {
        isPositive(config.acceleration, 'acceleration');
    }

    if (config.friction !== undefined) {
        isNumber(config.friction, 'friction');
        if (config.friction < 0 || config.friction > 1) {
            throw new ValidationError('friction must be between 0 and 1', { friction: config.friction });
        }
    }

    return true;
};

/**
 * Validates value is in range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} [name='value'] - Name for error message
 * @throws {ValidationError} If validation fails
 * @returns {boolean} True if valid
 */
export const inRange = (value, min, max, name = 'value') => {
    isNumber(value, name);
    if (value < min || value > max) {
        throw new ValidationError(
            `${name} must be between ${min} and ${max}`,
            { value, min, max }
        );
    }
    return true;
};

/**
 * Creates a validator function with custom rules
 * @param {Object} rules - Validation rules
 * @returns {Function} Validator function
 */
export const createValidator = (rules) => {
    return (data) => {
        const errors = [];

        Object.entries(rules).forEach(([field, validators]) => {
            const value = data[field];

            validators.forEach(validator => {
                try {
                    validator(value, field);
                } catch (error) {
                    errors.push({ field, error: error.message });
                }
            });
        });

        if (errors.length > 0) {
            throw new ValidationError('Validation failed', { errors });
        }

        return true;
    };
};
