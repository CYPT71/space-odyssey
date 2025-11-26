/**
 * Simple tutorial/spotlight system with hitboxes
 */

const qs = (sel) => document.querySelector(sel);

function getRect(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function placeBoxNear(rect, box) {
  // Position tutorial box near highlight (below by default)
  const margin = 12;
  let x = rect.x + rect.w + margin;
  let y = rect.y;
  // Keep on screen
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bw = Math.min(340, vw - 24);
  box.style.maxWidth = bw + 'px';
  if (x + bw > vw - 12) x = Math.max(12, rect.x - bw - margin);
  if (y + box.offsetHeight > vh - 12) y = Math.max(12, vh - box.offsetHeight - 12);
  box.style.left = x + 'px';
  box.style.top = y + 'px';
}

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
    if (!el) { console.warn('Tutorial step target not found', s); return; }
    const rect = getRect(el);
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
    if (Array.isArray(s.keys) && s.keys.length) {
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
window.addEventListener('universeReady', () => {
  const first = !localStorage.getItem('tutorialSeen');
  if (!first) return;
  const tutorial = createTutorial();
  const steps = [
    {
      selector: '#hud-minimap',
      title: 'KNOWN OBJECTS',
      text: 'Liste des galaxies 🌌, poches de gaz 🌫️, nébuleuses ✨ et planètes 🌍. Cliquez pour téléporter.',
      terminal: 'ship@academy:~$ map --list\n- Galaxies 🌌\n- Gaz clouds 🌫️\n- Nebulae ✨\n- Planets 🌍\nTip: click any entry to warp.'
    },
    {
      selector: '#compass-bar',
      title: 'COMPASS',
      text: 'Indique les cibles visibles. La plus proche est surlignée.',
      terminal: 'ship@academy:~$ compass --tracking\nNearest target is highlighted. Keep it centered to intercept.'
    },
    {
      selector: '#controls-hint',
      title: 'PROPULSION AVANT',
      text: 'Appuie sur Z pour avancer.',
      keys: ['z'],
      terminal: 'ship@academy:~$ thrust --forward\nHold Z to accelerate forward.'
    },
    {
      selector: '#controls-hint',
      title: 'PROPULSION ARRIÈRE',
      text: 'Appuie sur S pour reculer.',
      keys: ['s'],
      terminal: 'ship@academy:~$ thrust --reverse\nHold S to brake or fly backward.'
    },
    {
      selector: '#controls-hint',
      title: 'YAW GAUCHE/DROITE',
      text: 'Q pour gauche, D pour droite.',
      keys: ['q','d'],
      terminal: 'ship@academy:~$ yaw --left/right\nQ = port turn\nD = starboard turn'
    },
    {
      selector: '#controls-hint',
      title: 'ASCENDRE/DESCENDRE',
      text: 'SPACE pour monter, SHIFT pour descendre.',
      keys: [' ', 'Shift'],
      terminal: 'ship@academy:~$ vertical --ascend/descend\nSPACE = ascend\nSHIFT = descend'
    },
    {
      selector: '#controls-hint',
      title: 'STOP D’URGENCE',
      text: 'Appuie sur C pour arrêt immédiat.',
      keys: ['c'],
      terminal: 'ship@academy:~$ emergency-stop\nPress C to zero velocity now.'
    },
    {
      selector: '#warp-boost',
      title: 'WARP BOOST',
      text: 'Active le warp pour un saut rapide (bouton ou maintenir vitesse). Clique sur le bouton pour continuer.',
      terminal: 'ship@academy:~$ warp --engage\nClick the ⚡ button or build speed to jump.'
    },
  ];
  tutorial.open(steps);
  localStorage.setItem('tutorialSeen', '1');
});

// Loading overlay helpers
export function showLoading() {
  const el = qs('#loading-overlay');
  if (el) el.classList.remove('hidden');
}
export function hideLoading() {
  const el = qs('#loading-overlay');
  if (el) el.classList.add('hidden');
}
