/**
 * @fileoverview HUD Utilities Module
 * @author CYPT71
 * @description Helper functions for HUD updates (minimap, compass)
 */

import * as THREE from 'three';
import { getObjectName, getObjectType, getIconForType } from './space-object-utils.js';

const scratchVector = new THREE.Vector3();
const scratchVector2 = new THREE.Vector3();

// Helper: Format distance to km
const formatDistance = (d) => {
    const km = Math.round(d / 1000);
    return `${km.toLocaleString()} km`;
};

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
    const saveState = (st) => { try { localStorage.setItem('minimapState', JSON.stringify(st)); } catch { } };
    window.minimapState = window.minimapState || loadState() || { galaxiesCollapsed: false, gasCollapsed: false, galaxyCollapse: {}, cloudCollapse: {} };
    window.minimapState.galaxyCollapse = window.minimapState.galaxyCollapse || {};
    window.minimapState.cloudCollapse = window.minimapState.cloudCollapse || {};

    window.toggleMinimap = (section) => {
        const key = section === 'galaxies' ? 'galaxiesCollapsed' : 'gasCollapsed';
        window.minimapState[key] = !window.minimapState[key];
        saveState(window.minimapState);
        // Force immediate update? Or wait for next frame.
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
    const shipPos = shipGroup.position;

    // Categorize
    const categories = {
        rootPlanets: [],
        gasClouds: [],
        nebulae: []
    };

    for (let i = 0; i < allObjects.length; i++) {
        const obj = allObjects[i];
        const userData = obj.userData || {};

        if (!userData.planetData && !userData.galaxyData && !userData.cloudData && !userData.isNebula && !userData.isGasCloud) continue;

        obj.getWorldPosition(scratchVector);
        const dist = shipPos.distanceTo(scratchVector);

        if (!isFinite(dist) || dist < 0) continue;

        let preferredName = getObjectName(obj);
        const typ = getObjectType(userData);
        const icon = getIconForType(typ);
        if (typ !== 'planet' && icon) preferredName = `${icon} ${preferredName}`;

        const item = {
            obj,
            distance: dist,
            name: preferredName
        };

        const isInsideGalaxy = (node) => {
            let p = node.parent;
            while (p) {
                if (p.userData?.isGalaxy) return true;
                p = p.parent;
            }
            return false;
        };

        if (userData.isNebula) {
            categories.nebulae.push(item);
        } else if (userData.isGasCloud || userData.cloudData) {
            categories.gasClouds.push(item);
        } else if (userData.planetData && !isInsideGalaxy(obj)) {
            categories.rootPlanets.push(item);
        }
    }

    // Sort
    Object.values(categories).forEach(cat => cat.sort((a, b) => a.distance - b.distance));

    const limit = isExpanded ? 100 : 8;

    // --- DOM Sync Helpers ---

    const syncCategory = (idSuffix, title, color, items, isCollapsed, toggleKey) => {
        const catId = `minimap-cat-${idSuffix}`;
        let catDiv = document.getElementById(catId);

        // Hide if empty
        if (items.length === 0) {
            if (catDiv) catDiv.style.display = 'none';
            return;
        }

        if (!catDiv) {
            catDiv = document.createElement('div');
            catDiv.id = catId;
            catDiv.className = 'minimap-category';
            catDiv.style.borderLeft = `3px solid ${color}`;
            catDiv.style.paddingLeft = '8px';
            catDiv.style.margin = '8px 0';

            const header = document.createElement('div');
            header.className = 'category-header';
            header.style.fontWeight = 'bold';
            header.style.color = color;
            header.style.marginBottom = '4px';
            if (toggleKey) {
                header.style.cursor = 'pointer';
                header.onclick = () => window.toggleMinimap(toggleKey);
            }
            catDiv.appendChild(header);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'items-container';
            catDiv.appendChild(itemsContainer);

            minimapList.appendChild(catDiv);
        } else {
            catDiv.style.display = 'block';
            // Ensure order in main list? (Galaxies, Planets, Clouds, Nebulae)
            // We'll rely on the call order.
        }

        // Update Header
        const header = catDiv.querySelector('.category-header');
        if (toggleKey) {
            const symbol = isCollapsed ? '▸' : '▾';
            header.textContent = `${symbol} ${title}`;
        } else {
            header.textContent = title;
        }

        // Sync Items
        const itemsContainer = catDiv.querySelector('.items-container');
        if (isCollapsed && toggleKey) {
            itemsContainer.style.display = 'none';
        } else {
            itemsContainer.style.display = 'block';
            syncItems(itemsContainer, items, limit);
        }
    };

    const syncItems = (container, items, maxItems) => {
        const itemsToShow = items.slice(0, maxItems);
        const currentIds = new Set();

        itemsToShow.forEach((item, i) => {
            const itemId = `minimap-item-${item.uuid}`;
            currentIds.add(itemId);

            let el = document.getElementById(itemId);
            if (!el) {
                el = document.createElement('div');
                el.id = itemId;
                el.className = 'minimap-item';
                el.style.cursor = 'pointer';
                // Base styles
                el.onclick = item.onClick || (() => window.teleportTo(item.uuid));
            }

            // Update content
            // We use a data attribute to check if we need to update structure (e.g. icon changed? unlikely)
            // But distance changes every frame.

            // Apply styles
            if (item.style) {
                Object.assign(el.style, item.style);
            }
            if (item.className) {
                el.className = `minimap-item ${item.className}`;
            }
            if (i === 0) el.classList.add('closest');
            else el.classList.remove('closest');

            // Update text content
            // We construct the innerHTML but try to be efficient? 
            // Actually, for "update only text nodes", we should have spans.
            // But the structure varies (indentation, carets).
            // Let's use innerHTML but only if it changed? No, that's what we wanted to avoid.
            // Let's use a standard structure: [Indent][Caret][Icon][Name] - [Distance]

            // Check if structure exists
            let indentSpan = el.querySelector('.mm-indent');
            let caretSpan = el.querySelector('.mm-caret');
            let contentSpan = el.querySelector('.mm-content');

            if (!contentSpan) {
                el.innerHTML = ''; // Reset
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.gap = '6px';

                indentSpan = document.createElement('span');
                indentSpan.className = 'mm-indent';
                el.appendChild(indentSpan);

                caretSpan = document.createElement('span');
                caretSpan.className = 'mm-caret';
                caretSpan.style.cursor = 'pointer';
                el.appendChild(caretSpan);

                contentSpan = document.createElement('span');
                contentSpan.className = 'mm-content';
                contentSpan.style.flex = '1';
                el.appendChild(contentSpan);
            }

            // Update Indent
            indentSpan.style.width = `${item.indent || 0}px`;

            // Update Caret
            if (item.hasCaret) {
                caretSpan.textContent = item.caretSymbol;
                caretSpan.onclick = (e) => {
                    e.stopPropagation();
                    item.onCaretClick();
                };
                caretSpan.style.display = 'inline';
            } else {
                caretSpan.style.display = 'none';
            }

            // Update Content (Name - Distance)
            const distStr = formatDistance(item.distance);
            const text = `${item.icon ? item.icon + ' ' : ''}${item.name} - ${distStr}`;

            // Only update if changed
            if (contentSpan.textContent !== text) {
                contentSpan.textContent = text;
            }

            // Ensure order
            if (container.children[i] !== el) {
                container.appendChild(el);
            }
        });

        // Cleanup
        Array.from(container.children).forEach(child => {
            if (!currentIds.has(child.id)) {
                container.removeChild(child);
            }
        });
    };

    // --- Prepare Lists ---

    // 1. Galaxies (Recursive)
    const galaxyRows = [];
    const galaxies = galaxyManager.getGalaxies();

    if (galaxies && galaxies.length) {
        const processGalaxy = (group, level) => {
            group.getWorldPosition(scratchVector);
            const gDist = shipPos.distanceTo(scratchVector);
            const galaxyName = group.userData?.galaxyData?.name || 'Galaxy';
            const collapsed = !!window.minimapState.galaxyCollapse[group.uuid];

            galaxyRows.push({
                uuid: group.uuid,
                name: galaxyName,
                distance: gDist,
                indent: 6 + level * 12,
                hasCaret: true,
                caretSymbol: collapsed ? '▸' : '▾',
                onCaretClick: () => window.toggleGalaxy(group.uuid),
                style: { color: '#FF99FF' }
            });

            if (window.minimapState.galaxiesCollapsed || collapsed) return;

            // Planets
            const directPlanets = group.children.filter(c => c.userData && c.userData.planetData);
            const planetItems = directPlanets.map(p => {
                p.getWorldPosition(scratchVector2);
                return {
                    uuid: p.uuid,
                    name: p.userData.planetData.title || p.userData.planetData.name || 'Planet',
                    distance: shipPos.distanceTo(scratchVector2),
                    indent: 6 + level * 12 + 18,
                    icon: '🌍',
                    style: { color: '#00F0FF' }
                };
            }).sort((a, b) => a.distance - b.distance).slice(0, limit);

            galaxyRows.push(...planetItems);

            // Sub-galaxies
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
                    processGalaxy(child, level + 1);
                }
            });
        };

        galaxies.forEach(g => processGalaxy(g.group || g, 0));
    }

    syncCategory('galaxies', '🌌 Galaxies', '#FF00FF', galaxyRows, !!window.minimapState.galaxiesCollapsed, 'galaxies');

    // 2. Root Planets
    const rootPlanetRows = categories.rootPlanets.map(p => ({
        uuid: p.obj.uuid,
        name: p.name.replace('🌍 ', ''), // Remove icon if added by getObjectName
        distance: p.distance,
        icon: '🌍',
        style: { paddingLeft: '12px' }
    }));
    syncCategory('planets', 'Planets', '#00F0FF', rootPlanetRows);

    // 3. Gas Clouds
    const cloudRows = [];
    const gasClouds = galaxyManager.getGasClouds ? galaxyManager.getGasClouds() : [];

    if (gasClouds && gasClouds.length) {
        const processNebula = (nebula, level) => {
            nebula.getWorldPosition(scratchVector2);
            const nDist = shipPos.distanceTo(scratchVector2);
            const postsCount = Array.isArray(nebula.userData?.posts) ? nebula.userData.posts.length : 0;
            const nameBase = nebula.userData?.nebulaName || nebula.userData?.tagName || 'Nebula';
            const name = nameBase + (postsCount ? ` (${postsCount})` : '');

            cloudRows.push({
                uuid: nebula.uuid,
                name: name,
                distance: nDist,
                indent: 18 + level * 12,
                icon: level > 0 ? '↳ ✨' : '✨',
                style: { color: '#FF88FF' }
            });

            nebula.traverse(child => {
                if (child === nebula) return;
                if (child.userData?.isNebula && (function isImmediate(node, parent) { let p = node.parent; while (p && p !== parent && !p.userData?.isNebula) { p = p.parent; } return p === parent; })(child, nebula)) {
                    processNebula(child, level + 1);
                }
            });
        };

        gasClouds.forEach(cloud => {
            const cloudData = cloud.userData?.cloudData || {};
            const postsCount = (cloudData.posts ? cloudData.posts.length : 0) +
                Object.values(cloudData.nebulae || {}).reduce((a, n) => a + (n.posts ? n.posts.length : 0), 0);
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
                style: { color: '#FF00FF' }
            });

            if (window.minimapState.gasCollapsed || collapsed) return;

            cloud.traverse(child => {
                if (child === cloud) return;
                if (child.userData?.isNebula) {
                    let p = child.parent;
                    while (p && p !== cloud && !p.userData?.isNebula) p = p.parent;
                    if (p === cloud) processNebula(child, 0);
                }
            });
        });
    }
    syncCategory('gas', '🌫️ Gas Clouds', '#00FF88', cloudRows, !!window.minimapState.gasCollapsed, 'gas');

    // 4. Orphan Nebulae
    const orphanNebulae = categories.nebulae.filter(n => !(n.obj.userData && n.obj.userData.parentGasCloud));
    const nebulaItems = orphanNebulae.map(n => ({
        uuid: n.obj.uuid,
        name: n.name.replace('✨ ', ''),
        distance: n.distance,
        icon: '✨',
        style: { color: '#FF88FF', paddingLeft: '12px' }
    }));
    syncCategory('nebulae', 'Nebulae', '#FF88FF', nebulaItems);
}

/**
 * Updates the compass display
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} galaxyManager - Galaxy manager
 * @param {number} frameCount - Current frame count for throttling
 */
export function updateCompass(shipGroup, galaxyManager, frameCount) {
    if (frameCount % 3 !== 0) return;

    const compassContainer = document.getElementById('compass-container');
    if (!compassContainer) return;

    const targets = galaxyManager.getAllObjects();
    const fov = Math.PI * 0.6; // ~108 degrees visible

    // Identify active targets
    const activeTargets = [];
    let closestTarget = null;
    let closestDist = Infinity;

    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const userData = target.userData || {};

        if (!userData.planetData && !userData.isNebula && !userData.isGasCloud && !userData.cloudData) continue;

        target.getWorldPosition(scratchVector);
        const dist = shipGroup.position.distanceTo(scratchVector);

        if (dist < closestDist) {
            closestDist = dist;
            closestTarget = target;
        }

        const dx = scratchVector.x - shipGroup.position.x;
        const dz = scratchVector.z - shipGroup.position.z;
        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - shipGroup.rotation.y;

        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        // Only show objects in FRONT (within FOV, not behind)
        // diff should be within [-fov/2, +fov/2] AND the object should be in front
        if (Math.abs(diff) < fov / 2) {
            activeTargets.push({
                target,
                diff,
                dist,
                userData
            });
        }
    }

    // Sync Markers
    const currentIds = new Set();

    activeTargets.forEach(item => {
        const id = `compass-marker-${item.target.uuid}`;
        currentIds.add(id);

        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            compassContainer.appendChild(el);
        }

        // Calculate Position
        const pct = 50 + (item.diff / (fov / 2)) * 50;
        el.style.left = `${pct}%`;

        // Determine Content
        let name = 'Unknown';
        let markerClass = 'compass-marker';
        let icon = '';

        if (item.userData.isNebula) {
            name = item.userData.tagName || 'Nebula';
            markerClass += ' nebula-marker';
            icon = '✨';
        } else if (item.userData.isGasCloud || item.userData.cloudData) {
            name = item.userData.categoryName || item.userData.cloudData?.name || 'Gas Cloud';
            markerClass += ' gas-cloud-marker';
            icon = '🌫️';
        } else if (item.userData.planetData) {
            name = item.userData.planetData.title || item.userData.planetData.name;
            icon = '🌍';
        }

        if (item.target === closestTarget) {
            markerClass += ' closest-target';
        }

        // Update Class
        if (el.className !== markerClass) {
            el.className = markerClass;
        }

        // Update Text (Name + Distance)
        const distStr = formatDistance(item.dist);
        const text = `${icon} ${name} (${distStr})`;

        if (el.textContent !== text) {
            el.textContent = text;
        }
    });

    // Cleanup
    Array.from(compassContainer.children).forEach(child => {
        if (!currentIds.has(child.id)) {
            compassContainer.removeChild(child);
        }
    });
}
