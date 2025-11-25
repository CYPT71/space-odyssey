/**
 * Domain: Space Tree API
 * Clear, stable re-exports around the underlying parser.
 * This provides a single place to import the content model from.
 */

import {
  parseFileSystem,
  isContentFile as _isContentFile,
  isBlogPost as _isBlogPost,
  getGalaxyColor,
  countPlanets
} from '../galaxy/parser.js';

/**
 * Parses the flat file list into a hierarchical SpaceTree.
 * @param {Array<Object>} files - window.fileSystem array
 * @returns {Object} SpaceTree { root:{files,galaxies}, blogs:{gasClouds} }
 */
export const parseSpaceTree = (files) => parseFileSystem(files);

/** @deprecated use isContentPage */
export const isContentFile = _isContentFile;

/**
 * Returns true if a file represents a page (non-blog content)
 */
export const isContentPage = _isContentFile;

/**
 * Returns true if a file represents a blog post
 */
export const isBlogPost = _isBlogPost;

export { getGalaxyColor, countPlanets };

