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

    // Custom confirmation modal (replaces native confirm())
    const showTeleportConfirm = (title, message, onConfirm, onCancel) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9998;';

        const modal = document.createElement('div');
        modal.style.cssText = [
            'position:fixed',
            'top:50%', 'left:50%', 'transform:translate(-50%,-50%)',
            'background:rgba(0,20,40,0.95)',
            'border:2px solid #00F0FF',
            'padding:20px', 'min-width:320px',
            'color:#00F0FF', 'font-family:monospace', 'text-align:center',
            'box-shadow:0 0 20px rgba(0,240,255,0.5)',
            'z-index:9999'
        ].join(';');

        const h = document.createElement('div');
        h.textContent = title || 'Pilot Confirmation';
        h.style.cssText = 'font-weight:bold;font-size:18px;margin-bottom:8px;';
        modal.appendChild(h);

        const p = document.createElement('div');
        p.textContent = message || '';
        p.style.cssText = 'opacity:0.9;margin-bottom:14px;';
        modal.appendChild(p);

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;';

        const yes = document.createElement('button');
        yes.textContent = 'ENGAGE WARP';
        yes.style.cssText = 'padding:8px 14px;border:1px solid #00F0FF;background:transparent;color:#00F0FF;cursor:pointer;';
        yes.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
            onConfirm && onConfirm();
        };

        const no = document.createElement('button');
        no.textContent = 'CANCEL';
        no.style.cssText = 'padding:8px 14px;border:1px solid #FF3366;background:transparent;color:#FF3366;cursor:pointer;';
        no.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(modal);
            onCancel && onCancel();
        };

        btnRow.appendChild(yes);
        btnRow.appendChild(no);
        modal.appendChild(btnRow);

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
                const nebulaName = target.userData.tagName || 'Nebula';
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
                    try { target.geometry && target.geometry.computeBoundingSphere(); } catch (e) { }
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
                const name = target.userData.categoryName || 'Gas Cloud';
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
                        const name = closest.obj.userData?.categoryName || 'Gas Cloud';
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
                        const name = closest.obj.userData.tagName || 'Nebula';
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
