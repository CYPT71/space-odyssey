import { createMapState } from './map/state.js';
import { attachMapInputs } from './map/input.js';
import { renderMap } from './map/render.js';

export function createMapSystem(systems) {
  const state = createMapState(systems);
  state.render = () => renderMap(state);
  attachMapInputs(state);

  return {
    toggle: () => {
      state.isOpen = !state.isOpen;
      state.overlay.style.display = state.isOpen ? 'flex' : 'none';
      if (state.isOpen) state.render();
    },
  };
}
