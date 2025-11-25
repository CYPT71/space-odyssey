/**
 * @fileoverview Navigation HUD System
 * @author CYPT71
 * @description Manages on-screen waypoints and off-screen directional indicators
 */

import * as THREE from 'three';

/**
 * Creates the navigation HUD system
 * @param {HTMLElement} container - DOM container for HUD elements
 * @param {THREE.Camera} camera - The main camera
 * @returns {Object} Navigation system functions
 */
export function createNavigationSystem(container, camera) {
    const trackedPlanets = []; // Array of planets to track
    let waypointElement = null; // Single waypoint element
    let centralArrow = null; // Central direction arrow

    // Create HUD container if not exists
    let hudLayer = document.getElementById('hud-layer');
    if (!hudLayer) {
        hudLayer = document.createElement('div');
        hudLayer.id = 'hud-layer';
        hudLayer.style.position = 'absolute';
        hudLayer.style.top = '0';
        hudLayer.style.left = '0';
        hudLayer.style.width = '100%';
        hudLayer.style.height = '100%';
        hudLayer.style.pointerEvents = 'none'; // Let clicks pass through
        hudLayer.style.overflow = 'hidden';
        hudLayer.style.zIndex = '10';
        container.appendChild(hudLayer);
    }

    // Central direction arrow (always visible)
    const centerArrow = document.createElement('div');
    centerArrow.className = 'nav-center-arrow';
    // Arrow style (pointing up by default)
    centerArrow.style.position = 'absolute';
    centerArrow.style.left = '50%';
    centerArrow.style.top = '50%';
    centerArrow.style.transform = 'translate(-50%, -50%) rotate(0deg)';
    centerArrow.style.width = '0';
    centerArrow.style.height = '0';
    centerArrow.style.borderLeft = '12px solid transparent';
    centerArrow.style.borderRight = '12px solid transparent';
    centerArrow.style.borderBottom = '20px solid #FF0000'; // red arrow
    centerArrow.style.zIndex = '11';
    hudLayer.appendChild(centerArrow);
    // Store reference
    centralArrow = centerArrow;


    /**
     * Creates the single waypoint element
     */
    const createWaypoint = () => {
        const el = document.createElement('div');
        el.className = 'nav-waypoint';
        el.innerHTML = `
            <div class="nav-arrow"></div>
            <div class="nav-info">
                <span class="nav-name">Unknown</span>
                <span class="nav-dist">0km</span>
            </div>
        `;

        // Styles
        el.style.position = 'absolute';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.alignItems = 'center';
        el.style.transform = 'translate(-50%, -50%)';
        el.style.transition = 'opacity 0.2s';

        // Arrow style
        const arrow = el.querySelector('.nav-arrow');
        arrow.style.width = '0';
        arrow.style.height = '0';
        arrow.style.borderLeft = '10px solid transparent';
        arrow.style.borderRight = '10px solid transparent';
        arrow.style.borderBottom = '15px solid #00F0FF';
        arrow.style.marginBottom = '5px';

        // Info style
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

    /**
     * Updates the waypoint
     * @param {THREE.Vector3} shipPosition - Current ship position
     */
    const update = (shipPosition) => {
        if (trackedPlanets.length === 0) {
            if (waypointElement) {
                waypointElement.style.display = 'none';
            }
            return;
        }

        // Find closest planet, prioritizing index.md
        let targetPlanet = null;
        let minDist = Infinity;

        // First, check if index.md exists
        const indexPlanet = trackedPlanets.find(p =>
            p.userData.planetData?.url?.includes('index.md') ||
            p.userData.planetData?.name?.toLowerCase().includes('home')
        );

        if (indexPlanet) {
            targetPlanet = indexPlanet;
        } else {
            // Find closest planet
            trackedPlanets.forEach(planet => {
                const dist = shipPosition.distanceTo(planet.position);
                if (dist < minDist) {
                    minDist = dist;
                    targetPlanet = planet;
                }
            });
        }

        if (!targetPlanet) return;

        // Create waypoint element if it doesn't exist
        if (!waypointElement) {
            waypointElement = createWaypoint();
        }

        waypointElement.style.display = 'flex';

        const width = window.innerWidth;
        const height = window.innerHeight;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const margin = 50;

        // Calculate distance
        const dist = shipPosition.distanceTo(targetPlanet.position);
        const distKm = Math.round(dist / 1000).toLocaleString() + ' km';
        waypointElement.querySelector('.nav-dist').textContent = distKm;
        waypointElement.querySelector('.nav-name').textContent =
            targetPlanet.userData.planetData?.name || 'Unknown';

        // Project position to screen
        const pos = targetPlanet.position.clone();
        pos.project(camera);

        const isBehind = pos.z > 1;

        let screenX = (pos.x * halfWidth) + halfWidth;
        let screenY = -(pos.y * halfHeight) + halfHeight;

        const isOffScreen = screenX < margin || screenX > width - margin ||
            screenY < margin || screenY > height - margin;

        if (isBehind || isOffScreen) {
            // OFF-SCREEN INDICATOR
            if (isBehind) {
                pos.x *= -1;
                pos.y *= -1;
            }

            const angle = Math.atan2(pos.y, pos.x);
            screenX = halfWidth + Math.cos(angle) * (halfWidth - margin);
            screenY = halfHeight - Math.sin(angle) * (halfHeight - margin);

            const arrow = waypointElement.querySelector('.nav-arrow');
            const deg = (angle * 180 / Math.PI) - 90;

            waypointElement.style.transform = `translate(-50%, -50%)`;
            waypointElement.style.left = `${screenX}px`;
            waypointElement.style.top = `${screenY}px`;
            waypointElement.style.opacity = '0.8';

            waypointElement.querySelector('.nav-info').style.display = 'none';
            arrow.style.display = 'block';
            arrow.style.transform = `rotate(${-deg}deg)`;

        } else {
            // ON-SCREEN
            waypointElement.style.left = `${screenX}px`;
            waypointElement.style.top = `${screenY}px`;
            waypointElement.style.opacity = '1';
            waypointElement.style.transform = 'translate(-50%, -50%)';

            waypointElement.querySelector('.nav-info').style.display = 'block';
            waypointElement.querySelector('.nav-arrow').style.display = 'none';
        }
    };

    /**
     * Adds a planet to track
     * @param {THREE.Mesh} planet 
     */
    const trackPlanet = (planet) => {
        if (!trackedPlanets.includes(planet)) {
            trackedPlanets.push(planet);
        }
    };

    return {
        update,
        trackPlanet
    };
}
