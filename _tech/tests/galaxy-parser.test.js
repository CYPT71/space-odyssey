/**
 * @fileoverview Unit Tests for Galaxy Parser
 * @author CYPT71
 */

import { isContentFile, parseFileSystem } from '../../theme/assets/js/galaxy/parser.js';

describe('Galaxy Parser', () => {
    describe('isContentFile', () => {
        test('should accept markdown files in /', () => {
            expect(isContentFile('/index.md')).toBe(true);
            expect(isContentFile('/about.md')).toBe(true);
        });

        test('should accept markdown files in / subdirectories', () => {
            expect(isContentFile('/_posts/post1.md')).toBe(true);
            expect(isContentFile('/projects/project1.md')).toBe(true);
        });

        test('should reject files not in /', () => {
            expect(isContentFile('index.md')).toBe(false);
            expect(isContentFile('about.md')).toBe(false);
            expect(isContentFile('theme/assets/js/main.js')).toBe(false);
        });

        test('should reject non-markdown files', () => {
            expect(isContentFile('/image.png')).toBe(false);
            expect(isContentFile('/style.css')).toBe(false);
        });

        test('should reject technical directories', () => {
            expect(isContentFile('_site/index.html')).toBe(false);
            expect(isContentFile('theme/assets/js/main.js')).toBe(false);
            expect(isContentFile('node_modules/package/index.js')).toBe(false);
        });
    });

    describe('parseFileSystem', () => {
        test('should create root planets for files in /', () => {
            const files = [
                { path: '/index.md', name: 'index.md', title: 'Home' },
                { path: '/about.md', name: 'about.md', title: 'About' }
            ];

            const tree = parseFileSystem(files);

            expect(tree.root.files).toHaveLength(2);
            expect(tree.root.files[0].name).toBe('index.md');
        });

        test('should create galaxies for subdirectories in /', () => {
            const files = [
                { path: '/_posts/post1.md', name: 'post1.md', title: 'Post 1' },
                { path: '/_posts/post2.md', name: 'post2.md', title: 'Post 2' }
            ];

            const tree = parseFileSystem(files);

            expect(tree.root.galaxies.posts).toBeDefined();
            expect(tree.root.galaxies.posts.files).toHaveLength(2);
        });

        test('should ignore files outside /', () => {
            const files = [
                { path: 'index.md', name: 'index.md' },
                { path: 'theme/assets/js/main.js', name: 'main.js' },
                { path: '/valid.md', name: 'valid.md' }
            ];

            const tree = parseFileSystem(files);

            expect(tree.root.files).toHaveLength(1);
            expect(tree.root.files[0].name).toBe('valid.md');
        });

        test('should handle nested subdirectories', () => {
            const files = [
                { path: '/_posts/2024/post.md', name: 'post.md' }
            ];

            const tree = parseFileSystem(files);

            expect(tree.root.galaxies.posts).toBeDefined();
            expect(tree.root.galaxies.posts.subGalaxies['2024']).toBeDefined();
        });

        test('should return empty tree for no valid files', () => {
            const files = [
                { path: 'theme/main.js', name: 'main.js' },
                { path: '_site/index.html', name: 'index.html' }
            ];

            const tree = parseFileSystem(files);

            expect(tree.root.files).toHaveLength(0);
            expect(Object.keys(tree.root.galaxies)).toHaveLength(0);
        });
    });
});
