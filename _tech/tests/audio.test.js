/**
 * @fileoverview Unit Tests for Audio System
 * @author CYPT71
 */

import { createAudioSystem } from '../theme/assets/js/systems/audio.js';

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
    createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 0 }
    })),
    createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 1, setValueAtTime: jest.fn() }
    })),
    createBiquadFilter: jest.fn(() => ({
        connect: jest.fn(),
        frequency: { value: 1000 },
        type: 'lowpass'
    })),
    destination: {},
    currentTime: 0
}));

describe('Audio System', () => {
    let audioSystem;

    beforeEach(() => {
        audioSystem = createAudioSystem();
    });

    test('should create audio system', () => {
        expect(audioSystem).toBeDefined();
        expect(audioSystem.playSound).toBeDefined();
        expect(audioSystem.updateEngineSound).toBeDefined();
        expect(audioSystem.updateWarpSound).toBeDefined();
        expect(audioSystem.updateAmbient).toBeDefined();
    });

    test('should play warp sound', () => {
        expect(() => audioSystem.playSound('warp')).not.toThrow();
    });

    test('should play scan sound', () => {
        expect(() => audioSystem.playSound('scan')).not.toThrow();
    });

    test('should update engine sound based on warp factor', () => {
        expect(() => audioSystem.updateEngineSound(3)).not.toThrow();
    });

    test('should update warp sound based on warp factor', () => {
        expect(() => audioSystem.updateWarpSound(5)).not.toThrow();
    });

    test('should update ambient sound based on speed ratio', () => {
        expect(() => audioSystem.updateAmbient(0.8)).not.toThrow();
    });

    test('should handle invalid sound names gracefully', () => {
        expect(() => audioSystem.playSound('invalid')).not.toThrow();
    });
});
