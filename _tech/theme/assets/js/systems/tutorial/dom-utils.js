const qs = (sel) => document.querySelector(sel);

const isMobile = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

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

export { qs, isMobile, getRect, placeBoxNear };
