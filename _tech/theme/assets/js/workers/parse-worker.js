// Web Worker to parse file system into SpaceTree
import { parseSpaceTree } from '../domain/space-tree.js';
import { parseWithWasm } from '../native/fast-parser.js';

self.onmessage = async (e) => {
  const { files } = e.data || {};
  try {
    // Try WASM-assisted parser; fall back to JS.
    const tree = await parseWithWasm(files || []);
    self.postMessage(tree);
  } catch (err) {
    // Forward error; main thread will fallback
    self.postMessage({ error: String(err) });
  }
};
