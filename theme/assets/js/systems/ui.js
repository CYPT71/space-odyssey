/**
 * @fileoverview Functional UI manager (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Creates UI manager (functional approach)
 * @param {Object} audioSystem - Audio system
 * @returns {Object} UI manager functions
 */
export const createUIManager = (audioSystem) => {
    // Check if reading overlay is visible (it is by default now)
    const readingOverlay = document.getElementById('reading-overlay');
    let isReadingMode = readingOverlay && !readingOverlay.classList.contains('hidden');
    let boostCooldown = false;

    // DOM elements
    // DOM elements
    const hudTarget = document.getElementById('hud-target');
    const hudDistance = document.getElementById('hud-distance');
    const warpBoostBtn = document.getElementById('warp-boost');
    // readingOverlay already declared above
    const closeBtn = document.getElementById('reading-close');

    /**
     * Opens reading mode
     * @returns {void}
     */
    const openReadingMode = () => {
        isReadingMode = true;
        if (readingOverlay) {
            readingOverlay.classList.remove('hidden');
        }
    };

    /**
     * Closes reading mode
     * @returns {void}
     */
    const closeReadingMode = () => {
        isReadingMode = false;
        if (readingOverlay) {
            readingOverlay.classList.add('hidden');
        }

        // Also close old terminal screen if present
        const terminalScreen = document.getElementsByClassName('terminal-screen')[0];
        if (terminalScreen) {
            terminalScreen.style.opacity = '0';
            setTimeout(() => {
                terminalScreen.style.display = 'none';
            }, 300);
        }
    };

    /**
     * Activates warp boost
     * @returns {boolean} True if boost activated
     */
    const activateWarpBoost = () => {
        if (boostCooldown) return false;

        warpBoostBtn.disabled = true;
        warpBoostBtn.textContent = '⚡ COOLDOWN: 3s';

        audioSystem.playBoostSound();

        boostCooldown = true;
        let countdown = 3;

        const cooldownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                warpBoostBtn.textContent = `⚡ COOLDOWN: ${countdown}s`;
            } else {
                clearInterval(cooldownInterval);
                warpBoostBtn.disabled = false;
                warpBoostBtn.textContent = '⚡ ENGAGE WARP 5';
                boostCooldown = false;
            }
        }, 1000);

        return true;
    };

    /**
     * Updates HUD display
     * @param {number} warpFactor - Warp factor
     * @param {Object} closestPlanet - Closest planet data
     * @param {number} speed - Current speed
     * @returns {void}
     */
    const updateHUD = (warpFactor, closestPlanet, speed) => {
        if (hudDistance) {
            if (warpFactor > 0) {
                const speedDisplay = speed >= 0 ? `WARP: ${warpFactor}` : `WARP: -${warpFactor}`;
                hudDistance.textContent = speedDisplay;
                hudDistance.style.color = warpFactor >= 4 ? '#ff3300' : '#00F0FF';
            } else {
                hudDistance.textContent = 'IMPULSE';
                hudDistance.style.color = '#00F0FF';
            }
        }

        if (hudTarget) {
            if (closestPlanet && closestPlanet.planetData) {
                // Afficher la distance à la planète
                const distance = closestPlanet.distance || 0;
                const distanceDisplay = distance < 1 ? '0u' : `${Math.floor(distance)}u`;
                hudTarget.textContent = `TARGET: ${closestPlanet.planetData.name} - ${distanceDisplay}`;
            } else {
                hudTarget.textContent = 'TARGET: NONE';
            }
        }
    };

    // Setup event listeners
    if (warpBoostBtn) {
        warpBoostBtn.addEventListener('click', activateWarpBoost);
    }

    // Handle close button via delegation (more robust)
    // Handle close button via delegation (more robust)
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('#reading-close');
        if (closeBtn) {
            closeReadingMode();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isReadingMode) closeReadingMode();
    });

    return {
        openReadingMode,
        closeReadingMode,
        activateWarpBoost,
        updateHUD,
        get isReadingMode() { return isReadingMode; },
        hudTarget,
        hudDistance
    };
};

/**
 * Planet teleportation function
 * @param {string} planetName - Planet name
 * @returns {void}
 */
window.teleportToPlanet = function (planetName) {
    if (window.teleportToPlanetImpl) {
        window.teleportToPlanetImpl(planetName);
    }
};
