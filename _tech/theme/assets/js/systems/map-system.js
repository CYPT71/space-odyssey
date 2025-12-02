/**
 * @fileoverview 2D Map System
 * @author CYPT71
 * @description Renders a 2D map overlay and handles autopilot targeting
 */

import * as THREE from 'three';
import { isMobile } from '../utils/device.js';
import { loadPageContent } from '../init/content-loader.js';
import { parseHtml } from '../utils/html-parser.js';

/**
 * Creates the map system
 * @param {Object} systems - Game systems
 * @returns {Object} Map system
 */
export function createMapSystem(systems) {
    const { galaxyManager, shipGroup, shipControls } = systems;

    // Create Map Overlay
    const overlay = document.createElement('div');
    overlay.id = 'map-overlay';
    overlay.className = 'terminal-panel';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        z-index: 9000;
        display: none;
        justify-content: center;
        align-items: center;
    `;
    document.body.appendChild(overlay);

    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let isOpen = false;
    const INITIAL_SCALE = 5e-5; // Zoom level
    let scale = INITIAL_SCALE;
    let offset = { x: 0, y: 0 }; // Pan offset
    let isDragging = false;
    let lastMouse = { x: 0, y: 0 };

    const centerOnShip = () => {
        offset.x = -shipGroup.position.x * scale;
        offset.y = -shipGroup.position.z * scale;
        render();
    };

    // Center button
    const centerBtn = document.createElement('button');
    centerBtn.textContent = 'Center on Ship';
    centerBtn.style.cssText = 'position:absolute;top:20px;right:20px;z-index:9001;padding:8px 12px;border:1px solid #00F0FF;background:rgba(0,20,40,0.85);color:#00F0FF;font-family:monospace;cursor:pointer;';
    centerBtn.addEventListener('click', () => {
        if (!isOpen) return;
        centerOnShip();
    });
    overlay.appendChild(centerBtn);

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Toggle Map
    window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'm') {
            isOpen = !isOpen;
            overlay.style.display = isOpen ? 'flex' : 'none';
            if (isOpen) {
                centerOnShip();
                render();
            }
        } else if (e.key.toLowerCase() === 'c' && isOpen) {
            centerOnShip();
        }
    });

    // Mouse Interaction
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            offset.x += dx;
            offset.y += dy;
            lastMouse = { x: e.clientX, y: e.clientY };
            render();
        }
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const delta = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);
        scale *= delta;
        render();
    });

    // Click to Target
    canvas.addEventListener('dblclick', (e) => {
        // Convert screen to world
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const worldX = (e.clientX - cx - offset.x) / scale;
        const worldZ = (e.clientY - cy - offset.y) / scale;

        // Find closest object
        const allObjects = galaxyManager.getAllObjects();
        let closest = null;
        let minD = Infinity;

        allObjects.forEach(obj => {
            if (!obj.userData.planetData && !obj.userData.isNebula && !obj.userData.isGasCloud && !obj.userData.galaxyData && !obj.userData.isGalaxy) return;

            const objPos = new THREE.Vector3();
            obj.getWorldPosition(objPos);
            const d = new THREE.Vector2(objPos.x - worldX, objPos.z - worldZ).length();

            // Hit radius based on scale (make it easier to click when zoomed out)
            const hitRadius = 20 / scale;

            if (d < hitRadius && d < minD) {
                minD = d;
                closest = obj;
            }
        });

        // Fallback: if nothing was clicked, snap to nearest object around the ship within a short range
        if (!closest) {
            const shipPos = new THREE.Vector3();
            shipGroup.getWorldPosition(shipPos);
            const NEAR_FALLBACK_DIST = 10000; // 10 km
            allObjects.forEach(obj => {
                if (!obj.userData.planetData && !obj.userData.isNebula && !obj.userData.isGasCloud && !obj.userData.galaxyData && !obj.userData.isGalaxy) return;
                const objPos = new THREE.Vector3();
                obj.getWorldPosition(objPos);
                const d = shipPos.distanceTo(objPos);
                if (d < NEAR_FALLBACK_DIST && d < minD) {
                    minD = d;
                    closest = obj;
                }
            });
        }

        if (closest) {
            const userData = closest.userData || {};
            // Check autopilot confirmation setting
            const requireConfirmation = localStorage.getItem('autopilotConfirmation') !== 'false';

            // On mobile: clicking opens terminal instead of autopilot when planet
            if (isMobile() && userData.planetData && userData.planetData.url) {
                loadPageContent(userData.planetData.url)
                    .then(html => {
                        const doc = parseHtml(html);
                        const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;
                        const terminal = document.getElementById('reading-overlay');
                        const terminalContent = document.getElementById('reading-content');
                        if (terminal && terminalContent) {
                            // Avoid injecting raw HTML; render as plain text to prevent XSS
                            terminalContent.textContent = content ? content.textContent || '' : html;
                            terminal.classList.remove('hidden');
                            if (window.uiManager && window.uiManager.openReadingMode) {
                                window.uiManager.openReadingMode();
                            }
                        }
                    })
                    .catch(() => {
                        // fallback to autopilot if load fails
                        window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid: closest.uuid } }));
                    });
                return;
            }

            const engageAutopilot = () => {
                const targetPos = new THREE.Vector3();
                closest.getWorldPosition(targetPos);

                // Calculate safe approach distance
                let stopDistance = 100000; // Default 100 km (in atmosphere)
                if (userData.planetData) {
                    stopDistance = 100000;
                } else if (userData.isGasCloud || userData.cloudData) {
                    stopDistance = 500000;
                } else if (userData.galaxyData || userData.isGalaxy) {
                    stopDistance = 0;
                } else if (userData.isNebula) {
                    stopDistance = 0;
                }

                // Target slightly offset to avoid collision (only for planets/clouds)
                const approachOffset = stopDistance > 0 ? new THREE.Vector3(0, 0, 20000) : new THREE.Vector3(0, 0, 0);
                shipControls.engageAutopilot(targetPos.clone().add(approachOffset), stopDistance, closest);
                isOpen = false;
                overlay.style.display = 'none';

                // Show Warp 20 notification (always active until atmosphere)
                const notification = document.createElement('div');
                notification.textContent = '⚡ WARP 20 ENGAGED - MAXIMUM SPEED UNTIL ATMOSPHERE';
                notification.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(255,0,255,0.9);color:#fff;padding:20px;border-radius:10px;font-family:monospace;z-index:10000;font-size:18px;';
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            }
            if (requireConfirmation) {
                window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid: closest.uuid } }));
            } else {
                engageAutopilot();
            }
        }
    });

    // Helper to draw arrow to nearest planet

    function render() {
        if (!isOpen) return;
        requestAnimationFrame(render);

        ctx.fillStyle = '#000510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const allObjects = galaxyManager.getAllObjects();
        let renderedCount = 0;

        // Draw Objects
        allObjects.forEach(obj => {
            const ud = obj.userData;
            if (!ud) return;

            // More permissive filtering - show anything with identifying data
            const hasData = ud.planetData || ud.isNebula || ud.isGasCloud || ud.galaxyData || ud.isGalaxy;
            if (!hasData) return;

            const pos = new THREE.Vector3();
            obj.getWorldPosition(pos);

            const sx = cx + offset.x + pos.x * scale;
            const sy = cy + offset.y + pos.z * scale;

            // Cull off-screen (but with larger margin)
            if (sx < -100 || sx > canvas.width + 100 || sy < -100 || sy > canvas.height + 100) return;

            renderedCount++;

            if (ud.galaxyData || ud.isGalaxy) {
                ctx.fillStyle = '#FF00FF';
                ctx.beginPath();
                ctx.arc(sx, sy, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFF';
                ctx.font = '12px monospace';
                const name = ud.galaxyData?.name || ud.name || 'Galaxy';
                ctx.fillText(name, sx + 12, sy + 4);
            } else if (ud.planetData) {
                ctx.fillStyle = '#00F0FF';
                ctx.beginPath();
                ctx.arc(sx, sy, 4, 0, Math.PI * 2);
                ctx.fill();
                // ALWAYS show planet names (removed zoom condition)
                ctx.fillStyle = '#AAA';
                ctx.font = '10px monospace';
                const planetName = ud.planetData.title || ud.planetData.tiitle || ud.planetData.name || 'Planet';
                ctx.fillText(planetName, sx + 6, sy + 3);
            } else if (ud.isGasCloud) {
                ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
                ctx.beginPath();
                ctx.arc(sx, sy, 20, 0, Math.PI * 2);
                ctx.fill();
                // Show gas cloud names
                ctx.fillStyle = '#0F8';
                ctx.font = '10px monospace';
                const cloudName = ud.cloudName || ud.categoryName || ud.cloudData?.name || 'Gas Cloud';
                ctx.fillText(cloudName, sx + 22, sy + 4);
            } else if (ud.isNebula) {
                ctx.fillStyle = 'rgba(255, 100, 255, 0.2)';
                ctx.beginPath();
                ctx.arc(sx, sy, 15, 0, Math.PI * 2);
                ctx.fill();
                // Show nebula names
                ctx.fillStyle = '#F6F';
                ctx.font = '10px monospace';
                const nebulaName = ud.nebulaName || ud.tagName || 'Nebula';
                ctx.fillText(nebulaName, sx + 17, sy + 4);
            }
        });

        // Draw Ship
        const shipX = cx + offset.x + shipGroup.position.x * scale;
        const shipY = cy + offset.y + shipGroup.position.z * scale;

        ctx.save();
        ctx.translate(shipX, shipY);
        ctx.rotate(-shipGroup.rotation.y + Math.PI); // Fix 180° rotation
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(6, 8);
        ctx.lineTo(0, 5);
        ctx.lineTo(-6, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // HUD
        ctx.fillStyle = '#00F0FF';
        ctx.font = '14px monospace';
        ctx.fillText('MAP VIEW - [M] to Close - Double Click to Autopilot', 20, 30);
        ctx.fillText(`Zoom: ${scale.toExponential(1)} | Objects: ${renderedCount}/${allObjects.length}`, 20, 50);
        ctx.fillText(`Ship: (${Math.round(shipGroup.position.x / 1000)}km, ${Math.round(shipGroup.position.z / 1000)}km)`, 20, 70);
    }

    return {
        toggle: () => {
            isOpen = !isOpen;
            overlay.style.display = isOpen ? 'flex' : 'none';
            if (isOpen) render();
        }
    };
}
