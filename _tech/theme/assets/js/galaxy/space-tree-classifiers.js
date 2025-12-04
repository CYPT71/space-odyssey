import { BASE_SLUG, EXCLUDED_PATTERNS, normalizeInput } from './space-tree-config.js';

const makeFileClassifier = ({ includePaths, includeUrls, extensions = ['.md'], disallow = [], requireUrl = false }) => {
    return (path, url) => {
        const { path: safePath, url: safeUrl } = normalizeInput(path, url);
        if (requireUrl && !safeUrl) return false;
        if (disallow.some(pattern => pattern.test(safePath) || pattern.test(safeUrl))) return false;
        if (EXCLUDED_PATTERNS.some(pattern => pattern.test(safePath))) return false;
        if (path.includes('404')) return false;
        const pathAllowed = includePaths.some(prefix => prefix.test(safePath));
        const urlAllowed = includeUrls.some(prefix => prefix.test(safeUrl));
        if (!pathAllowed && !urlAllowed) return false;

        if (extensions.length > 0 && !extensions.some(ext => safePath.endsWith(ext))) return false;

        return true;
    };
};

const stripPrefix = (raw, prefix) => {
    if (prefix instanceof RegExp) {
        return raw.replace(prefix, '');
    }

    if (raw.startsWith(prefix)) {
        return raw.slice(prefix.length);
    }

    return raw;
};

const makePartsParser = ({ prefixes, defaultFirstSegment }) => (file) => {
    let raw = (file.url && typeof file.url === 'string') ? file.url : (file.path || '');

    prefixes.forEach(prefix => {
        raw = stripPrefix(raw, prefix);
    });

    raw = raw.replace(/^\//, '')
        .replace(/\/$/, '')
        .replace(/\.md$/, '')
        .replace(/\.html?$/, '');

    const parts = raw.split('/').filter(Boolean);
    return (defaultFirstSegment && parts.length === 1)
        ? [defaultFirstSegment, ...parts]
        : parts;
};

const isContentFile = makeFileClassifier({
    includePaths: [/^\//, /^content\/_pages\//, /^_pages\//],
    includeUrls: [/^\/(?!posts\/)/],
    disallow: [
        /^\/posts\//,
        /^_posts\//,
        /^content\/_posts\//,
        /^\/[^/]+\/\d{4}-\d{2}-\d{2}-/
    ],
    extensions: ['.md']
});

const isPostsPost = makeFileClassifier({
    includePaths: [/^\/posts\//, /^content\/_posts\//, /^_posts\//],
    includeUrls: [
        /^\/posts\//,
        /^\/[^/]+\/\d{4}-\d{2}-\d{2}-/
    ],
    extensions: ['.md'],
    requireUrl: false
});

const pagePartsFrom = (file) => {
    const parts = makePartsParser({ prefixes: ['/', 'content/_pages/', '_pages/'] })(file);
    if (BASE_SLUG && parts[0] === BASE_SLUG) parts.shift();
    return parts;
};

const postPartsFrom = (file) => {
    let raw = file.path || file.url || '';
    raw = raw.replace(/\\/g, '/').replace(/^\.\//, '');

    raw = raw
        .replace(/^\/?content\/_posts\//, '')
        .replace(/^\/?_posts\//, '')
        .replace(/^\/?posts\//, '')
        .replace(/^\//, '');

    raw = raw.replace(/\/$/, '').replace(/\.md$/, '').replace(/\.html?$/, '');
    let parts = raw.split('/').filter(Boolean);
    if (BASE_SLUG && parts[0] === BASE_SLUG) parts = parts.slice(1);
    if (parts.length === 1) return ['uncategorized', ...parts];
    return parts;
};

export {
    isContentFile,
    isPostsPost,
    makeFileClassifier,
    makePartsParser,
    pagePartsFrom,
    postPartsFrom
};
