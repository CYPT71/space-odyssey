/**
 * @fileoverview File system parser for galaxy hierarchy
 * @author CYPT71
 * @version 2.0.0
 */
import { startMark, endMark } from '../core/profiler.js';








/**
 * Removes standard prefixes/affixes from a path and optionally seeds a default
 * first segment when the path is otherwise a leaf.
 *
 * @param {Object} config - Configuration for the cleaner
 * @param {Array<string>} config.prefixes - Prefixes to drop from the raw path
 * @param {string} [config.defaultFirstSegment] - Segment to inject when the
 * path only contains a single element
 * @returns {(file: Object) => string[]} Function that produces normalized parts
 */
const makePartsParser = ({ prefixes, defaultFirstSegment }) => (file) => {
    let raw = (file.url && typeof file.url === 'string') ? file.url : (file.path || '');

    prefixes.forEach(prefix => {
        raw = raw.replace(new RegExp(`^${prefix}`), '');
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

/**
 * Creates a hierarchical node that can represent either a galaxy or nebula.
 * The only behavioral difference between the two is the flag stored on the
 * node, which downstream systems can use to pick the appropriate renderer.
 *
 * @param {string} name - Node name
 * @param {string} childKey - Property name for children
 * @param {string} leafKey - Property name for leaf collection
 * @param {string} [typeFlag] - Boolean flag stored on the node (e.g. 'isGalaxy' or 'isNebula')
 * @returns {Object} Hierarchy node
 */
const createHierarchyNode = (name, nodeProps = {}) => {
    const { childKey, leafKey, typeFlag, isGalaxy, spaceType } = nodeProps;

    return {
        name,
        [leafKey]: [],
        [childKey]: {},
        ...(typeFlag ? { [typeFlag]: true } : {}),
        ...(typeof isGalaxy === 'boolean' ? { isGalaxy } : {}),
        ...(spaceType ? { spaceType } : {})
    };
};

/**
 * Generates a function that returns the parent node and remaining parts for a
 * hierarchy insertion, or null when the item should be attached directly to
 * the root handler.
 *
 * @param {Object} rootBucket - Dictionary that contains the top-level nodes
 * @param {Object} nodeProps - Hierarchy node properties
 * @param {number} [minDepth=0] - Minimum number of parts required before
 * assigning to a hierarchy node (values <= minDepth go to the root handler)
 * @returns {(parts: string[]) => ({ parentNode: Object, remainingParts: string[] }|null)}
 */
const makeContainerGetter = (rootBucket, nodeProps, minDepth = 0) => (parts) => {
    if (!Array.isArray(parts) || parts.length <= minDepth) return null;
    const topLevelName = parts[0];
    const parentNode = getOrCreateNode(rootBucket, topLevelName, nodeProps);
    return { parentNode, remainingParts: parts.slice(1) };
};

/**
 * Gets (or creates) a hierarchy node from a dictionary using shared options.
 *
 * @param {Object} bucket - Dictionary of nodes
 * @param {string} name - Node name
 * @param {Object} options - Hierarchy options
 * @param {string} options.childKey - Property name for children
 * @param {string} options.leafKey - Property name for leaves
 * @param {string} [options.typeFlag] - Flag name to set on the node
 * @returns {Object} The fetched or newly created node
 */
const getOrCreateNode = (bucket, name, nodeProps) => {
    const { typeFlag } = nodeProps;
    if (!bucket[name]) {
        bucket[name] = createHierarchyNode(name, nodeProps);
        console.log('🌀 create node', name, typeFlag ? `(${typeFlag})` : '');
    }
    return bucket[name];
};

/**
 * Adds a file/post to a hierarchical node (galaxy or nebula) recursively.
 *
 * @param {Object} node - Hierarchy node
 * @param {Array} pathParts - Remaining path parts
 * @param {Object} file - File data
 * @param {Object} options - Configuration
 * @param {string} options.childKey - Property name for children
 * @param {string} options.leafKey - Property name for leaves
 * @param {string} options.typeFlag - Boolean flag to set on child nodes
 * @returns {void}
 */
const addToHierarchy = (node, pathParts, file, nodeProps) => {
    const { childKey, leafKey } = nodeProps;
    if (!Array.isArray(pathParts) || pathParts.length <= 1) {
        node[leafKey].push(file);
        return;
    }

    const childName = pathParts[0];

    // Guard against bad/empty segment to avoid infinite recursion
    if (!childName || childName === '.') {
        node[leafKey].push(file);
        return;
    }

    const childNode = getOrCreateNode(node[childKey], childName, nodeProps);
    addToHierarchy(childNode, pathParts.slice(1), file, nodeProps);
};

const noop = () => { };

/**
 * Parses file system into galaxy hierarchy
 * ONLY processes files from / (galaxies) and /posts/ (gas clouds)
 * @param {Array} files - Array of file objects from Jekyll
 * @returns {Object} Hierarchical structure with galaxies and gas clouds
 */
export const parseFileSystem = (files) => {
    startMark('space-parse');
    startMark('space-parse-classify');
    const tree = {
        root: {
            files: [],
            galaxies: {}
        },
        posts: {
            gasClouds: {} // Gas clouds for posts categories
        }
    };

    console.log('📂 Parsing file system:', files.length, 'files found');
    if (files.length > 0) {
        console.log('📄 First file example:', files[0]);
    }

    const classifyFiles = (list, classifiers) => {
        const buckets = Object.fromEntries(classifiers.map(({ key }) => [key, []]));
        const reject = [];

        list.forEach((file) => {
            const normalizedPath = file.path || '';
            // Fast path: anything living under _posts belongs to posts bucket
            if (/_posts\//.test(normalizedPath)) {
                const postsClassifier = classifiers.find(({ key }) => key === 'posts');
                if (postsClassifier) {
                    buckets.posts.push(file);
                    return;
                }
            }

            const classifier = classifiers.find(({ test }) => test(file.path, file.url));
            if (classifier) {
                buckets[classifier.key].push(file);
                return;
            }

            if (!EXCLUDED_PATTERNS.some(p => p.test(normalizedPath))) {
                reject.push(normalizedPath);
            }
        });

        return { buckets, reject };
    };

    const { buckets, reject } = classifyFiles(files, [
        { key: 'pages', test: isContentFile },
        { key: 'posts', test: isPostsPost }
    ]);
    endMark('space-parse-classify');

    reject.forEach(path => console.log('❌ Rejected:', path));
    console.log(`✅ Accepted ${buckets.pages.length} pages and ${buckets.posts.length} posts`);

    const pagePartsFrom = (file) => {
        const parts = makePartsParser({ prefixes: ['/', 'content/_pages/', '_pages/'] })(file);
        // Drop base slug if it sneaks into the first segment
        if (BASE_SLUG && parts[0] === BASE_SLUG) parts.shift();
        return parts;
    };

    const buildHierarchy = (items, options) => {
        const {
            getParts,
            handleRootLeaf,
            getContainer,
            onAssigned,
            onParts,
            nodeProps: explicitNodeProps,
            ...fallbackProps
        } = options;

        // Nebula and galaxy share this builder; the nodeProps toggle the render path.
        const nodeProps = explicitNodeProps || fallbackProps;

        items.forEach(file => {
            const parts = getParts(file);
            if (typeof onParts === 'function') {
                onParts(file, parts);
            }
            const containerInfo = getContainer(parts, file);

            if (!containerInfo) {
                handleRootLeaf(file, parts);
                return;
            }

            const { parentNode, remainingParts } = containerInfo;
            if (!remainingParts.length) {
                handleRootLeaf(file, parts);
                return;
            }

            addToHierarchy(parentNode, remainingParts, file, nodeProps);

            if (typeof onAssigned === 'function') {
                onAssigned(file, parts, parentNode.name, nodeProps);
            }
        });
    };

    const galaxyNodeProps = HIERARCHY_NODE_PROPS.galaxy;
    const nebulaNodeProps = HIERARCHY_NODE_PROPS.nebula;
    // Custom post parts parser: crawl all subfolders under posts until the file
    const postPartsFrom = (file) => {
        let raw = file.path || file.url || '';
        raw = raw.replace(/\\/g, '/').replace(/^\.\//, '');

        // Strip common prefixes
        raw = raw
            .replace(/^\/?content\/_posts\//, '')
            .replace(/^\/?_posts\//, '')
            .replace(/^\/?posts\//, '')
            .replace(/^\//, '');

        raw = raw.replace(/\/$/, '').replace(/\.md$/, '').replace(/\.html?$/, '');
        let parts = raw.split('/').filter(Boolean);
        if (BASE_SLUG && parts[0] === BASE_SLUG) parts = parts.slice(1);
        if (parts.length === 1) return ['uncategorized', ...parts]; // ensure a cloud bucket
        return parts;
    };

    const partsLogger = (label) => (file, parts) => {
        console.log(label, { url: file.url, path: file.path, parts });
    };

    const hierarchyConfigs = [
        {
            items: buckets.pages,
            nodeProps: galaxyNodeProps,
            getParts: pagePartsFrom,
            handleRootLeaf: (file) => {
                tree.root.files.push(file);
                console.log('📄 root file', file.url || file.path);
            },
            getContainer: makeContainerGetter(tree.root.galaxies, galaxyNodeProps, 1),
            onParts: partsLogger('🧭 page parts'),
            onAssigned: (file, parts, galaxyName) => {
                if (parts.length <= 1) return;
                console.log('📝 add page to galaxy', { galaxy: galaxyName, path: parts.slice(1).join('/') });
            }
        },
        {
            items: buckets.posts,
            nodeProps: nebulaNodeProps,
            getParts: postPartsFrom,
            handleRootLeaf: noop,
            getContainer: makeContainerGetter(tree.posts.gasClouds, nebulaNodeProps),
            onParts: partsLogger('🧭 post parts'),
            onAssigned: (_file, parts, cloudName) => {
                const nebulaPath = parts.slice(1, -1);
                if (nebulaPath.length > 0) {
                    console.log('📝 add post to nebula', { cloud: cloudName, path: nebulaPath.join('/') });
                } else {
                    console.log('📝 add post to cloud', cloudName);
                }
            }
        }
    ];

    const processHierarchies = (configs) => {
        if (!Array.isArray(configs) || configs.length === 0) return;
        configs.forEach(({ items, nodeProps, onParts, ...options }) => {
            const logger = typeof onParts === 'function'
                ? onParts
                : partsLogger(`🧭 ${nodeProps.spaceType || nodeProps.typeFlag || 'hierarchy'} parts`);
            buildHierarchy(items, { nodeProps, onParts: logger, ...options });
        });
    };

    startMark('space-parse-hierarchy');
    processHierarchies(hierarchyConfigs);
    endMark('space-parse-hierarchy');

    // Optional: mirror posts into a fake "posts" galaxy (enabled in test/env flags)
    const enablePostsGalaxy = (typeof process !== 'undefined' && process.env && (process.env.ENABLE_POSTS_GALAXY || process.env.NODE_ENV === 'test'))
        || (typeof window !== 'undefined' && window.ENABLE_POSTS_GALAXY);
    if (enablePostsGalaxy && buckets.posts.length > 0) {
        const postsGalaxy = getOrCreateNode(tree.root.galaxies, 'posts', galaxyNodeProps);
        buckets.posts.forEach(file => {
            const parts = postPartsFrom(file);
            postsGalaxy.files.push(file);
            if (parts && parts.length > 1) {
                addToHierarchy(postsGalaxy, parts, file, galaxyNodeProps);
            }
        });
    }

    const total = endMark('space-parse');
    if (total?.duration) {
        console.log('⏱ parse duration ms', Number(total.duration.toFixed(3)));
    }
    console.log('🌳 Parsed tree', tree);

    return tree;
};





// Preserve legacy export name expected by WASM wrapper
export const parseSpaceTree = parseFileSystem;
