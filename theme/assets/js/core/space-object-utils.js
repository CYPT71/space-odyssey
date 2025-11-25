// Utilities for handling space objects consistently across systems

export const getObjectType = (ud = {}) => {
  if (ud.planetData) return 'planet';
  if (ud.isNebula) return 'nebula';
  if (ud.isGasCloud || ud.cloudData) return 'gasCloud';
  if (ud.galaxyData || ud.isGalaxy) return 'galaxy';
  return 'unknown';
};

export const getObjectName = (obj) => {
  const ud = obj?.userData || {};
  const type = getObjectType(ud);
  switch (type) {
    case 'planet':
      return ud.planetData?.title || ud.planetData?.name || 'Planet';
    case 'nebula':
      return ud.tagName || 'Nebula';
    case 'gasCloud':
      return ud.categoryName || ud.cloudData?.name || 'Gas Cloud';
    case 'galaxy':
      return ud.galaxyData?.name || 'Galaxy';
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
    planet: 500000,
    galaxy: 1500000,
    gasCloud: 5000000,
    nebula: 3000000,
    default: 1000000
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
