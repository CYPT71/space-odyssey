import { createState, toggleMinimapSection, toggleGalaxyCollapse, toggleCloudCollapse } from './minimap-state.js';
import { ensureSearchInput, ensureToggleButton, buildSearchFilter } from './minimap/search-ui.js';
import { renderCategory, syncItems } from './minimap/dom-sync.js';
import { buildCategories, buildGalaxyRows, buildGasCloudRows, buildOrphanNebulaRows } from './minimap/rows.js';
import { isMobile } from '../../utils/device.js';
import { formatDistance } from './formatters.js';
import { getObjectName, getObjectType, getIconForType } from '../space-object-utils.js';

const FRAME_SKIP = 30;
const LIMIT_COLLAPSED = 8;
const LIMIT_EXPANDED = 100;

/**
 * Update minimap UI; throttled for performance.
 * Globals kept for backward compatibility: window.minimapState, window.minimapSearchTerm, window.toggle*
 * @param {THREE.Object3D} shipGroup
 * @param {Object} galaxyManager
 * @param {number} frameCount
 * @param {Object} deps injected optional overrides
 */
export function updateMinimap(shipGroup, galaxyManager, frameCount, deps = {}) {
  if (frameCount % FRAME_SKIP !== 0) return;

  const minimapList = document.getElementById('minimap-list');
  const hudMinimap = document.getElementById('hud-minimap');
  if (!minimapList || !hudMinimap) return;

  const injected = {
    isMobile: deps.isMobile || isMobile,
    formatDistance: deps.formatDistance || formatDistance,
    getObjectName: deps.getObjectName || getObjectName,
    getObjectType: deps.getObjectType || getObjectType,
    getIconForType: deps.getIconForType || getIconForType,
  };

  ensureSearchInput(hudMinimap, minimapList, injected);
  ensureToggleButton(hudMinimap);

  const rawTerm = window.minimapSearchTerm || '';
  const filter = buildSearchFilter(rawTerm, injected);
  const isExpanded = hudMinimap.classList.contains('expanded');
  const limit = isExpanded ? LIMIT_EXPANDED : LIMIT_COLLAPSED;

  window.minimapState = window.minimapState || createState();
  window.toggleMinimap = toggleMinimapSection;
  window.toggleGalaxy = toggleGalaxyCollapse;
  window.toggleCloud = toggleCloudCollapse;

  const shipPos = shipGroup.position;
  const categories = buildCategories(galaxyManager.getAllObjects(), shipPos, injected);
  const galaxyRows = buildGalaxyRows(galaxyManager.getGalaxies() || [], shipPos, limit);
  const gasRows = buildGasCloudRows(galaxyManager.getGasClouds ? galaxyManager.getGasClouds() : [], shipPos);
  const orphanNebulaRows = buildOrphanNebulaRows(categories.nebulae);

  [
    { id: 'galaxies', rows: galaxyRows, title: '🌌 Galaxies', color: '#FF00FF', toggleKey: 'galaxies', collapsed: !!window.minimapState.galaxiesCollapsed },
    { id: 'planets', rows: categories.rootPlanets, title: '🌍 Planets', color: '#00F0FF', toggleKey: 'planets', collapsed: !!window.minimapState.planetsCollapsed },
    { id: 'gas', rows: gasRows, title: '🌫️ Gas Clouds', color: '#00FF88', toggleKey: 'gas', collapsed: !!window.minimapState.gasCollapsed },
    { id: 'nebulae', rows: orphanNebulaRows, title: '✨ Nebulae', color: '#FF88FF', toggleKey: 'nebulae', collapsed: !!window.minimapState.nebulaCollapsed },
  ].forEach((category) => {
    const filteredRows = category.rows.filter((row) => filter(row.name));
    renderCategory({
      minimapList,
      rows: filteredRows,
      idSuffix: category.id,
      title: category.title,
      color: category.color,
      isCollapsed: category.collapsed,
      toggleKey: category.toggleKey,
      limit,
      syncItems,
      deps: injected,
    });
  });
}
