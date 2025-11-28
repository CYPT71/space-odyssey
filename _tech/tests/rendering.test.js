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
            composer: {
                render: jest.fn()
            },
            labelRenderer: {
                render: jest.fn()
            }
        };
        renderingSystem = createRenderingSystem(mockParams);
    });

    test('should create rendering system', () => {
        expect(renderingSystem).toBeDefined();
        expect(renderingSystem.render).toBeDefined();
    });

    test('should call composer.render', () => {
        renderingSystem.render();
        expect(mockParams.composer.render).toHaveBeenCalled();
    });

    test('should call labelRenderer.render with scene and camera', () => {
        renderingSystem.render();
        expect(mockParams.labelRenderer.render).toHaveBeenCalledWith(
            mockParams.scene,
            mockParams.camera
        );
    });
});
