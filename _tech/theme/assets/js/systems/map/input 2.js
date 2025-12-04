import { handleTargeting } from './targeting.js';

export const attachMapInputs = (state) => {
  const { canvas, overlay, centerOnShip } = state;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
      state.isOpen = !state.isOpen;
      overlay.style.display = state.isOpen ? 'flex' : 'none';
      if (state.isOpen) {
        centerOnShip();
        state.render();
      }
    } else if (e.key.toLowerCase() === 'c' && state.isOpen) {
      centerOnShip();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    state.isDragging = true;
    state.lastMouse = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mousemove', (e) => {
    if (state.isDragging) {
      const dx = e.clientX - state.lastMouse.x;
      const dy = e.clientY - state.lastMouse.y;
      state.offset.x += dx;
      state.offset.y += dy;
      state.lastMouse = { x: e.clientX, y: e.clientY };
      state.render();
    }
  });

  ['mouseup', 'mouseleave'].forEach((evt) => canvas.addEventListener(evt, () => { state.isDragging = false; }));

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const delta = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    state.scale *= delta;
    state.render();
  }, { passive: false });

  canvas.addEventListener('dblclick', (e) => handleTargeting(state, e));
};
