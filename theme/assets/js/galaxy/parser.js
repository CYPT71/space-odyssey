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
export const isContentFile = (path) => {
    // Accept any markdown file that is not a blog post
    if (!path.endsWith('.md')) {
        return false;
    }
    // Exclude blog posts – they start with /posts/ or content/_posts/
    if (path.startsWith('/posts/') || path.startsWith('content/_posts/')) {
        return false;
    }
    // Exclude technical directories (already handled by EXCLUDED_PATTERNS)
    return !EXCLUDED_PATTERNS.some(pattern => pattern.test(path));
};

/**
 * Checks if a file is a blog post
 * ONLY files in /posts/ create gas clouds
 * @param {string} path - File path
 * @returns {boolean} True if blog post in /posts/
 */
export const isBlogPost = (path) => {
    // Accept blog posts under /posts/ or content/_posts/
    if (!(path.startsWith('/posts/') || path.startsWith('content/_posts/'))) {
        return false;
    }
    if (!path.endsWith('.md')) {
        return false;
    }
    return !EXCLUDED_PATTERNS.some(pattern => pattern.test(path));
};

/**
 * Adds file to galaxy hierarchy recursively
 * @param {Object} galaxy - Galaxy object
 * @param {Array} pathParts - Remaining path parts
 * @param {Object} file - File data
 * @returns {void}
 */
const addToGalaxy = (galaxy, pathParts, file) => {
    if (pathParts.length === 1) {
        // File directly in this galaxy
        galaxy.files.push(file);
    } else {
        // File in sub-galaxy
        const subGalaxyName = pathParts[0];

        if (!galaxy.subGalaxies[subGalaxyName]) {
            galaxy.subGalaxies[subGalaxyName] = {
                name: subGalaxyName,
                files: [],
                subGalaxies: {}
            };
        }

        addToGalaxy(galaxy.subGalaxies[subGalaxyName], pathParts.slice(1), file);
    }
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
        blogs: {
            gasClouds: {} // Gas clouds for blog categories
        }
    };

    console.log('📂 Parsing file system:', files.length, 'files found');
    if (files.length > 0) {
        console.log('📄 First file example:', files[0]);
    }

    // Filter content files (pages)
    const contentFiles = files.filter(f => {
        const isContent = isContentFile(f.path);
        if (!isContent && !isBlogPost(f.path) && !EXCLUDED_PATTERNS.some(p => p.test(f.path))) {
            // console.log('❌ Rejected:', f.path);
        }
        return isContent;
    });

    // Filter blog posts
    const blogPosts = files.filter(f => isBlogPost(f.path));

    console.log(`✅ Accepted ${contentFiles.length} pages and ${blogPosts.length} posts`);

    // Process pages → Galaxies
    // Process pages → Galaxies
    contentFiles.forEach(file => {
        // Strip known prefixes to get a clean relative path
        let relativePath = file.path;
        // Remove leading '/' if present
        relativePath = relativePath.replace(/^\//, '');
        // Remove content/_pages/ or _pages/ prefix if present
        relativePath = relativePath.replace(/^content\/_pages\//, '').replace(/^_pages\//, '');
        const parts = relativePath.split('/').filter(p => p);

        // If file is at root (e.g. index.md, about.md), it's a root planet
        if (parts.length === 1) {
            tree.root.files.push(file);
        } else {
            // File in subdirectory → Planet in galaxy
            // e.g. test/lorem1.md -> galaxy "test", file "lorem1.md"
            const galaxyName = parts[0];
            const subPath = parts.slice(1);

            if (!tree.root.galaxies[galaxyName]) {
                tree.root.galaxies[galaxyName] = {
                    name: galaxyName,
                    files: [],
                    subGalaxies: {}
                };
            }

            addToGalaxy(tree.root.galaxies[galaxyName], subPath, file);
        }
    });

    // Process blogs → Gas Clouds with Nebulae
    blogPosts.forEach(file => {
        // Strip known prefixes for blog posts
        let relativePath = file.path;
        // Remove leading '/' if present
        relativePath = relativePath.replace(/^\//, '');
        // Remove posts/ or content/_posts/ prefix
        relativePath = relativePath.replace(/^posts\//, '').replace(/^content\/_posts\//, '');
        const parts = relativePath.split('/').filter(p => p);

        if (parts.length === 1) {
            // Post directly in /posts/ → Create default gas cloud
            if (!tree.blogs.gasClouds['uncategorized']) {
                tree.blogs.gasClouds['uncategorized'] = {
                    name: 'Uncategorized',
                    posts: [],
                    nebulae: {}
                };
            }
            tree.blogs.gasClouds['uncategorized'].posts.push(file);
        } else {
            // Post in subdirectory → Nebula in gas cloud
            const cloudName = parts[0];
            const subPath = parts.slice(1);

            if (!tree.blogs.gasClouds[cloudName]) {
                tree.blogs.gasClouds[cloudName] = {
                    name: cloudName,
                    posts: [],
                    nebulae: {}
                };
            }

            if (subPath.length === 1) {
                // Post directly in category
                tree.blogs.gasClouds[cloudName].posts.push(file);
            } else {
                // Post in sub-nebula
                const nebulaName = subPath[0];
                if (!tree.blogs.gasClouds[cloudName].nebulae[nebulaName]) {
                    tree.blogs.gasClouds[cloudName].nebulae[nebulaName] = {
                        name: nebulaName,
                        posts: []
                    };
                }
                tree.blogs.gasClouds[cloudName].nebulae[nebulaName].posts.push(file);
            }
        }
    });

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
