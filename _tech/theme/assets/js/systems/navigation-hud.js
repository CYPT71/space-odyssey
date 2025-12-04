/**
 * @fileoverview Navigation HUD System
 * @author CYPT71
 * @description Manages on-screen waypoints and off-screen directional indicators
 */
import {
    createCenterArrow,
    createHudLayer,
    createNearestArrow,
    createWaypointElement
} from './navigation-hud/elements.js';

export function createNavigationSystem(container, camera) {
    const trackedPlanets = [];
    let waypointElement = null;
    let nearestArrow = null;

    const hudLayer = createHudLayer(container);
    createCenterArrow(hudLayer);
    nearestArrow = createNearestArrow(hudLayer);

    const update = (shipPosition) => {
        if (trackedPlanets.length === 0) {
            if (waypointElement) {
                waypointElement.style.display = 'none';
            }
            return;
        }

        let targetPlanet = null;
        let nearestPlanet = null;
        let closestDistance = Infinity;
        let nearestDistance = Infinity;

        trackedPlanets.forEach((planet) => {
            const distance = shipPosition.distanceTo(planet.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestPlanet = planet;
            }

            if (targetPlanet) return;
            const isIndexPlanet = planet.userData.planetData?.url?.includes('index.md') ||
                planet.userData.planetData?.name?.toLowerCase().includes('home');
            if (isIndexPlanet) {
                targetPlanet = planet;
                closestDistance = distance;
            }
        });

        if (!targetPlanet && nearestPlanet) {
            targetPlanet = nearestPlanet;
            closestDistance = nearestDistance;
        }

        if (!targetPlanet) return;

        if (!waypointElement) {
            waypointElement = createWaypointElement(hudLayer);
        }

        waypointElement.style.display = 'flex';

        const width = window.innerWidth;
        const height = window.innerHeight;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const margin = 50;

        const distKm = Math.round(closestDistance / 1000).toLocaleString() + ' km';
        waypointElement.querySelector('.nav-dist').textContent = distKm;
        waypointElement.querySelector('.nav-name').textContent =
            targetPlanet.userData.planetData?.name || 'Unknown';

        const pos = targetPlanet.position.clone();
        pos.project(camera);

        const isBehind = pos.z > 1;

        let screenX = (pos.x * halfWidth) + halfWidth;
        let screenY = -(pos.y * halfHeight) + halfHeight;

        const isOffScreen = screenX < margin || screenX > width - margin ||
            screenY < margin || screenY > height - margin;

        if (isBehind || isOffScreen) {
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
            waypointElement.style.left = `${screenX}px`;
            waypointElement.style.top = `${screenY}px`;
            waypointElement.style.opacity = '1';
            waypointElement.style.transform = 'translate(-50%, -50%)';

            waypointElement.querySelector('.nav-info').style.display = 'block';
            waypointElement.querySelector('.nav-arrow').style.display = 'none';
        }

        if (nearestPlanet && nearestArrow) {
            const np = nearestPlanet.position.clone();
            np.project(camera);
            const angle = Math.atan2(np.y, np.x);
            nearestArrow.style.transform = `translate(-50%, -50%) rotate(${-(angle * 180 / Math.PI) + 90}deg)`;
            nearestArrow.style.opacity = '0.7';
        }
    };

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
