import { EXCLUDED_PATTERNS } from './space-tree-config.js';
import { addToHierarchy } from './space-tree-hierarchy.js';

const noop = () => { };

export const classifyFiles = (list, classifiers) => {
    const buckets = Object.fromEntries(classifiers.map(({ key }) => [key, []]));
    const reject = [];

    list.forEach((file) => {
        const normalizedPath = file.path || '';
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

export const partsLogger = (label) => (file, parts) => {
    console.log(label, { url: file.url, path: file.path, parts });
};

export const buildHierarchy = (items, options) => {
    const {
        getParts,
        handleRootLeaf,
        getContainer,
        onAssigned,
        onParts,
        nodeProps: explicitNodeProps,
        ...fallbackProps
    } = options;

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

export const processHierarchies = (configs) => {
    if (!Array.isArray(configs) || configs.length === 0) return;
    configs.forEach(({ items, nodeProps, onParts, ...options }) => {
        const logger = typeof onParts === 'function'
            ? onParts
            : partsLogger(`🧭 ${nodeProps.spaceType || nodeProps.typeFlag || 'hierarchy'} parts`);
        buildHierarchy(items, { nodeProps, onParts: logger, ...options });
    });
};

export const noopHandler = noop;
