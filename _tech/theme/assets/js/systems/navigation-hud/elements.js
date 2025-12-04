const createHudLayer = (container) => {
    let hudLayer = document.getElementById('hud-layer');
    if (!hudLayer) {
        hudLayer = document.createElement('div');
        hudLayer.id = 'hud-layer';
        hudLayer.style.position = 'absolute';
        hudLayer.style.top = '0';
        hudLayer.style.left = '0';
        hudLayer.style.width = '100%';
        hudLayer.style.height = '100%';
        hudLayer.style.pointerEvents = 'none';
        hudLayer.style.overflow = 'hidden';
        hudLayer.style.zIndex = '10';
        container.appendChild(hudLayer);
    }
    return hudLayer;
};

const createCenterArrow = (hudLayer) => {
    const centerArrow = document.createElement('div');
    centerArrow.className = 'nav-center-arrow';
    centerArrow.style.position = 'absolute';
    centerArrow.style.left = '50%';
    centerArrow.style.top = '50%';
    centerArrow.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    centerArrow.style.width = '0';
    centerArrow.style.height = '0';
    centerArrow.style.borderLeft = '12px solid transparent';
    centerArrow.style.borderRight = '12px solid transparent';
    centerArrow.style.borderBottom = '20px solid #FF0000';
    centerArrow.style.zIndex = '11';
    hudLayer.appendChild(centerArrow);
    return centerArrow;
};

const createNearestArrow = (hudLayer) => {
    const nearestArrow = document.createElement('div');
    nearestArrow.className = 'nav-nearest-arrow';
    nearestArrow.style.position = 'absolute';
    nearestArrow.style.left = '50%';
    nearestArrow.style.top = '50%';
    nearestArrow.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    nearestArrow.style.width = '0';
    nearestArrow.style.height = '0';
    nearestArrow.style.borderLeft = '14px solid transparent';
    nearestArrow.style.borderRight = '14px solid transparent';
    nearestArrow.style.borderBottom = '24px solid #00F0FF';
    nearestArrow.style.zIndex = '12';
    nearestArrow.style.opacity = '0.7';
    nearestArrow.style.pointerEvents = 'none';
    hudLayer.appendChild(nearestArrow);
    return nearestArrow;
};

const createWaypointElement = (hudLayer) => {
    const el = document.createElement('div');
    el.className = 'nav-waypoint';
    el.innerHTML = `
        <div class="nav-arrow"></div>
        <div class="nav-info">
            <span class="nav-name">Unknown</span>
            <span class="nav-dist">0km</span>
        </div>
    `;

    el.style.position = 'absolute';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.transition = 'opacity 0.2s';

    const arrow = el.querySelector('.nav-arrow');
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '10px solid transparent';
    arrow.style.borderRight = '10px solid transparent';
    arrow.style.borderBottom = '15px solid #00F0FF';
    arrow.style.marginBottom = '5px';

    const info = el.querySelector('.nav-info');
    info.style.background = 'rgba(0, 20, 40, 0.8)';
    info.style.border = '1px solid #00F0FF';
    info.style.padding = '4px 8px';
    info.style.borderRadius = '4px';
    info.style.fontFamily = 'monospace';
    info.style.fontSize = '12px';
    info.style.color = '#00F0FF';
    info.style.textAlign = 'center';
    info.style.textShadow = '0 0 5px #00F0FF';

    hudLayer.appendChild(el);
    return el;
};

export {
    createCenterArrow,
    createHudLayer,
    createNearestArrow,
    createWaypointElement
};
