/**
 * @fileoverview Functional performance monitoring (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Creates a performance monitor (functional approach)
 * @returns {Object} Performance monitor functions
 */
export const createPerformanceMonitor = () => {
    const metrics = new Map();
    let enabled = true;

    const recordMetric = (name, duration) => {
        if (!metrics.has(name)) {
            metrics.set(name, {
                count: 0,
                total: 0,
                min: Infinity,
                max: -Infinity,
                avg: 0
            });
        }

        const metric = metrics.get(name);
        metric.count++;
        metric.total += duration;
        metric.min = Math.min(metric.min, duration);
        metric.max = Math.max(metric.max, duration);
        metric.avg = metric.total / metric.count;
    };

    const measure = (name, fn) => {
        if (!enabled) return fn();

        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;

        recordMetric(name, duration);

        return result;
    };

    const measureAsync = async (name, fn) => {
        if (!enabled) return await fn();

        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;

        recordMetric(name, duration);

        return result;
    };

    const getMetrics = () => Object.fromEntries(metrics);

    const getMetric = (name) => metrics.get(name) || null;

    const reset = () => metrics.clear();

    const setEnabled = (value) => { enabled = value; };

    const log = () => console.table(getMetrics());

    return {
        measure,
        measureAsync,
        getMetrics,
        getMetric,
        reset,
        setEnabled,
        log
    };
};

/**
 * Global performance monitor instance
 */
export const performanceMonitor = createPerformanceMonitor();
