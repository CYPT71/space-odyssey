// Utilities for handling space objects consistently across systems
import { OBJECT_TYPES } from '../config/types.js';

export const getObjectType = (ud = {}) => {
  if (ud.planetData) return OBJECT_TYPES.PLANET;
  if (ud.isNebula) return OBJECT_TYPES.NEBULA;
  if (ud.isGasCloud || ud.cloudData) return OBJECT_TYPES.GAS_CLOUD;
  if (ud.galaxyData || ud.isGalaxy) return OBJECT_TYPES.GALAXY;
  return 'unknown';
};

export const getObjectName = (obj) => {
  const ud = obj?.userData || {};
  const type = getObjectType(ud);
  switch (type) {
    case OBJECT_TYPES.PLANET:
      return ud.planetData?.title || ud.planetData?.name || 'Planet';
    case OBJECT_TYPES.NEBULA:
      return ud.nebulaName || ud.tagName || 'Nebula';
    case OBJECT_TYPES.GAS_CLOUD:
      return ud.cloudName || ud.categoryName || ud.cloudData?.name || 'Gas Cloud';
    case OBJECT_TYPES.GALAXY:
      return ud.galaxyName || ud.galaxyData?.name || 'Galaxy';
    default:
      return 'Object';
  }
};

export const getIconForType = (type) => {
  if (type === 'planet') return '🌍';
  if (type === 'galaxy') return '🌌';
  if (type === 'gasCloud') return '🌫️';
  if (type === 'nebula') return '✨';
  return '';
};

export const getLabeledName = (obj) => {
  const ud = obj?.userData || {};
  const type = getObjectType(ud);
  const name = getObjectName(obj);
  const icon = getIconForType(type);
  return icon ? `${icon} ${name}` : name;
};

export const getDetectionRange = (type) => {
  const DETECTION_RANGE = {
    planet: 2000000,
    galaxy: 50000000,
    gasCloud: 50000000, // widened for easier targeting
    nebula: 50000000,    // widened for easier targeting
    default: 50000000
  };
  return DETECTION_RANGE[type] || DETECTION_RANGE.default;
};

// Scene graph helpers
export const isGalaxyNode = (obj) => !!(obj && obj.userData && (obj.userData.isGalaxy || obj.userData.objectType === 'galaxy' || obj.userData.galaxyData));
export const isNebulaNode = (obj) => !!(obj && obj.userData && obj.userData.isNebula);

// Returns true if "node" belongs directly (first ancestor of given type) under "parent"
export const isImmediateChildOfType = (node, parent, typeCheck) => {
  let p = node && node.parent;
  while (p && p !== parent && !typeCheck(p)) {
    p = p.parent;
  }
  return p === parent;
};
