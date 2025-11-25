import { parseFileSystem } from './theme/assets/js/galaxy/parser.js';

const mockFiles = [
    { path: '/index.md', name: 'index.md' },
    { path: '/about.md', name: 'about.md' },
    { path: '/_posts/post1.md', name: 'post1.md' },
    { path: '/posts/post2.md', name: 'post2.md' }
];

console.log(JSON.stringify(parseFileSystem(mockFiles), null, 2));
