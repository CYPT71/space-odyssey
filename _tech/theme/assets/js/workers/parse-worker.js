// Web Worker to parse file system into SpaceTree
import { parseSpaceTree } from '../domain/space-tree.js';

self.onmessage = (e) => {
  const { files } = e.data || {};
  try {
    const tree = parseSpaceTree(files || []);
    self.postMessage(tree);
  } catch (err) {
    // Forward error; main thread will fallback
    self.postMessage({ error: String(err) });
  }
};
