/**
 * Minimal parser structure test (run with `node _tech/tests/parser-structure.test.js`)
 * Ensures nested galaxies and gas clouds are built correctly.
 */
import { parseSpaceTree } from '../theme/assets/js/domain/space-tree.js';

const assert = (cond, msg) => {
  if (!cond) {
    throw new Error(msg);
  }
};

const sampleFiles = [
  // Pages (galaxies)
  { path: '_pages/root.md', url: '/root' },
  { path: '_pages/a/b/c.md', url: '/a/b/c' },
  { path: '_pages/a/b/d.md', url: '/a/b/d' },
  // Posts (gas clouds)
  { path: '_posts/devops/2024-01-01-alpha.md', url: '/posts/devops/2024-01-01-alpha' },
  { path: '_posts/devops/cluster/2024-01-02-beta.md', url: '/posts/devops/cluster/2024-01-02-beta' },
  { path: '_posts/tech/tutorials/2024-01-03-gamma.md', url: '/posts/tech/tutorials/2024-01-03-gamma' }
];

describe('Parser structure', () => {
    test('builds galaxies and gas clouds', () => {
        const tree = parseSpaceTree(sampleFiles);

        // Galaxy assertions
        assert(tree.root.galaxies.a, 'Galaxy "a" missing');
        assert(tree.root.galaxies.a.subGalaxies.b, 'Sub-galaxy "a/b" missing');
        assert(tree.root.galaxies.a.subGalaxies.b.files.length === 2, 'Files in a/b incorrect');

        // Gas cloud assertions
        assert(tree.posts.gasClouds.devops, 'Gas cloud "devops" missing');
        assert(tree.posts.gasClouds.devops.nebulae.cluster, 'Sub-nebula "cluster" missing under devops');
        assert(tree.posts.gasClouds.tech.nebulae.tutorials, 'Sub-nebula "tutorials" missing under tech');
        assert(tree.posts.gasClouds.devops.name === 'devops', 'cloudName mismatch');
        assert(tree.posts.gasClouds.devops.isNebula === true, 'isNebula flag missing');
        assert(tree.root.galaxies.a.isGalaxy === true, 'isGalaxy flag missing on galaxies');
    });
});
