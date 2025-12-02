import { getSiteConfig } from './config.js';
import { renderCards } from '../reader/render-cards.js';
import { createContentLoader } from '../reader/content-view.js';

let overlay, contentEl, searchEl, cardsEl, panel;
let renderListRef = null;
let openedFromReaderButton = false;


let loadContent;

const openOverlay = () => {
  overlay.classList.remove('hidden');
  document.body.classList.add('reader-mode');
  overlay.scrollTo({ top: 0 });
};
const closeOverlay = () => {
  overlay.classList.add('hidden');
  document.body.classList.remove('reader-mode');
  overlay.classList.remove('content-only');
};

export async function initReader(providedCfg = null) {
  overlay = document.getElementById('reading-overlay');
  contentEl = document.getElementById('reading-content');
  searchEl = document.getElementById('reader-search');
  cardsEl = document.getElementById('reader-cards');
  loadContent = createContentLoader(contentEl, overlay);
  const openBtn = document.getElementById('reader-mode-toggle');
  const closeBtn = document.getElementById('reading-close');
  const backBtn = document.getElementById('reading-back');
  const panelToggle = document.getElementById('reader-panel-toggle');
  panel = document.getElementById('reader-panel');
  const cfg = providedCfg || await getSiteConfig();
  if (!overlay || !contentEl || !openBtn) return;

  const preventZoom = (event) => {
    if (event.touches && event.touches.length > 1) {
      event.preventDefault();
    }
  };
  const preventGesture = (event) => event.preventDefault();
  const handleTouchEnd = (event) => {
    const now = Date.now();
    if (now - (overlay.dataset.lastTouchEnd || 0) < 300) {
      event.preventDefault();
    }
    overlay.dataset.lastTouchEnd = now;
  };
  overlay.addEventListener('touchstart', preventZoom, { passive: false });
  overlay.addEventListener('touchmove', preventZoom, { passive: false });
  overlay.addEventListener('touchend', handleTouchEnd, { passive: false });
  document.addEventListener('gesturestart', preventGesture, { passive: false });

  const preventSelection = (e) => {
    if (!overlay.classList.contains('content-only')) {
      e.preventDefault();
    }
  };
  overlay.addEventListener('selectstart', preventSelection);

  const renderList = () => {
    if (!cardsEl) return;
    if (contentEl) {
      contentEl.style.display = 'none';
      contentEl.innerHTML = '';
    }
    if (panel) panel.classList.remove('collapsed');
    overlay?.classList.remove('content-only');
    renderCards(cardsEl, cfg.fileSystem || [], searchEl?.value || '', (url) => {
      openOverlay();
      if (panel && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        panel.classList.add('collapsed');
      }
      if (contentEl) contentEl.style.display = 'block';
      loadContent(url);
    });
  };
  renderListRef = renderList;

  openBtn.addEventListener('click', () => {
    openedFromReaderButton = true;
    if (overlay.classList.contains('hidden')) {
      // Open directly into current page content; library accessible via toggle
      loadIntoReader(window.location.pathname);
    } else {
      closeOverlay();
    }
  });
  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (openedFromReaderButton) {
      // If the session was started via the Reader button, bounce back to the library list
      renderList();
      openedFromReaderButton = false;
    }
    closeOverlay();
  });
  backBtn?.addEventListener('click', (e) => { e.preventDefault(); renderList(); });
  searchEl?.addEventListener('input', renderList);
  panelToggle?.addEventListener('click', () => {
    if (!panel) return;
    const collapsed = panel.classList.toggle('collapsed');
    if (collapsed && cardsEl) cardsEl.innerHTML = '';
    // On mobile, tapping Library while overlay is hidden should open it
    if (overlay.classList.contains('hidden')) {
      openOverlay();
      if (renderListRef) renderListRef();
    }
  });

  // Load current page content initially
  renderList();

  // Intercept links inside the overlay to keep navigation IDB-only
  overlay.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    e.preventDefault();
    loadIntoReader(href);
  });
}

export const loadIntoReader = (url) => {
  if (!overlay) return;
  openOverlay();
  overlay.classList.add('content-only');
  if (panel && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    panel.classList.add('collapsed');
  }
  if (contentEl) contentEl.style.display = 'block';
  loadContent(url);
};

// Allow other modules (known objects, keyboard) to open the reader list
export const openReader = () => {
  if (!overlay) return;
  openOverlay();
   overlay.classList.remove('content-only');
  if (renderListRef) renderListRef();
};

// Optional global hook for simple access
window.openReader = openReader;
