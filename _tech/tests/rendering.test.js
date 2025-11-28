/**
 * @fileoverview Unit Tests for Rendering System
 * @author CYPT71
 */

import { createRenderingSystem } from '../theme/assets/js/core/rendering.js';

describe('Rendering System', () => {
    let mockParams;
    let renderingSystem;

    beforeEach(() => {
        mockParams = {
            scene: {},
            camera: {},
            renderer: { render: jest.fn() },
            composer: {
                render: jest.fn()
            },
            labelRenderer: {
                render: jest.fn()
            }
        };
        renderingSystem = createRenderingSystem({ ...mockParams, usePostProcessing: true });
    });

    test('should create rendering system', () => {
        expect(renderingSystem).toBeDefined();
        expect(renderingSystem.render).toBeDefined();
    });

    test('should call composer.render', () => {
        renderingSystem.render();
        expect(mockParams.composer.render).toHaveBeenCalled();
    });

    test('should call renderer.render when post-processing disabled or XR', () => {
        renderingSystem.setPostProcessing(false);
        renderingSystem.render();
        expect(mockParams.renderer.render).toHaveBeenCalled();
        renderingSystem.setPostProcessing(true);
        renderingSystem.setXRActive(true);
        renderingSystem.render();
        expect(mockParams.renderer.render).toHaveBeenCalledTimes(2);
    });

    test('should call labelRenderer.render with scene and camera', () => {
        renderingSystem.render();
        expect(mockParams.labelRenderer.render).toHaveBeenCalledWith(
            mockParams.scene,
            mockParams.camera
        );
    });
});
