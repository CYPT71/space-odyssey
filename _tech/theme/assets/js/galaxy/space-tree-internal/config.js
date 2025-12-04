/**
 * Patterns to exclude technical files
 */
export const EXCLUDED_PATTERNS = [
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


/**
 * Shared structure properties for the hierarchy nodes. Switching between
 * galaxy and nebula behaviour is only a matter of swapping this config.
 */
export const HIERARCHY_NODE_PROPS = Object.freeze({
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



export const RUNTIME_BASE = (typeof window !== 'undefined' && window.siteBase)
    ? (window.siteBase.replace(/\/+$/, '') || '')
    : '';

const BASE_URL = RUNTIME_BASE;

export const BASE_SLUG = BASE_URL.replace(/^\/+|\/+$/g, '');