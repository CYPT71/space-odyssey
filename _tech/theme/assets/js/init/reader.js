import { getSiteConfig } from './config.js';
import { getPage, setPage } from './content-cache.js';
import { renderCards } from '../reader/render-cards.js';
import { loadPageContent } from './content-loader.js';

let overlay, contentEl, searchEl, cardsEl;

const loadContent = async (url) => {
  if (!contentEl) return;
  contentEl.innerHTML = 'Loading…';
  const cached = await getPage(url);
  if (cached) contentEl.innerHTML = cached;
  try {
    const html = await loadPageContent(url);
    // If IndexedDB stored stripped text, render as-is; otherwise parse HTML
    if (html && html.trim().startsWith('<')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const body = doc.querySelector('main') || doc.querySelector('article') || doc.body;
      const markup = body ? body.innerHTML : html;
      contentEl.innerHTML = markup;
      setPage(url, markup);
    } else {
      contentEl.textContent = html || 'No content';
      setPage(url, html || '');
    }
  } catch (_) {
    if (!cached) contentEl.innerHTML = 'Failed to load content.';
  }
};

const openOverlay = () => {
  overlay.classList.remove('hidden');
  document.body.classList.add('reader-mode');
  overlay.scrollTo({ top: 0 });
};
const closeOverlay = () => {
  overlay.classList.add('hidden');
  document.body.classList.remove('reader-mode');
};

export async function initReader(providedCfg = null) {
  overlay = document.getElementById('reading-overlay');
  contentEl = document.getElementById('reading-content');
  searchEl = document.getElementById('reader-search');
  cardsEl = document.getElementById('reader-cards');
  const openBtn = document.getElementById('reader-mode-toggle');
  const closeBtn = document.getElementById('reading-close');
  const backBtn = document.getElementById('reading-back');
  const cfg = providedCfg || await getSiteConfig();
  if (!overlay || !contentEl || !openBtn) return;

  const renderList = () => {
    if (!cardsEl) return;
    renderCards(cardsEl, cfg.fileSystem || [], searchEl?.value || '', (url) => {
      openOverlay();
      loadContent(url);
    });
  };

  openBtn.addEventListener('click', () => {
    if (overlay.classList.contains('hidden')) {
      openOverlay();
      renderList();
    } else {
      closeOverlay();
    }
  });
  closeBtn?.addEventListener('click', closeOverlay);
  backBtn?.addEventListener('click', (e) => { e.preventDefault(); renderList(); });
  searchEl?.addEventListener('input', renderList);

  // Load current page content initially
  loadContent(window.location.pathname);
}

export const loadIntoReader = (url) => {
  if (!overlay) return;
  openOverlay();
  loadContent(url);
};
