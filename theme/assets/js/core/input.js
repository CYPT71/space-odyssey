/**
 * @fileoverview Input Handling Module
 * @author CYPT71
 * @description Handles user input, teleportation, and UI interactions
 */

import * as THREE from 'three';

/**
 * Creates the input handling system
 * @param {Object} systems - All game systems
 * @returns {Object} Input handling functions
 */
export function createInputSystem(systems) {
    const {
        shipGroup,
        shipControls,
        audioSystem,
        uiManager,
        galaxyManager,
        scannerSystem
    } = systems;

    const scratchVector = new THREE.Vector3();

    /**
     * Triggers teleport visual effect
     */
    const triggerTeleportEffect = () => {
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;opacity:0.8;transition:opacity 0.5s;z-index:1000;pointer-events:none;';
        document.body.appendChild(flash);
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => flash.remove(), 500);
        }, 50);
    };

    /**
     * Intercepts links in loaded content for SPA navigation
     * @param {HTMLElement} container - Container with links
     */
    const interceptLinksInContent = (container) => {
        const links = container.querySelectorAll('a[href]');

        links.forEach(link => {
            const href = link.getAttribute('href');

            // Skip external links and anchors
            if (href.startsWith('http') || href.startsWith('#')) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Find planet with matching URL
                const allObjects = galaxyManager.getAllObjects();
                const targetPlanet = allObjects.find(obj => {
                    if (!obj.userData?.planetData) return false;
                    const planetUrl = obj.userData.planetData.url;
                    return planetUrl === href || planetUrl.endsWith(href);
                });

                if (targetPlanet) {
                    uiManager.closeReadingMode();
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('teleportRequest', {
                            detail: { uuid: targetPlanet.uuid }
                        }));
                    }, 300);
                } else {
                    console.warn(`No planet found for URL: ${href}`);
                }
            });
        });
    };

    /**
     * Setup all event listeners
     */
    const setupEventListeners = () => {
        // Teleport function (Global for onclick)
        window.teleportTo = (uuid) => {
            window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid } }));
        };

        // Listen for teleport requests
        window.addEventListener('teleportRequest', (e) => {
            const uuid = e.detail.uuid;
            const allObjects = galaxyManager.getAllObjects();
            const target = allObjects.find(o => o.uuid === uuid);

            if (!target) return;

            // Handle galaxy teleportation
            if (target.userData?.galaxyData) {
                const galaxyName = target.userData.galaxyData.name;
                const confirmed = confirm(`🚀 PILOT CONFIRMATION\\n\\nTeleport to galaxy "${galaxyName}"?`);
                if (!confirmed) return;

                target.getWorldPosition(scratchVector);
                shipGroup.position.copy(scratchVector);
                shipGroup.position.y += 50;
                shipControls.setSpeed(0);
                triggerTeleportEffect();
                audioSystem.playSound('warp');
                return;
            }

            // Handle planet teleportation
            if (!target.geometry) return;
            if (!target.geometry.boundingSphere) target.geometry.computeBoundingSphere();
            const size = target.geometry.boundingSphere?.radius || 20;
            const offset = new THREE.Vector3(0, 0, size + 40);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);

            const targetWorldPos = new THREE.Vector3();
            target.getWorldPosition(targetWorldPos);

            shipGroup.position.copy(targetWorldPos).add(offset);
            shipGroup.lookAt(targetWorldPos);
            shipControls.setSpeed(0);
            triggerTeleportEffect();
            audioSystem.playSound('warp');

            const name = target.userData.planetData.title || target.userData.planetData.name;
            uiManager.updateHUD(0, name);

            // Open terminal automatically
            const url = target.userData.planetData.url;
            if (url) {
                fetch(url)
                    .then(res => res.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;

                        const terminal = document.getElementById('reading-overlay');
                        const terminalContent = document.getElementById('reading-content');
                        if (terminal && terminalContent) {
                            terminalContent.innerHTML = content.innerHTML;
                            terminal.classList.remove('hidden');
                            uiManager.openReadingMode();
                            interceptLinksInContent(terminalContent);
                        }
                    })
                    .catch(err => console.error('Failed to load content:', err));
            }
        });

        // Enter key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (uiManager.isReadingMode) {
                    uiManager.closeReadingMode();
                } else {
                    const closest = galaxyManager.findClosest(shipGroup.position);

                    if (closest && closest.type === 'planet' && closest.planetData) {
                        const url = closest.planetData.url;
                        const terminal = document.getElementById('reading-overlay');
                        const terminalContent = document.getElementById('reading-content');

                        if (url) {
                            fetch(url)
                                .then(res => res.text())
                                .then(html => {
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(html, 'text/html');
                                    const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;

                                    if (terminal && terminalContent) {
                                        terminalContent.innerHTML = content.innerHTML;
                                        terminal.classList.remove('hidden');
                                        uiManager.openReadingMode();
                                        interceptLinksInContent(terminalContent);
                                    }
                                })
                                .catch(err => console.error('Failed to load content:', err));
                        } else {
                            if (terminal && terminalContent) {
                                terminalContent.innerHTML = `<h1>${closest.planetData.name}</h1><p>${closest.planetData.description}</p>`;
                                terminal.classList.remove('hidden');
                                uiManager.openReadingMode();
                            }
                        }
                    }
                }
            }
        });

        // Scanner key (Tab)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                scannerSystem.triggerScan(shipGroup.position);
            }
        });

        // Warp boost button
        const warpBtn = document.getElementById('warp-boost');
        if (warpBtn) {
            warpBtn.addEventListener('mousedown', () => {
                shipControls.setSpeed(500);
                audioSystem.playSound('warp');
            });
            warpBtn.addEventListener('mouseup', () => {
                shipControls.setSpeed(0);
            });
        }

        // Return to Base button
        const returnBtn = document.getElementById('return-base');
        if (returnBtn) {
            returnBtn.addEventListener('click', () => {
                shipGroup.position.set(0, 0, 200);
                shipGroup.rotation.set(0, 0, 0);
                shipControls.setSpeed(0);
                triggerTeleportEffect();
                audioSystem.playSound('warp');
            });
        }
    };

    return {
        setupEventListeners,
        triggerTeleportEffect,
        interceptLinksInContent
    };
}
