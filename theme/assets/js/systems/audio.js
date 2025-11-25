/**
 * @fileoverview Functional audio system (no classes)
 * @author CYPT71
 * @version 2.0.0
 */

import { AUDIO } from '../config/constants.js';

/**
 * Creates audio system (functional approach)
 * @returns {Object} Audio system functions
 */
export const createAudioSystem = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let engineSound = null;
    let warpSound = null;
    let initialized = false;

    /**
     * Creates engine sound oscillator
     * @returns {Object} Oscillator and gain node
     */
    const createEngineSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = AUDIO.ENGINE.TYPE;
        oscillator.frequency.setValueAtTime(AUDIO.ENGINE.BASE_FREQUENCY, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();

        return { oscillator, gainNode };
    };

    /**
     * Creates warp sound oscillator
     * @returns {Object} Oscillator and gain node
     */
    const createWarpSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = AUDIO.WARP.TYPE;
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();

        return { oscillator, gainNode };
    };

    /**
     * Initializes audio on first user interaction
     * @returns {void}
     */
    const initOnUserGesture = () => {
        const handler = () => {
            if (!initialized) {
                engineSound = createEngineSound();
                warpSound = createWarpSound();
                initialized = true;
            }
        };
        document.addEventListener('keydown', handler, { once: true });
    };

    initOnUserGesture();

    /**
     * Updates engine sound based on warp level
     * @param {number} warpLevel - Warp level (0-5)
     * @returns {void}
     */
    const updateEngineSound = (warpLevel) => {
        if (!initialized || !engineSound) return;

        // Validate and clamp warp level
        if (!isFinite(warpLevel)) {
            console.warn('Invalid warpLevel in updateEngineSound:', warpLevel);
            return;
        }

        // Use absolute warp level for frequency lookup (handle reverse)
        const absLevel = Math.abs(warpLevel);
        const clampedLevel = Math.min(absLevel, 5); // Clamp to 0-5 for audio
        const engineFreq = AUDIO.ENGINE.FREQUENCIES[clampedLevel] || AUDIO.ENGINE.BASE_FREQUENCY;

        engineSound.gainNode.gain.setTargetAtTime(
            absLevel > 0 ? AUDIO.ENGINE.VOLUME : 0.01,
            audioContext.currentTime,
            0.05
        );
        engineSound.oscillator.frequency.setTargetAtTime(
            engineFreq,
            audioContext.currentTime,
            0.05
        );
    };

    /**
     * Updates warp sound based on warp level
     * @param {number} warpLevel - Warp level (0-5)
     * @returns {void}
     */
    const updateWarpSound = (warpLevel) => {
        if (!initialized || !warpSound) return;

        // Validate and clamp warp level
        if (!isFinite(warpLevel) || warpLevel === null || warpLevel === undefined) {
            console.warn('Invalid warpLevel in updateWarpSound:', warpLevel);
            return;
        }

        // CRITICAL: Warp 20 should use Warp 5 audio (max available)
        // Clamp warp level to valid audio range (0-5)
        const clampedLevel = Math.min(Math.max(Math.floor(warpLevel), 0), 5);

        if (clampedLevel >= 3) {
            // Map warp level 3-5 to frequency index 0-2
            const freqIndex = Math.min(clampedLevel - 3, 2);
            const frequency = AUDIO.WARP.FREQUENCIES[freqIndex];

            // Extra safety check
            if (!isFinite(frequency)) {
                console.error('Invalid frequency for warp level:', clampedLevel, frequency);
                return;
            }

            warpSound.gainNode.gain.setTargetAtTime(
                AUDIO.WARP.VOLUME,
                audioContext.currentTime,
                0.01
            );
            warpSound.oscillator.frequency.setTargetAtTime(
                frequency,
                audioContext.currentTime,
                0.01
            );
        } else {
            warpSound.gainNode.gain.setTargetAtTime(
                0,
                audioContext.currentTime,
                0.05
            );
        }
    };

    /**
     * Plays boost sound effect
     * @returns {void}
     */
    const playBoostSound = () => {
        if (!initialized || !warpSound) return;

        warpSound.gainNode.gain.setTargetAtTime(
            AUDIO.BOOST.VOLUME,
            audioContext.currentTime,
            0.01
        );
        warpSound.oscillator.frequency.setTargetAtTime(
            AUDIO.BOOST.FREQUENCY,
            audioContext.currentTime,
            0.01
        );

        setTimeout(() => {
            warpSound.gainNode.gain.setTargetAtTime(
                0,
                audioContext.currentTime,
                0.5
            );
        }, AUDIO.BOOST.DURATION);
    };

    /**
     * Plays teleport sound effect
     * @returns {void}
     */
    const playTeleportSound = () => {
        if (!initialized || !warpSound) return;

        warpSound.gainNode.gain.setTargetAtTime(
            AUDIO.TELEPORT.VOLUME,
            audioContext.currentTime,
            0.01
        );
        warpSound.oscillator.frequency.setTargetAtTime(
            AUDIO.TELEPORT.FREQUENCY,
            audioContext.currentTime,
            0.01
        );

        setTimeout(() => {
            warpSound.gainNode.gain.setTargetAtTime(
                0,
                audioContext.currentTime,
                0.3
            );
        }, AUDIO.TELEPORT.DURATION);
    };

    /**
     * Creates ambient space wind (White Noise)
     * @returns {Object} Node
     */
    const createAmbientSound = () => {
        const bufferSize = 2 * audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = audioContext.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100; // Deep rumble

        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.05; // Very quiet base

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        whiteNoise.start();

        return { gainNode, filter };
    };

    let ambientSound = null;

    /**
     * Updates ambient sound based on speed
     * @param {number} speedRatio - 0 to 1
     */
    const updateAmbient = (speedRatio) => {
        if (!initialized) return;
        if (!ambientSound) ambientSound = createAmbientSound();

        // Wind gets louder and higher pitched with speed
        ambientSound.gainNode.gain.setTargetAtTime(0.05 + speedRatio * 0.2, audioContext.currentTime, 0.1);
        ambientSound.filter.frequency.setTargetAtTime(100 + speedRatio * 1000, audioContext.currentTime, 0.1);
    };

    /**
     * Plays scanner sound (Ping)
     */
    const playScanSound = () => {
        if (!initialized) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.5);

        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 1.5);
    };

    /**
     * Generic play sound method
     * @param {string} name - Name of sound to play
     */
    const playSound = (name) => {
        switch (name) {
            case 'warp':
            case 'teleport':
                playTeleportSound();
                break;
            case 'boost':
                playBoostSound();
                break;
            case 'scan':
                playScanSound();
                break;
            default:
                console.warn(`Sound '${name}' not found`);
        }
    };

    return {
        updateEngineSound,
        updateWarpSound,
        updateAmbient, // New
        playBoostSound,
        playTeleportSound,
        playSound
    };
};
