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
 * @param {THREE.WebGLRenderer} params.renderer - WebGL renderer
 * @param {THREE.WebGLRenderer} params.composer - Post-processing composer
 * @param {CSS2DRenderer} params.labelRenderer - Label renderer
 * @param {boolean} params.usePostProcessing - Whether to render via composer
 * @returns {Object} Rendering functions
 */
export function createRenderingSystem({ scene, camera, renderer, composer, labelRenderer, usePostProcessing = true }) {
    let xrActive = false;
    let postProcessingEnabled = usePostProcessing;

    /**
     * Renders a single frame
     */
    const render = () => {
        if (!xrActive && postProcessingEnabled) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
        labelRenderer.render(scene, camera);
    };

    return {
        render,
        setXRActive: (on) => { xrActive = !!on; },
        setPostProcessing: (on) => { postProcessingEnabled = !!on; }
    };
}
