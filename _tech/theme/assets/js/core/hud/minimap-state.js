const STORAGE_KEY = 'minimapState';

const safeParse = (str) => {
    try {
        return str ? JSON.parse(str) : null;
    } catch (error) {
        console.error('Failed to parse minimap state:', error);
    }
};

const load = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return safeParse(raw) || null;
};

const save = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Failed to save minimap state:', error);
    }
};

export const createState = () => {
    const base = load() || {
        galaxiesCollapsed: false,
        gasCollapsed: false,
        planetsCollapsed: false,
        nebulaCollapsed: false,
        galaxyCollapse: {},
        cloudCollapse: {}
    };
    base.galaxyCollapse = base.galaxyCollapse || {};
    base.cloudCollapse = base.cloudCollapse || {};
    window.minimapState = base;
    return base;
};

export const persistState = () => {
    if (window.minimapState) save(window.minimapState);
};

export const toggleMinimapSection = (section) => {
    if (!window.minimapState) return;
    const keyMap = {
        galaxies: 'galaxiesCollapsed',
        gas: 'gasCollapsed',
        planets: 'planetsCollapsed',
        nebulae: 'nebulaCollapsed'
    };
    const key = keyMap[section] || `${section}Collapsed`;
    if (!key) return;
    window.minimapState[key] = !window.minimapState[key];
    persistState();
};

export const toggleGalaxyCollapse = (uuid) => {
    if (!window.minimapState) return;
    const map = window.minimapState.galaxyCollapse;
    map[uuid] = !map[uuid];
    persistState();
};

export const toggleCloudCollapse = (uuid) => {
    if (!window.minimapState) return;
    const map = window.minimapState.cloudCollapse;
    map[uuid] = !map[uuid];
    persistState();
};
