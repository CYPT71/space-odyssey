/**
 * Simple tutorial/spotlight system with hitboxes
 */

import { getRect, isMobile, placeBoxNear, qs } from './tutorial/dom-utils';
import { wireDefaultTutorial } from './tutorial/wire-default';

export function createTutorial() {
  const overlay = qs('#tutorial-overlay');
  const highlight = qs('.tutorial-highlight');
  const title = qs('#tutorial-title');
  const text = qs('#tutorial-text');
  const terminal = qs('#tutorial-terminal');
  const box = qs('.tutorial-box');
  const btnPrev = qs('#tutorial-prev');
  const btnNext = qs('#tutorial-next');
  const btnClose = qs('#tutorial-close');

  let steps = [];
  let idx = 0;

  let keyListener = null;

  function clearGate() {
    if (keyListener) {
      window.removeEventListener('keydown', keyListener);
      keyListener = null;
    }
  }

  function showStep(i) {
    idx = Math.max(0, Math.min(i, steps.length - 1));
    const s = steps[idx];
    const el = typeof s.selector === 'string' ? qs(s.selector) : s.element;
    if (!el) {
      console.warn('Tutorial step target not found', s);
      if (idx < steps.length - 1) return showStep(idx + 1);
      return;
    }
    const rect = getRect(el);
    if (!rect.w && !rect.h) {
      // Skip hidden items (mobile HUD elements, etc.)
      if (idx < steps.length - 1) return showStep(idx + 1);
      return;
    }
    highlight.style.left = rect.x + 'px';
    highlight.style.top = rect.y + 'px';
    highlight.style.width = rect.w + 'px';
    highlight.style.height = rect.h + 'px';
    title.textContent = s.title || 'Info';
    text.textContent = s.text || '';
    if (terminal) {
      terminal.textContent = (s.terminal || s.text || '').trim();
    }
    // Place info box after browser lays out
    requestAnimationFrame(() => placeBoxNear(rect, box));
    btnPrev.disabled = idx === 0;
    btnNext.textContent = idx === steps.length - 1 ? 'Finish' : 'Next ▶';

    // Gate: wait for controls if step requires keys
    clearGate();
    if (Array.isArray(s.keys) && s.keys.length && !isMobile()) {
      btnNext.disabled = true;
      keyListener = (e) => {
        const k = e.key.toLowerCase();
        if (s.keys.map(x => x.toLowerCase()).includes(k)) {
          btnNext.disabled = false;
          clearGate();
        }
      };
      window.addEventListener('keydown', keyListener);
    } else {
      btnNext.disabled = false;
    }
  }

  function open(tutorialSteps) {
    steps = tutorialSteps || [];
    if (!steps.length) return;
    overlay.classList.remove('hidden');
    showStep(0);
  }

  function close() { overlay.classList.add('hidden'); }

  btnPrev?.addEventListener('click', () => showStep(idx - 1));
  btnNext?.addEventListener('click', () => {
    if (idx < steps.length - 1) showStep(idx + 1); else close();
  });
  btnClose?.addEventListener('click', close);

  window.addEventListener('resize', () => showStep(idx));

  return { open, close };
}

// Auto-wire with space-scene events
wireDefaultTutorial(createTutorial);

// Loading overlay helpers
export function showLoading() {
  const el = qs('#loading-overlay');
  if (el) el.classList.remove('hidden');
}
export function hideLoading() {
  const el = qs('#loading-overlay');
  if (el) el.classList.add('hidden');
}
