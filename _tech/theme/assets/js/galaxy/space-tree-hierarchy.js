import { HIERARCHY_NODE_PROPS } from './space-tree-config.js';

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

const getOrCreateNode = (bucket, name, nodeProps) => {
    const { typeFlag } = nodeProps;
    if (!bucket[name]) {
        bucket[name] = createHierarchyNode(name, nodeProps);
        console.log('🌀 create node', name, typeFlag ? `(${typeFlag})` : '');
    }
    return bucket[name];
};

const addToHierarchy = (node, pathParts, file, nodeProps) => {
    const { childKey, leafKey } = nodeProps;
    if (!Array.isArray(pathParts) || pathParts.length <= 1) {
        node[leafKey].push(file);
        return;
    }

    const childName = pathParts[0];

    if (!childName || childName === '.') {
        node[leafKey].push(file);
        return;
    }

    const childNode = getOrCreateNode(node[childKey], childName, nodeProps);
    addToHierarchy(childNode, pathParts.slice(1), file, nodeProps);
};

const makeContainerGetter = (rootBucket, nodeProps, minDepth = 0) => (parts) => {
    if (!Array.isArray(parts) || parts.length <= minDepth) return null;
    const topLevelName = parts[0];
    const parentNode = getOrCreateNode(rootBucket, topLevelName, nodeProps);
    return { parentNode, remainingParts: parts.slice(1) };
};

export {
    addToHierarchy,
    createHierarchyNode,
    getOrCreateNode,
    HIERARCHY_NODE_PROPS,
    makeContainerGetter
};
