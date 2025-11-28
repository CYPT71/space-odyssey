/**
 * @fileoverview Rendering Module
 * @author CYPT71
 * @description Handles all rendering logic and visual updates
 */

/**
 * Creates the rendering system
 * @param {Object} params - Rendering parameters
 * @param {THREE.Scene} params.scene - The scene
 * @param {THREE.Camera} params.camera - The camera
 * @param {THREE.WebGLRenderer} params.composer - Post-processing composer
 * @param {CSS2DRenderer} params.labelRenderer - Label renderer
 * @returns {Object} Rendering functions
 */
export function createRenderingSystem({ scene, camera, composer, labelRenderer }) {
    /**
     * Renders a single frame
     */
    const render = () => {
        composer.render();
        labelRenderer.render(scene, camera);
    };

    return { render };
}
