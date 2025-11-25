/**
 * @fileoverview HUD Utilities Module
 * @author CYPT71
 * @description Helper functions for HUD updates (minimap, compass)
 */

import * as THREE from 'three';
import { getObjectName, getObjectType, getIconForType } from './space-object-utils.js';

const scratchVector = new THREE.Vector3();
const scratchVector2 = new THREE.Vector3();

/**
 * Updates the minimap display
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} galaxyManager - Galaxy manager
 * @param {number} frameCount - Current frame count for throttling
 */
export function updateMinimap(shipGroup, galaxyManager, frameCount) {
    // Throttle DOM updates to reduce flicker
    if (frameCount % 30 !== 0) return;

    const minimapList = document.getElementById('minimap-list');
    if (!minimapList) return;

    // Check if toggle button exists
    let toggleBtn = document.getElementById('minimap-toggle');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'minimap-toggle';
        toggleBtn.innerHTML = '⤢';
        toggleBtn.onclick = () => {
            const hud = document.getElementById('hud-minimap');
            hud.classList.toggle('expanded');
            toggleBtn.innerHTML = hud.classList.contains('expanded') ? '⤡' : '⤢';
        };
        document.getElementById('hud-minimap').appendChild(toggleBtn);
    }

    const isExpanded = document.getElementById('hud-minimap').classList.contains('expanded');
    // Collapsible state with persistence
    const loadState = () => {
        try { const raw = localStorage.getItem('minimapState'); return raw ? JSON.parse(raw) : null; } catch { return null; }
    };
    const saveState = (st) => { try { localStorage.setItem('minimapState', JSON.stringify(st)); } catch {} };
    window.minimapState = window.minimapState || loadState() || { galaxiesCollapsed: false, gasCollapsed: false, galaxyCollapse: {}, cloudCollapse: {} };
    window.minimapState.galaxyCollapse = window.minimapState.galaxyCollapse || {};
    window.minimapState.cloudCollapse = window.minimapState.cloudCollapse || {};
    window.toggleMinimap = (section) => {
        const key = section === 'galaxies' ? 'galaxiesCollapsed' : 'gasCollapsed';
        window.minimapState[key] = !window.minimapState[key];
        saveState(window.minimapState);
    };
    window.toggleGalaxy = (uuid) => {
        const map = window.minimapState.galaxyCollapse;
        map[uuid] = !map[uuid];
        saveState(window.minimapState);
    };
    window.toggleCloud = (uuid) => {
        const map = window.minimapState.cloudCollapse;
        map[uuid] = !map[uuid];
        saveState(window.minimapState);
    };
    const allObjects = galaxyManager.getAllObjects();
    const quantize = (d) => Math.round(d / 1000) * 1000;
    const shipPos = shipGroup.position;

    // Categorize non-galaxy objects here; galaxies handled separately to nest planets
    const categories = {
        rootPlanets: [],
        gasClouds: [],
        nebulae: []
    };

    for (let i = 0; i < allObjects.length; i++) {
        const obj = allObjects[i];
        const userData = obj.userData || {};

        // Skip if no relevant data
        if (!userData.planetData && !userData.galaxyData && !userData.cloudData && !userData.isNebula && !userData.isGasCloud) continue;

        obj.getWorldPosition(scratchVector);
        const dist = Math.round(shipPos.distanceTo(scratchVector) / 1000) * 1000;

        if (!isFinite(dist) || dist < 0) continue;

        // Build name via utils (adds icon for non-planet types)
        let preferredName = getObjectName(obj);
        const typ = getObjectType(userData);
        const icon = getIconForType(typ);
        if (typ !== 'planet' && icon) preferredName = `${icon} ${preferredName}`;

        const item = {
            obj,
            distance: dist,
            name: preferredName
        };

        // Helper: detect if object is inside a galaxy group (has an ancestor with isGalaxy)
        const isInsideGalaxy = (node) => {
            let p = node.parent;
            while (p) {
                if (p.userData?.isGalaxy) return true;
                p = p.parent;
            }
            return false;
        };

        // Categorize (skip planets inside galaxies here; handled in nested section)
        if (userData.isNebula) {
            categories.nebulae.push(item);
        } else if (userData.isGasCloud || userData.cloudData) {
            categories.gasClouds.push(item);
        } else if (userData.planetData && !isInsideGalaxy(obj)) {
            // Root planets (not under a galaxy group)
            categories.rootPlanets.push(item);
        }
    }

    // Sort each category by distance
    Object.values(categories).forEach(cat => cat.sort((a, b) => a.distance - b.distance));

    const limit = isExpanded ? 100 : 8;
    let html = '';

    // Helper to create category section
    const createCategory = (title, items, icon, color) => {
        if (items.length === 0) return '';

        const itemsToShow = items.slice(0, limit);
        let categoryHtml = `<div class="minimap-category" style="border-left: 3px solid ${color}; padding-left: 8px; margin: 8px 0;">`;
        categoryHtml += `<div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">${icon} ${title}</div>`;

        itemsToShow.forEach((item, i) => {
            const dist = Math.floor(item.distance);
            const isClosest = i === 0;
            categoryHtml += `<div class="minimap-item ${isClosest ? 'closest' : ''}" onclick="window.teleportTo('${item.obj.uuid}')" style="cursor: pointer; padding-left: 12px;">
                ${item.name} - ${dist}m
            </div>`;
        });

        categoryHtml += '</div>';
        return categoryHtml;
    };

    // Build nested Galaxies section with recursive sub-galaxies and planets
    const galaxies = galaxyManager.getGalaxies();
    if (galaxies && galaxies.length) {
        let galaxySection = `<div class="minimap-category" style="border-left: 3px solid #FF00FF; padding-left: 8px; margin: 8px 0;">`;
        const gCollapsed = !!window.minimapState.galaxiesCollapsed;
        const gSymbol = gCollapsed ? '▸' : '▾';
        galaxySection += `<div style="font-weight: bold; color: #FF00FF; margin-bottom: 4px; cursor:pointer;" onclick="window.toggleMinimap('galaxies')">${gSymbol} 🌌 Galaxies</div>`;

        const renderGalaxy = (group, level = 0) => {
            group.getWorldPosition(scratchVector);
            const gDist = Math.round(shipPos.distanceTo(scratchVector) / 1000) * 1000;
            const galaxyName = group.userData?.galaxyData?.name || 'Galaxy';
            const pad = 6 + level * 12;
            const collapsed = !!window.minimapState.galaxyCollapse[group.uuid];
            const caret = collapsed ? '▸' : '▾';
            galaxySection += `<div class="minimap-item" style="color:#FF99FF; margin:6px 0; padding-left:${pad}px; display:flex; gap:6px; align-items:center;">
                <span style=\"cursor:pointer;color:#FF99FF;\" onclick=\"window.toggleGalaxy('${group.uuid}')\">${caret}</span>
                <span style=\"flex:1;cursor:pointer;\" onclick=\"window.teleportTo('${group.uuid}')\">${galaxyName} - ${Math.floor(gDist)}m</span>
            </div>`;

            if (window.minimapState.galaxiesCollapsed || collapsed) return; // collapsed: skip details

            // Direct planets of this group
            const directPlanets = group.children.filter(c => c.userData && c.userData.planetData);
            const planetItems = directPlanets.map(p => {
                p.getWorldPosition(scratchVector2);
                return {
                    obj: p,
                    name: p.userData.planetData.title || p.userData.planetData.name || 'Planet',
                    distance: Math.round(shipPos.distanceTo(scratchVector2) / 1000) * 1000
                };
            }).sort((a,b) => a.distance - b.distance).slice(0, limit);

            planetItems.forEach((p, i) => {
                const isClosest = i === 0;
                galaxySection += `<div class="minimap-item ${isClosest ? 'closest' : ''}" onclick="window.teleportTo('${p.obj.uuid}')" style="cursor:pointer; padding-left:${pad + 18}px; color:#00F0FF;">🌍 ${p.name} - ${Math.floor(p.distance)}m</div>`;
            });

            // Recurse into immediate sub-galaxies (handles wrapped sub-groups)
            const isImmediateSubGalaxy = (node, parent) => {
                let p = node.parent;
                while (p && p !== parent && !p.userData?.isGalaxy && p.userData?.objectType !== 'galaxy') {
                    p = p.parent;
                }
                return p === parent;
            };
            group.traverse(child => {
                if (child === group) return;
                const ud = child.userData || {};
                if ((ud.isGalaxy || ud.objectType === 'galaxy') && isImmediateSubGalaxy(child, group)) {
                    renderGalaxy(child, level + 1);
                }
            });
        };

        galaxies.forEach(g => renderGalaxy(g.group || g, 0));

        galaxySection += `</div>`;
        html += galaxySection;
    }

    // Root planets (standalone)
    html += createCategory('Planets', categories.rootPlanets, '🌍', '#00F0FF');

    // Build nested Gas Clouds section with Nebulae as submenu
    const gasClouds = galaxyManager.getGasClouds ? galaxyManager.getGasClouds() : [];
    if (gasClouds && gasClouds.length) {
        let cloudSection = `<div class=\"minimap-category\" style=\"border-left: 3px solid #00FF88; padding-left: 8px; margin: 8px 0;\">`;
        const cCollapsed = !!window.minimapState.gasCollapsed;
        const cSymbol = cCollapsed ? '▸' : '▾';
        cloudSection += `<div style=\"font-weight: bold; color: #00FF88; margin-bottom: 4px; cursor:pointer;\" onclick=\"window.toggleMinimap('gas')\">${cSymbol} 🌫️ Gas Clouds</div>`;

        const renderNebula = (nebula, level) => {
            const pad = 18 + level * 12;
            nebula.getWorldPosition(scratchVector2);
            const nDist = Math.round(shipPos.distanceTo(scratchVector2) / 1000) * 1000;
            const postsCount = Array.isArray(nebula.userData?.posts) ? nebula.userData.posts.length : 0;
            const name = (nebula.userData?.tagName || 'Nebula') + (postsCount ? ` (${postsCount})` : '');
            const marker = level > 0 ? '↳ ' : '';
            cloudSection += `<div class=\"minimap-item\" onclick=\"window.teleportTo('${nebula.uuid}')\" style=\"cursor:pointer; padding-left:${pad}px; color:#FF88FF;\">${marker}✨ ${name} - ${Math.floor(nDist)}m</div>`;
            nebula.traverse(child => {
                if (child === nebula) return;
                if (child.userData?.isNebula && (function isImmediate(node, parent){ let p=node.parent; while(p&&p!==parent&&!p.userData?.isNebula){p=p.parent;} return p===parent; })(child, nebula)) {
                    renderNebula(child, level + 1);
                }
            });
        };

        gasClouds.forEach((cloud) => {
            const cloudData = cloud.userData?.cloudData || {};
            const postsCount = (cloudData.posts ? cloudData.posts.length : 0) +
                Object.values(cloudData.nebulae || {}).reduce((a, n) => a + (n.posts ? n.posts.length : 0), 0);
            const nameBase = cloud.userData?.categoryName || cloudData.name || 'Gas Cloud';
            const displayName = postsCount ? `${nameBase} (${postsCount})` : nameBase;

            cloud.getWorldPosition(scratchVector);
            const cDist = Math.round(shipPos.distanceTo(scratchVector) / 1000) * 1000;

            const collapsed = !!(window.minimapState.cloudCollapse && window.minimapState.cloudCollapse[cloud.uuid]);
            const caret = collapsed ? '▸' : '▾';
            cloudSection += `<div class=\"minimap-item\" style=\"color:#66FFCC; margin:6px 0; padding-left:6px; display:flex; gap:6px; align-items:center;\">`+
                             `<span style=\\"cursor:pointer;color:#66FFCC;\\" onclick=\\"window.toggleCloud('${cloud.uuid}')\\">${caret}</span>`+
                             `<span style=\\"flex:1;cursor:pointer;\\" onclick=\\"window.teleportTo('${cloud.uuid}')\\">${displayName} - ${Math.floor(cDist)}m</span>`+
                             `</div>`;

            if (window.minimapState.gasCollapsed || collapsed) return; // collapsed
            cloud.traverse(child => {
                if (child === cloud) return;
                // Only render immediate child nebulae to preserve levels
                if (child.userData?.isNebula) {
                    let p = child.parent;
                    while (p && p !== cloud && !p.userData?.isNebula) p = p.parent;
                    if (p === cloud) renderNebula(child, 0);
                }
            });
        });

        cloudSection += `</div>`;
        html += cloudSection;
    }

    // Orphan nebulae (if any)
    const orphanNebulae = categories.nebulae.filter(n => !(n.obj.userData && n.obj.userData.parentGasCloud));
    html += createCategory('Nebulae', orphanNebulae, '✨', '#FF88FF');

    if (minimapList.innerHTML !== html) {
        minimapList.innerHTML = html;
    }
}

/**
 * Updates the compass display
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} galaxyManager - Galaxy manager
 * @param {number} frameCount - Current frame count for throttling
 */
export function updateCompass(shipGroup, galaxyManager, frameCount) {
    // Throttle compass updates
    if (frameCount % 3 !== 0) return;

    const compassContainer = document.getElementById('compass-container');
    if (!compassContainer) return;

    const targets = galaxyManager.getAllObjects();
    const fov = Math.PI * 0.6; // ~108 degrees visible

    // Find closest target for highlighting
    let closestTarget = null;
    let closestDist = Infinity;

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const userData = target.userData || {};
        if (!userData.planetData && !userData.isNebula && !userData.isGasCloud) continue;

        target.getWorldPosition(scratchVector);
        const dist = shipGroup.position.distanceTo(scratchVector);
        if (dist < closestDist) {
            closestDist = dist;
            closestTarget = target;
        }
    }

    let markersHTML = '';
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const userData = target.userData || {};

        // Check if it's a valid target
        if (!userData.planetData && !userData.isNebula && !userData.isGasCloud && !userData.cloudData) continue;

        target.getWorldPosition(scratchVector);

        const dx = scratchVector.x - shipGroup.position.x;
        const dz = scratchVector.z - shipGroup.position.z;

        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - shipGroup.rotation.y;

        // Normalize -PI to +PI
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < fov / 2) {
            const pct = 50 + (diff / (fov / 2)) * 50;

            // Determine name and style based on type
            let name = 'Unknown';
            let markerClass = 'compass-marker';
            let icon = '';

            if (userData.isNebula) {
                name = userData.tagName || 'Nebula';
                markerClass += ' nebula-marker';
                icon = '✨';
            } else if (userData.isGasCloud || userData.cloudData) {
                name = userData.categoryName || userData.cloudData?.name || 'Gas Cloud';
                markerClass += ' gas-cloud-marker';
                icon = '🌫️';
            } else if (userData.planetData) {
                name = userData.planetData.title || userData.planetData.name;
                icon = '🌍';
            }

            const isClosest = target === closestTarget;
            if (isClosest) markerClass += ' closest-target';

            markersHTML += `<div class="${markerClass}" style="left: ${100 - pct}%">${icon} ${name}</div>`;
        }
    }

    compassContainer.innerHTML = markersHTML;
}
