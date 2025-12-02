import * as THREE from 'three';
import { formatDistance } from './formatters.js';

const scratchVector = new THREE.Vector3();

export function updateCompass(shipGroup, galaxyManager, frameCount) {
    if (frameCount % 3 !== 0) return;

    const compassContainer = document.getElementById('compass-container');
    if (!compassContainer) return;

    const targets = galaxyManager.getAllObjects();
    const fov = Math.PI * 0.6;
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

        if (Math.abs(diff) < fov / 2) {
            activeTargets.push({ target, diff, dist, userData });
        }
    }

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

        const pct = 50 + (item.diff / (fov / 2)) * 50;
        el.style.left = `${pct}%`;

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

        if (el.className !== markerClass) {
            el.className = markerClass;
        }

        const distStr = formatDistance(item.dist);
        const text = `${icon} ${name} (${distStr})`;
        if (el.textContent !== text) {
            el.textContent = text;
        }
    });

    Array.from(compassContainer.children).forEach(child => {
        if (!currentIds.has(child.id)) {
            compassContainer.removeChild(child);
        }
    });
}
