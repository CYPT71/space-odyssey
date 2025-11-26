import { DEFAULT_CONTROLS } from './controls-config.js';

export const loadControls = () => {
    try {
        const saved = localStorage.getItem('shipControls');
        return saved ? { ...DEFAULT_CONTROLS, ...JSON.parse(saved) } : { ...DEFAULT_CONTROLS };
    } catch (e) {
        console.warn('Failed to load controls:', e);
        return { ...DEFAULT_CONTROLS };
    }
};

export const saveControls = (controls) => {
    try {
        localStorage.setItem('shipControls', JSON.stringify(controls));
    } catch (e) {
        console.warn('Failed to save controls:', e);
    }
};

export const resetControls = () => ({ ...DEFAULT_CONTROLS });
