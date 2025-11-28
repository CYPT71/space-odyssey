/**
 * @fileoverview Custom error classes for better error handling
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Base error class for space scene errors
 * @extends Error
 */
export class SpaceSceneError extends Error {
    /**
     * @param {string} message - Error message
     * @param {Object} [context={}] - Additional context
     */
    constructor(message, context = {}) {
        super(message);
        this.name = 'SpaceSceneError';
        this.context = context;
        this.timestamp = Date.now();

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SpaceSceneError);
        }
    }
}

/**
 * Error for invalid configuration
 * @extends SpaceSceneError
 */
export class ConfigurationError extends SpaceSceneError {
    constructor(message, context) {
        super(message, context);
        this.name = 'ConfigurationError';
    }
}

/**
 * Error for validation failures
 * @extends SpaceSceneError
 */
export class ValidationError extends SpaceSceneError {
    constructor(message, context) {
        super(message, context);
        this.name = 'ValidationError';
    }
}

/**
 * Error for rendering issues
 * @extends SpaceSceneError
 */
export class RenderError extends SpaceSceneError {
    constructor(message, context) {
        super(message, context);
        this.name = 'RenderError';
    }
}

/**
 * Centralized error boundary for handling and logging errors
 */
export class ErrorBoundary {
    /**
     * Handles errors with logging and optional recovery
     * @param {Error} error - The error to handle
     * @param {string} context - Context where error occurred
     * @param {Function} [recovery] - Optional recovery function
     * @returns {void}
     */
    static handle(error, context, recovery = null) {
        const errorInfo = {
            name: error.name,
            message: error.message,
            context,
            timestamp: new Date().toISOString(),
            stack: error.stack
        };

        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[${context}]`, errorInfo);
        }

        // Attempt recovery if provided
        if (recovery && typeof recovery === 'function') {
            try {
                recovery(error);
            } catch (recoveryError) {
                console.error('Recovery failed:', recoveryError);
            }
        }

        // In production, send to error tracking service
        // this.sendToErrorTracking(errorInfo);
    }

    /**
     * Wraps a function with error handling
     * @param {Function} fn - Function to wrap
     * @param {string} context - Context name
     * @returns {Function} Wrapped function
     */
    static wrap(fn, context) {
        return (...args) => {
            try {
                return fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error;
            }
        };
    }
}
