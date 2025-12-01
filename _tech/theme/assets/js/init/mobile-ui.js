import { isMobile } from '../utils/device.js';

export function initMobileUI() {
  const toggle = document.getElementById('mobile-known-toggle');
  const closeBtn = document.getElementById('mobile-known-close');
  if (toggle && closeBtn && isMobile()) {
    toggle.addEventListener('click', () => document.body.classList.add('mobile-known-open'));
    closeBtn.addEventListener('click', () => document.body.classList.remove('mobile-known-open'));
  }

  const fsBtn = document.getElementById('mobile-fullscreen');
  if (fsBtn && isMobile()) {
    fsBtn.addEventListener('click', () => {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
      if (req) req.call(el);
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    });
  } else if (fsBtn) {
    fsBtn.style.display = 'none';
  }

  const readerBtn = document.getElementById('reader-mode-toggle');
  if (readerBtn && isMobile()) {
    readerBtn.style.pointerEvents = 'auto';
  }
}
