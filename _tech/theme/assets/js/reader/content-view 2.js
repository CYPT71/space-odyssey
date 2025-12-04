import { getPage, setPage } from '../init/content-cache.js';
import { loadPageContent } from '../init/content-loader.js';
import { parseHtml } from '../utils/html-parser.js';

const interceptLinksInline = (container, onInternal) => {
  if (!container) return;
  const links = container.querySelectorAll('a[href]');
  links.forEach(link => {
    const raw = link.getAttribute('href');
    if (!raw || raw.startsWith('http') || raw.startsWith('#')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      onInternal(raw);
    }, { passive: false });
  });
};

export const createContentLoader = (contentEl, overlay) => {
  return async function loadContent(url) {
    if (!contentEl) return;
    contentEl.innerHTML = 'Loading…';
    const cached = await getPage(url);
    if (cached) contentEl.innerHTML = cached;
    overlay?.classList.add('content-only');
    try {
      const html = await loadPageContent(url);
      if (html && html.trim().startsWith('<')) {
      const doc = parseHtml(html);
        const body = doc.querySelector('main') || doc.querySelector('article') || doc.body;
        const markup = body ? body.innerHTML : html;
        contentEl.innerHTML = markup;
        setPage(url, markup);
        interceptLinksInline(contentEl, (u) => loadContent(u));
      } else {
        contentEl.textContent = html || 'No content';
        setPage(url, html || '');
      }
    } catch (error) {
      console.warn('Content load failed', error);
      if (!cached) contentEl.innerHTML = 'Failed to load content.';
    }
  };
};
