/**
 * Lightweight frame profiler using performance.mark/measure.
 * Designed to be zero-allocation in hot paths after warmup.
 */

const marks = new Map();
const measures = new Map();

export const startMark = (label) => {
    if (!performance?.mark) return;
    const id = `${label}-start`;
    performance.mark(id);
    marks.set(label, id);
};

export const endMark = (label) => {
    if (!performance?.measure) return null;
    const startId = marks.get(label);
    if (!startId) return null;
    const endId = `${label}-end`;
    performance.mark(endId);
    const measureName = `${label}-measure`;
    performance.measure(measureName, startId, endId);
    const entries = performance.getEntriesByName(measureName);
    const last = entries[entries.length - 1];
    measures.set(label, last?.duration || 0);
    return last;
};

export const getDuration = (label) => measures.get(label) || 0;
