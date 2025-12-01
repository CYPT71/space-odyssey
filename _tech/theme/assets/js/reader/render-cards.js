import { getPage, setPage } from '../init/content-cache.js';
import { loadPageContent } from '../init/content-loader.js';

const sectionOf = (entry) => {
  const raw = entry.path || entry.dir || '';
  if (raw.startsWith('content/')) {
    const parts = raw.replace(/^content\/?/, '').split('/');
    return parts.find(p => p && !p.startsWith('_')) || 'Content';
  }
  return 'Site';
};

const textPreview = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return (tmp.textContent || '').trim().split('\n').filter(Boolean).slice(0, 3).join(' ') || 'No preview available.';
};

export async function renderCards(container, entries = [], query = '', onOpen = () => {}) {
  if (!container) return;
  const q = (query || '').toLowerCase();
  container.innerHTML = '';
  const filtered = entries
    .filter(p => !q || (p.title || '').toLowerCase().includes(q) || (p.url || '').toLowerCase().includes(q))
    .slice(0, 400);
  const grouped = filtered.reduce((acc, entry) => {
    const sec = sectionOf(entry);
    (acc[sec] = acc[sec] || []).push(entry);
    return acc;
  }, {});
  const sections = Object.keys(grouped);
  if (!sections.length) {
    const empty = document.createElement('div');
    empty.className = 'reader-card';
    empty.textContent = 'No transmissions match your search.';
    container.appendChild(empty);
    return;
  }

  sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'reader-section';
    secEl.innerHTML = `<div class="reader-section-title">${sec}</div>`;
    const grid = document.createElement('div');
    grid.className = 'reader-section-grid';
    secEl.appendChild(grid);

    grouped[sec].forEach(entry => {
      const card = document.createElement('div');
      card.className = 'reader-card';
      card.innerHTML = `
        <div class="reader-card-head">
          <div class="reader-card-title">${entry.title || entry.name || 'Untitled'}</div>
          <div class="reader-card-meta">${entry.url}</div>
        </div>
        <div class="reader-card-snippet">Loading preview…</div>
        <div class="reader-card-actions">
          <button class="reader-open" data-url="${entry.url}">OPEN</button>
        </div>
      `;
      const snippetEl = card.querySelector('.reader-card-snippet');
      const hydrate = async () => {
        const cached = await getPage(entry.url);
        if (cached) {
          snippetEl.textContent = textPreview(cached);
          return;
        }
        try {
          const html = await loadPageContent(entry.url);
          snippetEl.textContent = textPreview(html);
          setPage(entry.url, html);
        } catch (_) {
          snippetEl.textContent = 'No preview available.';
        }
      };
      hydrate();
      grid.appendChild(card);
    });

    container.appendChild(secEl);
  });

  container.addEventListener('click', (e) => {
    const openBtn = e.target.closest('.reader-open');
    if (openBtn) {
      e.preventDefault();
      onOpen(openBtn.dataset.url);
    }
  });
}
