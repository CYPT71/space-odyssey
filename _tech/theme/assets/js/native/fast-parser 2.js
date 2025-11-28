/**
 * @fileoverview Optional WASM-assisted parser entrypoint.
 * Falls back to JS space-tree parser; WASM currently only returns a file count placeholder.
 */
import { parseSpaceTree } from '../galaxy/space-tree-internal.js';

const wasmPath = '/_tech/native/fast-parser.wasm';
let wasm = null;
let ready = null;

const loadWasm = () => {
  if (ready) return ready;
  ready = fetch(wasmPath)
    .then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error('missing wasm')))
    .then(buf => WebAssembly.instantiate(buf, {}))
    .then(({ instance }) => {
      wasm = instance.exports;
      return wasm;
    })
    .catch(() => null);
  return ready;
};

/**
 * Parses the file system with optional WASM fast-path (currently placeholder).
 * @param {Array<Object>} files
 * @returns {Promise<Object>} Parsed tree
 */
export const parseWithWasm = async (files) => {
  await loadWasm();
  // Placeholder: just log count if wasm available; real tree is from JS parser
  if (wasm && typeof wasm.count_files === 'function') {
    try {
      console.log('🧪 WASM parser count:', wasm.count_files(files.length));
    } catch (e) {
      console.warn('WASM parser count failed, using JS:', e);
    }
  }
  return parseSpaceTree(files);
};
