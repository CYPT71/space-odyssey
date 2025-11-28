/**
 * @fileoverview Unit Tests for Unified Space Object Manager
 * @author CYPT71
 */

import { createSpaceObjectManager } from '../theme/assets/js/systems/space-object-manager.js';
import * as THREE from 'three';

// Mock dependencies
jest.mock('../theme/assets/js/galaxy/parser.js', () => ({
    parseFileSystem: jest.fn(() => ({
        root: {
            files: [],
            galaxies: {}
        },
        posts: {
            gasClouds: {}
        }
    }))
}));

jest.mock('../theme/assets/js/galaxy/renderer.js', () => {
    const THREE = require('three');
    return {
        createGalaxy: jest.fn(() => ({
            group: new THREE.Group(),
            planets: [],
            data: { name: 'test' }
        })),
        updateGalaxy: jest.fn()
    };
});

describe('Space Object Manager', () => {
    let mockScene;
    let mockAudioSystem;
    let manager;
    const fileSystemSeed = [
        { path: '/index.md', name: 'index.md', title: 'Home' }
    ];

    beforeEach(() => {
        mockScene = {
            add: jest.fn(),
            remove: jest.fn(),
            traverse: jest.fn()
        };

        mockAudioSystem = {
            playSound: jest.fn()
        };

        // Mock window.fileSystem
        global.window = {
            fileSystem: fileSystemSeed
        };
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        manager = createSpaceObjectManager(mockScene, mockAudioSystem);
    });

    test('should create space object manager', () => {
        expect(manager).toBeDefined();
        expect(manager.initialize).toBeDefined();
        expect(manager.update).toBeDefined();
        expect(manager.getAllObjects).toBeDefined();
        expect(manager.findClosest).toBeDefined();
    });

    test('should initialize with file system data', () => {
        manager.initialize();
        // Initialization should not throw and should return getters
        const galaxies = manager.getGalaxies();
        expect(Array.isArray(galaxies)).toBe(true);
    });

    test('should handle missing file system gracefully', () => {
        global.window.fileSystem = null;
        const newManager = createSpaceObjectManager(mockScene, mockAudioSystem);

        expect(() => newManager.initialize()).not.toThrow();
    });

    test('should get all objects', () => {
        manager.initialize();
        const objects = manager.getAllObjects();
        expect(Array.isArray(objects)).toBe(true);
    });

    test('should find closest object', () => {
        manager.initialize();
        const position = new THREE.Vector3(0, 0, 0);
        const closest = manager.findClosest(position);

        // May be null if no objects in range
        expect(closest === null || typeof closest === 'object').toBe(true);
    });

    test('should get galaxies list', () => {
        manager.initialize();
        const galaxies = manager.getGalaxies();
        expect(Array.isArray(galaxies)).toBe(true);
    });

    test('should get gas clouds list', () => {
        manager.initialize();
        const gasClouds = manager.getGasClouds();
        expect(Array.isArray(gasClouds)).toBe(true);
    });

    test('should update all objects', () => {
        manager.initialize();
        expect(() => manager.update()).not.toThrow();
    });
});

describe('Space Object Manager - Galaxies', () => {
    let mockScene;
    let manager;

    beforeEach(() => {
        mockScene = { add: jest.fn() };

        global.window = {
            fileSystem: [
                { path: '/projects/app1.md', name: 'app1.md' },
                { path: '/projects/app2.md', name: 'app2.md' }
            ]
        };

        manager = createSpaceObjectManager(mockScene, {});
    });

    test('should create galaxies from pages', () => {
        manager.initialize();
        const galaxies = manager.getGalaxies();
        expect(Array.isArray(galaxies)).toBe(true);
    });
});

describe('Space Object Manager - Gas Clouds', () => {
    let mockScene;
    let manager;

    beforeEach(() => {
        mockScene = { add: jest.fn() };

        global.window = {
            fileSystem: [
                { path: '/posts/tech/post1.md', name: 'post1.md' },
                { path: '/posts/tech/post2.md', name: 'post2.md' }
            ]
        };

        manager = createSpaceObjectManager(mockScene, {});
    });

    test('should create gas clouds from posts', () => {
        manager.initialize();
        const gasClouds = manager.getGasClouds();
        expect(Array.isArray(gasClouds)).toBe(true);
    });
});
