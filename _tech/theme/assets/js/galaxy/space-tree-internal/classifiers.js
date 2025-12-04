/**
 * Creates a classifier that decides whether a file belongs to a collection and
 * keeps a consistent exclusion strategy.
 *
 * @param {Object} options - Predicate configuration
 * @param {Array<RegExp>} options.includePaths - Path prefixes that qualify
 * @param {Array<RegExp>} options.includeUrls - URL prefixes that qualify
 * @param {Array<string>} [options.extensions] - Required file extensions (paths)
 * @param {Array<RegExp>} [options.disallow] - Extra patterns that should reject
 * @param {boolean} [options.requireUrl] - Whether a valid URL is mandatory
 * @returns {(path: string, url: string) => boolean}
 */
const makeFileClassifier = ({ includePaths, includeUrls, extensions = ['.md'], disallow = [], requireUrl = false }) => {
    return (path, url) => {
        const { path: safePath, url: safeUrl } = normalizeInput(path, url);
        if (requireUrl && !safeUrl) return false;
        if (disallow.some(pattern => pattern.test(safePath) || pattern.test(safeUrl))) return false;
        if (EXCLUDED_PATTERNS.some(pattern => pattern.test(safePath))) return false;
        if (path.includes("404")) return false;
        const pathAllowed = includePaths.some(prefix => prefix.test(safePath));
        const urlAllowed = includeUrls.some(prefix => prefix.test(safeUrl));
        if (!pathAllowed && !urlAllowed) return false;

        if (extensions.length > 0 && !extensions.some(ext => safePath.endsWith(ext))) return false;

        return true;
    };
};

/**
 * Checks if a file should be included as content
 * ONLY files in / can create galaxies
 * @param {string} path - File path
 * @returns {boolean} True if content file in /
 */
export const isContentFile = makeFileClassifier({
    includePaths: [/^\//, /^content\/_pages\//, /^_pages\//],
    includeUrls: [/^\/(?!posts\/)/], // exclude /posts/ urls from pages
    disallow: [
        /^\/posts\//,
        /^_posts\//,
        /^content\/_posts\//,
        // Posts often look like /devops/2024-11-22-slug
        /^\/[^/]+\/\d{4}-\d{2}-\d{2}-/
    ],
    extensions: ['.md']
});

/**
 * Checks if a file is a posts post
 * ONLY files in /posts/ create gas clouds
 * @param {string} path - File path
 * @returns {boolean} True if posts post in /posts/
 */
export const isPostsPost = makeFileClassifier({
    includePaths: [/^\/posts\//, /^content\/_posts\//, /^_posts\//],
    includeUrls: [
        /^\/posts\//,
        // Accept date-slug style at root (e.g. /devops/2024-11-22-foo)
        /^\/[^/]+\/\d{4}-\d{2}-\d{2}-/
    ],
    extensions: ['.md'],
    requireUrl: false
});
