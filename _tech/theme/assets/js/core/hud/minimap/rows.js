import * as THREE from 'three';

const scratchVector = new THREE.Vector3();
const scratchVector2 = new THREE.Vector3();
const GALAXY_INDENT = 12;
const PLANET_INDENT_OFFSET = 18;

export function buildCategories(allObjects, shipPosition, deps) {
  const categories = { rootPlanets: [], gasClouds: [], nebulae: [], galaxies: [] };

  const isInsideGalaxy = (node) => {
    let p = node.parent;
    while (p) {
      if (p.userData?.isGalaxy) return true;
      p = p.parent;
    }
    return false;
  };

  for (let i = 0; i < allObjects.length; i++) {
    const obj = allObjects[i];
    const userData = obj.userData || {};
    if (!userData.planetData && !userData.galaxyData && !userData.cloudData && !userData.isNebula && !userData.isGasCloud) continue;

    obj.getWorldPosition(scratchVector);
    const dist = shipPosition.distanceTo(scratchVector);
    if (!isFinite(dist) || dist < 0) continue;

    let preferredName = deps.getObjectName(obj);
    const type = deps.getObjectType(userData);
    const icon = deps.getIconForType(type);
    if (type !== 'planet' && icon) preferredName = `${icon} ${preferredName}`;

    const baseRow = { obj, distance: dist, name: preferredName, uuid: obj.uuid };

    if (userData.isNebula) {
      categories.nebulae.push(baseRow);
    } else if (userData.isGasCloud || userData.cloudData) {
      categories.gasClouds.push(baseRow);
    } else if (userData.galaxyData || userData.isGalaxy) {
      categories.galaxies.push(baseRow);
    } else if (userData.planetData && !isInsideGalaxy(obj)) {
      categories.rootPlanets.push(baseRow);
    }
  }

  Object.values(categories).forEach((rows) => rows.sort((a, b) => a.distance - b.distance));
  return categories;
}

export function buildGalaxyRows(galaxies, shipPos, limitExpanded) {
  const rows = [];

  const traverseGalaxy = (group, level) => {
    group.getWorldPosition(scratchVector);
    const gDist = shipPos.distanceTo(scratchVector);
    const galaxyName = group.userData?.galaxyData?.name || 'Galaxy';
    const collapsed = !!window.minimapState.galaxyCollapse[group.uuid];

    rows.push({
      uuid: group.uuid,
      name: galaxyName,
      distance: gDist,
      indent: 6 + level * GALAXY_INDENT,
      hasCaret: true,
      caretSymbol: collapsed ? '▸' : '▾',
      onCaretClick: () => window.toggleGalaxy(group.uuid),
      style: { color: '#FF99FF' },
      obj: group,
    });

    if (window.minimapState.galaxiesCollapsed || collapsed) return;

    const directPlanets = group.children.filter((child) => child.userData && child.userData.planetData);
    const planetItems = directPlanets
      .map((planet) => {
        planet.getWorldPosition(scratchVector2);
        return {
          uuid: planet.uuid,
          name: planet.userData.planetData.title || planet.userData.planetData.name || 'Planet',
          distance: shipPos.distanceTo(scratchVector2),
          indent: 6 + level * GALAXY_INDENT + PLANET_INDENT_OFFSET,
          icon: '🌍',
          style: { color: '#00F0FF' },
          obj: planet,
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, window.minimapState.galaxiesCollapsed ? limitExpanded : limitExpanded);

    rows.push(...planetItems);

    const isImmediateSubGalaxy = (child, parent) => {
      let pointer = child.parent;
      while (pointer && pointer !== parent && !pointer.userData?.isGalaxy && pointer.userData?.objectType !== 'galaxy') {
        pointer = pointer.parent;
      }
      return pointer === parent;
    };

    group.traverse((child) => {
      if (child === group) return;
      const ud = child.userData || {};
      if ((ud.isGalaxy || ud.objectType === 'galaxy') && isImmediateSubGalaxy(child, group)) {
        traverseGalaxy(child, level + 1);
      }
    });
  };

  galaxies.forEach((galaxy) => traverseGalaxy(galaxy.group || galaxy, 0));
  return rows;
}

export function buildGasCloudRows(gasClouds, shipPos) {
  const cloudRows = [];
  gasClouds.forEach((cloud) => {
    const cloudData = cloud.userData?.cloudData || {};
    const postsCount = (cloudData.posts ? cloudData.posts.length : 0) +
      Object.values(cloudData.nebulae || {}).reduce((count, nebula) => count + (nebula.posts ? nebula.posts.length : 0), 0);
    const nameBase = cloud.userData?.cloudName || cloudData.name || cloud.userData?.categoryName || 'Gas Cloud';
    const displayName = postsCount ? `${nameBase} (${postsCount})` : nameBase;

    cloud.getWorldPosition(scratchVector);
    const cDist = shipPos.distanceTo(scratchVector);
    const collapsed = !!(window.minimapState.cloudCollapse && window.minimapState.cloudCollapse[cloud.uuid]);

    cloudRows.push({
      uuid: cloud.uuid,
      name: displayName,
      distance: cDist,
      indent: 6,
      hasCaret: true,
      caretSymbol: collapsed ? '▸' : '▾',
      onCaretClick: () => window.toggleCloud(cloud.uuid),
      style: { color: '#FF00FF' },
      obj: cloud,
    });

    if (window.minimapState.gasCollapsed || collapsed) return;

    cloud.traverse((child) => {
      if (child === cloud) return;
      if (child.userData?.isNebula) {
        const posts = Array.isArray(child.userData.posts) ? child.userData.posts.length : 0;
        const label = child.userData.nebulaName || child.userData.tagName || 'Nebula';
        const dist = shipPos.distanceTo(child.position);

        cloudRows.push({
          uuid: child.uuid,
          name: `${label} (${posts})`,
          distance: dist,
          indent: 18,
          icon: '✨',
          style: { color: '#FF88FF' },
          obj: child,
        });
      }
    });
  });

  return cloudRows;
}

export function buildOrphanNebulaRows(nebulae) {
  return nebulae.map((entry) => ({
    uuid: entry.obj.uuid,
    name: entry.name.replace('✨ ', ''),
    distance: entry.distance,
    icon: '✨',
    style: { color: '#FF88FF', paddingLeft: '12px' },
    obj: entry.obj,
  }));
}
