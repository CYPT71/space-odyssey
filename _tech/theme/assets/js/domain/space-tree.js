/**
 * Domain: Space Tree API
 * Clear, stable re-exports around the underlying parser.
 * This provides a single place to import the content model from.
 */

import {
  parseFileSystem,
  isContentFile as _isContentFile,
  isPostsPost as _isPostsPost,
  getGalaxyColor,
  countPlanets
} from '../galaxy/space-tree-internal.js';

/**
 * Parses the flat file list into a hierarchical SpaceTree.
 * @param {Array<Object>} files - window.fileSystem array
 * @returns {Object} SpaceTree { root:{files,galaxies}, posts:{gasClouds} }
 */
export const parseSpaceTree = (files) => parseFileSystem(files);

/** @deprecated use isContentPage */
export const isContentFile = _isContentFile;

/**
 * Returns true if a file represents a page (non-posts content)
 */
export const isContentPage = _isContentFile;

/**
 * Returns true if a file represents a posts post
 */
export const isPostsPost = _isPostsPost;

export { getGalaxyColor, countPlanets };

