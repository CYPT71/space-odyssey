/**
 * @fileoverview Input Handling Module
 * @author CYPT71
 * @description Handles user input, teleportation, and UI interactions
 */

import * as THREE from 'three';
import { loadControls as loadControlsShared } from '../config/controls.js';
import { getObjectType, getDetectionRange } from './space-object-utils.js';

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

    // Shared history buffer for the reading overlay (guaranteed defined)
    if (!window.readingHistory) window.readingHistory = [];
    // Manual target handle (HUD uses this when set)
    if (typeof window.manualTarget === 'undefined') window.manualTarget = null;

    const scratchVector = new THREE.Vector3();
    let controls = loadControlsShared();

    // Custom confirmation modal (replaces native confirm())
    const showTeleportConfirm = (title, message, onConfirm, onCancel, targetMeta = {}) => {
        const overlay = document.createElement('div');
        overlay.className = 'ap-overlay';

        const modal = document.createElement('div');
        modal.className = 'ap-modal';
        modal.innerHTML = `
            <div class="ap-chrome">
                <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
                <span class="ap-label">AUTOPILOT // FLIGHT CONTROL</span>
            </div>
            <div class="ap-body">
                <h3>${title || 'Pilot Confirmation'}</h3>
                <p>${message || ''}</p>
                <pre class="ap-console">target: ${targetMeta.name || 'unknown'}
type: ${targetMeta.type || 'object'}
distance: ${targetMeta.distance ? `${Math.round(targetMeta.distance / 1000)} km` : 'n/a'}
approach: ${targetMeta.approach || 'standard'}</pre>
            </div>
            <div class="ap-actions">
                <button id="ap-engage">⚡ ENGAGE AUTOPILOT</button>
                <button id="ap-cancel">✕ CANCEL</button>
            </div>
        `;

        const clean = () => {
            modal.remove();
            overlay.remove();
        };

        modal.querySelector('#ap-engage').onclick = () => { clean(); onConfirm && onConfirm(); };
        modal.querySelector('#ap-cancel').onclick = () => { clean(); onCancel && onCancel(); };

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    };

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

        const openUrlInTerminal = (url) => {
            if (!window.readingHistory) window.readingHistory = [];
            const terminalContent = document.getElementById('reading-content');
            if (terminalContent) {
                window.readingHistory.push(terminalContent.innerHTML);
            }
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
                        // Intercept links within newly loaded content
                        interceptLinksInContent(terminalContent);
                    }
                })
                .catch(err => console.error('Failed to load content:', err));
        };

        links.forEach(link => {
            const rawHref = link.getAttribute('href');

            // Skip external links and anchors
            if (!rawHref || rawHref.startsWith('http') || rawHref.startsWith('#')) return;

            link.addEventListener('click', (e) => {
                // Normalize to path
                let href = rawHref;
                try {
                    if (!href.startsWith('/')) {
                        href = new URL(href, window.location.origin).pathname;
                    }
                } catch (_) { /* ignore URL errors */ }

                // Posts post links: open in terminal (no teleport)
                if (href.startsWith('/posts/') || href.includes('/posts/')) {
                    e.preventDefault();
                    openUrlInTerminal(href);
                    return;
                }

                // Try to map to a planet (site pages)
                const allObjects = galaxyManager.getAllObjects();
                const targetPlanet = allObjects.find(obj => {
                    if (!obj.userData?.planetData) return false;
                    const planetUrl = obj.userData.planetData.url;
                    return planetUrl === href || planetUrl.endsWith(href);
                });

                if (targetPlanet) {
                    e.preventDefault();
                    uiManager.closeReadingMode();
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('teleportRequest', {
                            detail: { uuid: targetPlanet.uuid }
                        }));
                    }, 300);
                } else {
                    // Fallback: open the URL in terminal
                    e.preventDefault();
                    openUrlInTerminal(href);
                }
            });
        });
    };

    /**
     * Setup all event listeners
     */
    const setupEventListeners = () => {
        // Pointer lock helpers for fine control
        const requestPointerLock = () => {
            if (document.pointerLockElement !== document.body && document.body.requestPointerLock) {
                document.body.requestPointerLock();
            }
        };
        const exitPointerLock = () => {
            if (document.pointerLockElement === document.body && document.exitPointerLock) {
                document.exitPointerLock();
            }
        };
        const toggleFineControl = () => {
            const on = !shipControls.isFineControlActive();
            shipControls.setFineControl(on);
            const fineBtn = document.getElementById('fine-control');
            if (fineBtn) {
                fineBtn.classList.toggle('active', on);
                fineBtn.textContent = on ? 'Fine Pilot (ON)' : 'Fine Pilot';
            }
            if (on) {
                shipControls.setSpeed(shipControls.getSpeed() / 2);
                requestPointerLock();
            } else {
                exitPointerLock();
            }
        };

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
                showTeleportConfirm(
                    'PILOT CONFIRMATION',
                    `Teleport to galaxy "${galaxyName}"?`,
                    () => {
                        target.getWorldPosition(scratchVector);
                        shipGroup.position.copy(scratchVector);
                        shipGroup.position.y += 50;
                        shipControls.setSpeed(0);
                        triggerTeleportEffect();
                        audioSystem.playSound('warp');
                    }
                );
                return;
            }

            // Handle nebula teleportation (same pattern as galaxy)
            if (target.userData?.isNebula) {
                const nebulaName = target.userData.nebulaName || target.userData.tagName || 'Nebula';
                showTeleportConfirm(
                    'PILOT CONFIRMATION',
                    `Teleport to nebula "${nebulaName}"?`,
                    () => {
                        target.getWorldPosition(scratchVector);
                        shipGroup.position.copy(scratchVector);
                        shipGroup.position.y += 50;
                        shipControls.setSpeed(0);
                        triggerTeleportEffect();
                        audioSystem.playSound('warp');
                    }
                );
                return;
            }

            // Handle gas cloud teleportation (like planet): move near cloud center
            if (target.userData?.isGasCloud) {
                if (!target.geometry?.boundingSphere) {
                    try { target.geometry && target.geometry.computeBoundingSphere(); } catch (_) { /* ignore */ }
                }
                const size = target.geometry?.boundingSphere?.radius || 80000;
                const offset = new THREE.Vector3(0, 0, size + 20000);
                offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);

                const center = new THREE.Vector3();
                target.getWorldPosition(center);
                shipGroup.position.copy(center).add(offset);
                shipGroup.lookAt(center);
                shipControls.setSpeed(0);
                triggerTeleportEffect();
                audioSystem.playSound('warp');
                const name = target.userData.cloudName || target.userData.categoryName || 'Gas Cloud';
                uiManager.updateHUD(0, name);
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

    let targetCycleIndex = 0;

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
                    } else if (closest && closest.isGasCloud && closest.cloudData) {
                        // Build journal list for gas cloud
                        const terminal = document.getElementById('reading-overlay');
                        const terminalContent = document.getElementById('reading-content');
                    const name = closest.obj.userData?.cloudName || closest.obj.userData?.categoryName || 'Gas Cloud';
                    const posts = [
                        ...(closest.cloudData.posts || []),
                        ...Object.values(closest.cloudData.nebulae || {}).flatMap(n => n.posts || [])
                        ];
                        const list = posts.map(p => `<li><a href="${p.url}">${p.title || p.name}</a></li>`).join('');
                        if (terminal && terminalContent) {
                            terminalContent.innerHTML = `<h2>Journal: ${name}</h2><ul>${list}</ul>`;
                            terminal.classList.remove('hidden');
                            uiManager.openReadingMode();
                            interceptLinksInContent(terminalContent);
                        }
                    } else if (closest && closest.isNebula && closest.obj?.userData?.posts) {
                        const terminal = document.getElementById('reading-overlay');
                        const terminalContent = document.getElementById('reading-content');
                        const name = closest.obj.userData.nebulaName || closest.obj.userData.tagName || 'Nebula';
                        const posts = closest.obj.userData.posts || [];
                        const list = posts.map(p => `<li><a href="${p.url}">${p.title || p.name}</a></li>`).join('');
                        if (terminal && terminalContent) {
                            terminalContent.innerHTML = `<h2>Journal: ${name}</h2><ul>${list}</ul>`;
                            terminal.classList.remove('hidden');
                            uiManager.openReadingMode();
                            interceptLinksInContent(terminalContent);
                        }
                    }
                }
            }
            // Lock autopilot on closest with 'l'
            if (e.key.toLowerCase() === 'l') {
                const closest = galaxyManager.findClosest(shipGroup.position);
                if (!closest || !closest.obj) return;
                const targetPos = new THREE.Vector3();
                closest.obj.getWorldPosition(targetPos);
                let stopDistance = 100000;
                const ud = closest.obj.userData || {};
                if (ud.isGasCloud || ud.cloudData) stopDistance = 500000;
                else if (ud.isGalaxy || ud.galaxyData) stopDistance = 0;
                else if (ud.isNebula) stopDistance = 0;
                shipControls.engageAutopilot(targetPos, stopDistance, closest.obj);
                triggerTeleportEffect();
                audioSystem.playSound('warp');
            }
            // Cycle overlapping targets with 'n' or remapped control
            controls = loadControlsShared();
            const cycleKey = (controls.targetCycle || 'n').toLowerCase();
            if (e.key.toLowerCase() === cycleKey) {
                const shipPos = shipGroup.position;
                const all = galaxyManager.getAllObjects();
                const mapped = all
                    .map(obj => {
                        const ud = obj.userData || {};
                        const type = getObjectType(ud);
                        if (type === 'unknown') return null;
                        const pos = new THREE.Vector3();
                        obj.getWorldPosition(pos);
                        const dist = shipPos.distanceTo(pos);
                        const range = getDetectionRange(type);
                        return { obj, dist, type, range };
                    })
                    .filter(Boolean);

                if (!mapped.length) return;
                const minDist = mapped.reduce((m, c) => Math.min(m, c.dist), Infinity);
                const candidates = mapped
                    .filter(c => c.range && c.dist <= Math.min(c.range * 0.25, minDist + 20000))
                    .sort((a, b) => a.dist - b.dist);

                if (!candidates.length) return;
                targetCycleIndex = (targetCycleIndex + 1) % candidates.length;
                const pick = candidates[targetCycleIndex];
                // Just select target, do not move ship
                const ud = pick.obj.userData || {};
                const type = pick.type;
                const name = ud.planetData?.title || ud.planetData?.name ||
                    ud.cloudName || ud.categoryName || ud.cloudData?.name ||
                    ud.nebulaName || ud.tagName ||
                    ud.galaxyName || ud.galaxyData?.name ||
                    'Object';
                const icon = type === 'planet' ? '🌍' : type === 'gasCloud' ? '🌫️' : type === 'nebula' ? '✨' : type === 'galaxy' ? '🌌' : '';
                uiManager.hudTarget.textContent = `TARGET: ${icon} ${name}`;
                window.manualTarget = pick.obj;
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

        // Fine control toggle
        const fineBtn = document.getElementById('fine-control');
        if (fineBtn) {
            fineBtn.addEventListener('click', () => {
                toggleFineControl();
            });
        }

        // Fine control via keyboard toggle
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === controls.fineToggle) {
                toggleFineControl();
            }
        });

        // Mouse steering for fine control
        window.addEventListener('mousemove', (e) => {
            if (!shipControls.isFineControlActive()) return;
            if (uiManager.isReadingMode) return;
            shipControls.applyMouseDelta(e.movementX, e.movementY);
        });

        // Clicking anywhere (except the fine-control button) disengages fine control
        window.addEventListener('click', (e) => {
            const fineBtn = document.getElementById('fine-control');
            const isToggleButton = fineBtn && fineBtn.contains(e.target);
            if (isToggleButton) return;
            if (shipControls.isFineControlActive()) {
                shipControls.setFineControl(false);
            }
            // Cancel all movement on generic click (safety stop)
            shipControls.setSpeed(0);
            shipControls.disengageAutopilot && shipControls.disengageAutopilot();
        });

        // Fine control toggle only via button

        const backBtn = document.getElementById('reading-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const terminal = document.getElementById('reading-overlay');
                const terminalContent = document.getElementById('reading-content');
                if (!terminal || !terminalContent) return;
                if (window.readingHistory && window.readingHistory.length > 0) {
                    const prev = window.readingHistory.pop();
                    terminalContent.innerHTML = prev;
                    terminal.classList.remove('hidden');
                    uiManager.openReadingMode();
                    interceptLinksInContent(terminalContent);
                } else {
                    terminal.classList.add('hidden');
                    uiManager.closeReadingMode();
                    // Full fallback: navigate back to root dashboard to avoid stuck state
                    window.location.href = '/';
                }
            });
        }

        // Escape: cancel autopilot and close reading overlay
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                shipControls.disengageAutopilot && shipControls.disengageAutopilot();
                const terminal = document.getElementById('reading-overlay');
                if (terminal) {
                    terminal.classList.add('hidden');
                    uiManager.closeReadingMode();
                }
                if (shipControls.isFineControlActive()) {
                    shipControls.setFineControl(false);
                }
            }
        });
    };

    return {
        setupEventListeners,
        triggerTeleportEffect,
        interceptLinksInContent
    };
}
