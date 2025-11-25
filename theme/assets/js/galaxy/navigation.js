/**
 * @fileoverview Galaxy navigation system (functional)
 * @author CYPT71
 * @version 2.0.0
 */

import { createReactiveState } from '../core/reactive.js';

/**
 * Creates navigation system (functional)
 * @param {Object} audioSystem - Audio system
 * @returns {Object} Navigation functions
 */
export const createNavigationSystem = (audioSystem) => {
    const state = createReactiveState({
        currentLevel: 'universe',
        currentGalaxy: null,
        breadcrumb: [],
        galaxyTree: null
    }, (prop, value) => {
        if (prop === 'breadcrumb') {
            updateBreadcrumbUI();
        }
    });

    /**
     * Updates breadcrumb UI
     * @returns {void}
     */
    const updateBreadcrumbUI = () => {
        const breadcrumbEl = document.getElementById('breadcrumb');
        if (!breadcrumbEl) return;

        const path = ['UNIVERSE', ...state.breadcrumb];

        breadcrumbEl.innerHTML = path
            .map((item, i) => {
                if (i === path.length - 1) {
                    return `<span class="current">${item}</span>`;
                }
                return `<a href="#" data-level="${i}">${item}</a>`;
            })
            .join(' &gt; ');

        // Add click handlers
        breadcrumbEl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const level = parseInt(e.target.dataset.level);
                navigateToLevel(level);
            });
        });
    };

    /**
     * Navigates to specific breadcrumb level
     * @param {number} level - Level index
     * @returns {void}
     */
    const navigateToLevel = (level) => {
        if (level === 0) {
            exitToUniverse();
        } else {
            // Navigate to specific galaxy in breadcrumb
            state.breadcrumb = state.breadcrumb.slice(0, level);
            state.currentGalaxy = state.breadcrumb[state.breadcrumb.length - 1];
        }
    };

    /**
     * Enters a galaxy
     * @param {string} galaxyName - Galaxy name
     * @param {Function} onEnter - Callback when entered
     * @returns {void}
     */
    const enterGalaxy = (galaxyName, onEnter) => {
        // Play warp sound
        if (audioSystem) {
            audioSystem.playTeleportSound();
        }

        // Update state
        state.currentLevel = 'galaxy';
        state.currentGalaxy = galaxyName;
        state.breadcrumb = [...state.breadcrumb, galaxyName];

        // Callback for visual transition
        if (onEnter) {
            onEnter(galaxyName);
        }
    };

    /**
     * Exits current galaxy
     * @param {Function} onExit - Callback when exited
     * @returns {void}
     */
    const exitGalaxy = (onExit) => {
        state.breadcrumb.pop();

        if (state.breadcrumb.length === 0) {
            exitToUniverse();
        } else {
            state.currentGalaxy = state.breadcrumb[state.breadcrumb.length - 1];
        }

        if (onExit) {
            onExit();
        }
    };

    /**
     * Exits to universe view
     * @returns {void}
     */
    const exitToUniverse = () => {
        state.currentLevel = 'universe';
        state.currentGalaxy = null;
        state.breadcrumb = [];
    };

    /**
     * Gets current galaxy data
     * @returns {Object|null} Current galaxy data
     */
    const getCurrentGalaxy = () => {
        if (!state.galaxyTree || state.breadcrumb.length === 0) {
            return null;
        }

        let current = state.galaxyTree.root.galaxies[state.breadcrumb[0]];

        for (let i = 1; i < state.breadcrumb.length; i++) {
            current = current.subGalaxies[state.breadcrumb[i]];
        }

        return current;
    };

    // Setup keyboard shortcut (Backspace to go back)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && state.breadcrumb.length > 0) {
            e.preventDefault();
            exitGalaxy();
        }
    });

    return {
        enterGalaxy,
        exitGalaxy,
        exitToUniverse,
        getCurrentGalaxy,
        get currentLevel() { return state.currentLevel; },
        get breadcrumb() { return state.breadcrumb; },
        setGalaxyTree: (tree) => { state.galaxyTree = tree; }
    };
};
