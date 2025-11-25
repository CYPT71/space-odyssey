/**
 * @fileoverview HUD Utilities Module
 * @author CYPT71
 * @description Helper functions for HUD updates (minimap, compass)
 */

import * as THREE from 'three';

const scratchVector = new THREE.Vector3();
const scratchVector2 = new THREE.Vector3();

/**
 * Updates the minimap display
 * @param {THREE.Object3D} shipGroup - Ship object
 * @param {Object} galaxyManager - Galaxy manager
 * @param {number} frameCount - Current frame count for throttling
 */
export function updateMinimap(shipGroup, galaxyManager, frameCount) {
    // Throttle DOM updates: only update every 10 frames
    if (frameCount % 10 !== 0) return;

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
    const allObjects = galaxyManager.getAllObjects();
    const shipPos = shipGroup.position;

    // Categorize objects
    const categories = {
        planets: [],
        galaxies: [],
        gasClouds: [],
        nebulae: []
    };

    for (let i = 0; i < allObjects.length; i++) {
        const obj = allObjects[i];
        const userData = obj.userData || {};

        // Skip if no relevant data
        if (!userData.planetData && !userData.galaxyData && !userData.cloudData && !userData.isNebula && !userData.isGasCloud) continue;

        obj.getWorldPosition(scratchVector);
        const dist = shipPos.distanceTo(scratchVector);

        if (!isFinite(dist) || dist < 0) continue;

        const item = {
            obj,
            distance: dist,
            name: userData.planetData?.name ||
                userData.galaxyData?.name ||
                userData.cloudData?.name ||
                userData.tagName ||
                'Unknown'
        };

        // Categorize
        if (userData.isNebula) {
            categories.nebulae.push(item);
        } else if (userData.isGasCloud || userData.cloudData) {
            categories.gasClouds.push(item);
        } else if (userData.galaxyData) {
            categories.galaxies.push(item);
        } else if (userData.planetData) {
            categories.planets.push(item);
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

    // Build HTML with categories
    html += createCategory('Planets', categories.planets, '🌍', '#00F0FF');
    html += createCategory('Galaxies', categories.galaxies, '🌌', '#FF00FF');
    html += createCategory('Gas Clouds', categories.gasClouds, '🌫️', '#00FF88');
    html += createCategory('Nebulae', categories.nebulae, '✨', '#FF88FF');

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
