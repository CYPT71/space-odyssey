import { loadIntoReader } from './reader.js';

export function initNav(fileSystem) {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks || !Array.isArray(fileSystem)) return;
  const mainNavUrls = ['/', '/about/', '/experience/', '/projects/'];
  const navLabels = {
    '/': 'DASHBOARD',
    '/about/': 'PROFILE',
    '/experience/': 'LOGS',
    '/projects/': 'CONSTELLATIONS'
  };

  mainNavUrls.forEach(url => {
    const page = fileSystem.find(p => p.url === url);
    if (!page) return;
    const link = document.createElement('a');
    link.href = url;
    link.className = 'nav-link';
    link.textContent = `[${navLabels[url]}]`;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      loadIntoReader(url);
    });
    navLinks.appendChild(link);
  });
}
