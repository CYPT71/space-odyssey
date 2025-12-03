/**
 * @fileoverview File system parser for galaxy hierarchy
 * @author CYPT71
 * @version 2.0.0
 */
import { startMark, endMark } from '../core/profiler.js';
import {
    HIERARCHY_NODE_PROPS
} from './space-tree-config.js';
import {
    isContentFile,
    isPostsPost,
    pagePartsFrom,
    postPartsFrom
} from './space-tree-classifiers.js';
import {
    addToHierarchy,
    getOrCreateNode,
    makeContainerGetter
} from './space-tree-hierarchy.js';
import {
    buildHierarchy,
    classifyFiles,
    partsLogger,
    processHierarchies,
    noopHandler
} from './space-tree-processing.js';
import { countPlanets, getGalaxyColor } from './space-tree-colors.js';

export const parseFileSystem = (files) => {
    startMark('space-parse');
    startMark('space-parse-classify');
    const tree = {
        root: {
            files: [],
            galaxies: {}
        },
        posts: {
            gasClouds: {}
        }
    };

    console.log('📂 Parsing file system:', files.length, 'files found');
    if (files.length > 0) {
        console.log('📄 First file example:', files[0]);
    }

    const { buckets, reject } = classifyFiles(files, [
        { key: 'pages', test: isContentFile },
        { key: 'posts', test: isPostsPost }
    ]);
    endMark('space-parse-classify');

    reject.forEach(path => console.log('❌ Rejected:', path));
    console.log(`✅ Accepted ${buckets.pages.length} pages and ${buckets.posts.length} posts`);

    const galaxyNodeProps = HIERARCHY_NODE_PROPS.galaxy;
    const nebulaNodeProps = HIERARCHY_NODE_PROPS.nebula;

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
            handleRootLeaf: noopHandler,
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

    startMark('space-parse-hierarchy');
    processHierarchies(hierarchyConfigs);
    endMark('space-parse-hierarchy');

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

export { countPlanets, getGalaxyColor };
export { isContentFile, isPostsPost } from './space-tree-classifiers.js';
export const parseSpaceTree = parseFileSystem;
