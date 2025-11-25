/**
 * @fileoverview File system parser for galaxy hierarchy
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Patterns to exclude technical files
 */
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
    /\.js$/
];

/**
 * Checks if a file should be included as content
 * ONLY files in / can create galaxies
 * @param {string} path - File path
 * @returns {boolean} True if content file in /
 */
export const isContentFile = (path, url) => {
    // Accept Markdown source files OR any page-like URL that is not a posts post
    const isMd = typeof path === 'string' && path.endsWith('.md');
    const looksLikePageUrl = typeof url === 'string' && url.length > 0 && !url.startsWith('/posts/');
    // Exclude posts posts by URL or by path prefix
    const isPostsByPath = typeof path === 'string' && (path.startsWith('/posts/') || path.startsWith('content/_posts/'));
    if (isPostsByPath || (typeof url === 'string' && url.startsWith('/posts/'))) return false;
    // Exclude technical files by path
    if (typeof path === 'string' && EXCLUDED_PATTERNS.some(pattern => pattern.test(path))) return false;
    return isMd || looksLikePageUrl;
};

/**
 * Checks if a file is a posts post
 * ONLY files in /posts/ create gas clouds
 * @param {string} path - File path
 * @returns {boolean} True if posts post in /posts/
 */
export const isPostsPost = (path, url) => {
    // Accept posts posts under /posts/ (by URL) or content/_posts/ (by path)
    const byPath = typeof path === 'string' && (path.startsWith('/posts/') || path.startsWith('content/_posts/'));
    const byUrl = typeof url === 'string' && url.startsWith('/posts/');
    if (!byPath && !byUrl) return false;
    // If using path-based detection, ensure it's a Markdown source file
    if (byPath && !path.endsWith('.md')) return false;
    return !EXCLUDED_PATTERNS.some(pattern => pattern.test(path || ''));
};

/**
 * Adds file to galaxy hierarchy recursively
 * @param {Object} galaxy - Galaxy object
 * @param {Array} pathParts - Remaining path parts
 * @param {Object} file - File data
 * @returns {void}
 */
const addToGalaxy = (galaxy, pathParts, file) => {
    // Safety: if no more parts, treat as file in current galaxy
    if (!Array.isArray(pathParts) || pathParts.length === 0) {
        galaxy.files.push(file);
        return;
    }

    if (pathParts.length === 1) {
        // File directly in this galaxy
        galaxy.files.push(file);
        return;
    }

    // File in sub-galaxy
    const subGalaxyName = pathParts[0];

    // Guard against bad/empty segment to avoid infinite recursion
    if (!subGalaxyName || subGalaxyName === '.') {
        galaxy.files.push(file);
        return;
    }

    if (!galaxy.subGalaxies[subGalaxyName]) {
        galaxy.subGalaxies[subGalaxyName] = {
            name: subGalaxyName,
            files: [],
            subGalaxies: {}
        };
    }

    addToGalaxy(galaxy.subGalaxies[subGalaxyName], pathParts.slice(1), file);
};

/**
 * Parses file system into galaxy hierarchy
 * ONLY processes files from / (galaxies) and /posts/ (gas clouds)
 * @param {Array} files - Array of file objects from Jekyll
 * @returns {Object} Hierarchical structure with galaxies and gas clouds
 */
export const parseFileSystem = (files) => {
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

    // Filter content files (pages)
    const contentFiles = files.filter(f => {
        const isContent = isContentFile(f.path, f.url);
        if (!isContent && !isPostsPost(f.path, f.url) && !EXCLUDED_PATTERNS.some(p => p.test(f.path))) {
            console.log('❌ Rejected:', f.path);
        }
        return isContent;
    });

    // Filter posts posts
    const postsPosts = files.filter(f => isPostsPost(f.path, f.url));

    console.log(`✅ Accepted ${contentFiles.length} pages and ${postsPosts.length} posts`);

    // Helper to normalize page parts from URL/path
    const pagePartsFrom = (file) => {
        let p = (file.url && typeof file.url === 'string') ? file.url : (file.path || '');
        p = p.replace(/^\//, '')
            .replace(/^content\/_pages\//, '')
            .replace(/^_pages\//, '')
            .replace(/\/$/, '')
            .replace(/\.html?$/, '')
            .replace(/\.md$/, '');
        const parts = p.split('/').filter(Boolean);
        console.log('🧭 page parts', { url: file.url, path: file.path, parts });
        return parts;
    };

    // Process pages → Galaxies (iterative)
    contentFiles.forEach(file => {
        const parts = pagePartsFrom(file);

        // Root files (/, /about, /projects …)
        if (parts.length === 0 || parts.length === 1) {
            tree.root.files.push(file);
            console.log('📄 root file', file.url || file.path);
            return;
        }

        // test/lorem1 -> galaxy "test"; test/test2/lorem6 -> galaxy "test" -> sub "test2"
        const galaxyName = parts[0];
        if (!tree.root.galaxies[galaxyName]) {
            tree.root.galaxies[galaxyName] = { name: galaxyName, files: [], subGalaxies: {} };
            console.log('🌀 create top galaxy', galaxyName);
        }
        addToGalaxy(tree.root.galaxies[galaxyName], parts.slice(1), file);
    });

    // Helpers for posts posts
    const ensureCloud = (name) => {
        if (!tree.posts.gasClouds[name]) {
            tree.posts.gasClouds[name] = { name, posts: [], nebulae: {} };
            console.log('☁️ create gas cloud', name);
        }
        return tree.posts.gasClouds[name];
    };

    const ensureNebulaPath = (cloudNode, dirs) => {
        let node = cloudNode;
        for (const dir of dirs) {
            if (!dir) continue;
            if (!node.nebulae[dir]) {
                node.nebulae[dir] = { name: dir, posts: [], nebulae: {} };
                console.log('✨ create nebula', { cloud: cloudNode.name, name: dir });
            }
            node = node.nebulae[dir];
        }
        return node;
    };

    // Process posts → Gas Clouds with Nebulae (iterative & logged)
    postsPosts.forEach(file => {
        // Build parts from URL or path and strip prefixes/extensions
        let p = (file.url && file.url.startsWith('/posts/'))
            ? file.url.replace(/^\/?posts\//, '')
            : (file.path || '').replace(/^posts\//, '').replace(/^content\/_posts\//, '');
        p = p.replace(/^\//, '').replace(/\/$/, '').replace(/\.md$/, '').replace(/\.html?$/, '');
        const parts = p.split('/').filter(Boolean);
        console.log('🧭 post parts', { url: file.url, path: file.path, parts });

        if (parts.length === 1) {
            const key = 'uncategorized';
            ensureCloud(key).posts.push(file);
            console.log('📝 add post to Uncategorized');
            return;
        }

        const cloudName = parts[0];
        const cloudNode = ensureCloud(cloudName);
        const dirs = parts.slice(1, -1); // directories only, last is filename slug
        if (dirs.length === 0) {
            cloudNode.posts.push(file);
            console.log('📝 add post to cloud', cloudName);
        } else {
            const neb = ensureNebulaPath(cloudNode, dirs);
            neb.posts.push(file);
            console.log('📝 add post to nebula', { cloud: cloudName, path: dirs.join('/') });
        }
    });

    console.log('🌳 Parsed tree', tree);

    return tree;
};

/**
 * Generates unique color for galaxy based on name
 * @param {string} name - Galaxy name
 * @returns {number} Color hex
 */
export const getGalaxyColor = (name) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash = hash & hash;
    }

    // Convert to hue (0-360)
    const hue = Math.abs(hash % 360);

    // HSL to RGB conversion (saturation 70%, lightness 60%)
    const s = 0.7;
    const l = 0.6;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (val) => Math.round((val + m) * 255);

    return (toHex(r) << 16) | (toHex(g) << 8) | toHex(b);
};

/**
 * Counts total planets in galaxy (including sub-galaxies)
 * @param {Object} galaxy - Galaxy object
 * @returns {number} Total planet count
 */
export const countPlanets = (galaxy) => {
    let count = galaxy.files.length;

    Object.values(galaxy.subGalaxies).forEach(subGalaxy => {
        count += countPlanets(subGalaxy);
    });

    return count;
};
