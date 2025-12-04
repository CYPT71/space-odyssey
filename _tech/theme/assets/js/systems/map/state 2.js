const INITIAL_SCALE = 5e-5;

export const createMapState = ({ galaxyManager, shipGroup, shipControls }) => {
  const overlay = document.createElement('div');
  overlay.id = 'map-overlay';
  overlay.className = 'terminal-panel';
  overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        z-index: 9000;
        display: none;
        justify-content: center;
        align-items: center;
    `;
  document.body.appendChild(overlay);

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  overlay.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  const centerOnShip = (state) => {
    state.offset.x = -state.shipGroup.position.x * state.scale;
    state.offset.y = -state.shipGroup.position.z * state.scale;
    state.render();
  };

  const state = {
    galaxyManager,
    shipGroup,
    shipControls,
    overlay,
    canvas,
    ctx,
    isOpen: false,
    scale: INITIAL_SCALE,
    offset: { x: 0, y: 0 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    centerOnShip: () => centerOnShip(state),
    render: () => {},
  };

  const centerBtn = document.createElement('button');
  centerBtn.textContent = 'Center on Ship';
  centerBtn.style.cssText =
    'position:absolute;top:20px;right:20px;z-index:9001;padding:8px 12px;border:1px solid #00F0FF;background:rgba(0,20,40,0.85);color:#00F0FF;font-family:monospace;cursor:pointer;';
  centerBtn.addEventListener('click', () => {
    if (!state.isOpen) return;
    state.centerOnShip();
  });
  overlay.appendChild(centerBtn);

  return state;
};
