/**
 * @fileoverview Functional logging utility (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Log levels
 * @enum {number}
 */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

/**
 * Creates a logger (functional approach)
 * @param {string} context - Logger context/namespace
 * @param {number} [level=LogLevel.INFO] - Minimum log level
 * @returns {Object} Logger functions
 */
export const createLogger = (context, level = LogLevel.INFO) => {
    const log = (logLevel, levelName, message, data) => {
        if (level <= logLevel) {
            const logFn = console[levelName.toLowerCase()] || console.log;
            logFn(`[${context}] ${message}`, data || '');
        }
    };

    return {
        debug: (message, data) => log(LogLevel.DEBUG, 'DEBUG', message, data),
        info: (message, data) => log(LogLevel.INFO, 'INFO', message, data),
        warn: (message, data) => log(LogLevel.WARN, 'WARN', message, data),
        error: (message, error) => log(LogLevel.ERROR, 'ERROR', message, error),
        child: (childContext) => createLogger(`${context}:${childContext}`, level)
    };
};
