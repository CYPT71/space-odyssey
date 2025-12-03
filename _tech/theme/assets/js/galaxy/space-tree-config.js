const EXCLUDED_PATTERNS = [
    /^theme\//,
    /^_site\//,
    /^\.git\//,
    /^\.gemini\//,
    /^node_modules\//,
    /^Gemfile/,
    /^_config\.yml/,
    /^\.gitignore/,
    /\.scss$/,
    /\.css$/,
    /\.js$/,
    /^404\.html$/,
    /^404\.md$/
];

const HIERARCHY_NODE_PROPS = Object.freeze({
    galaxy: {
        childKey: 'subGalaxies',
        leafKey: 'files',
        typeFlag: 'isGalaxy',
        isGalaxy: true,
        spaceType: 'galaxy'
    },
    nebula: {
        childKey: 'nebulae',
        leafKey: 'posts',
        typeFlag: 'isNebula',
        isGalaxy: false,
        spaceType: 'nebula'
    }
});

const RUNTIME_BASE = (typeof window !== 'undefined' && window.siteBase)
    ? (window.siteBase.replace(/\/+$/, '') || '')
    : '';
const BASE_URL = RUNTIME_BASE;
const BASE_SLUG = BASE_URL.replace(/^\/+|\/+$/g, '');

const stripBase = (val = '') => {
    if (!BASE_URL) return val;
    return val.startsWith(BASE_URL) ? (val.slice(BASE_URL.length) || '/') : val;
};

const normalizeInput = (path, url) => {
    const safePath = path || '';
    const safeUrl = stripBase(url || '');
    return { path: safePath, url: safeUrl };
};

export {
    BASE_SLUG,
    EXCLUDED_PATTERNS,
    HIERARCHY_NODE_PROPS,
    normalizeInput,
    stripBase
};
