/**
 * @fileoverview Unit Tests for Math Utilities
 * @author CYPT71
 */

import { MathUtils } from '../theme/assets/js/utils/math.js';

describe('Math Utilities', () => {
    describe('clamp', () => {
        test('should clamp value within range', () => {
            expect(MathUtils.clamp(5, 0, 10)).toBe(5);
            expect(MathUtils.clamp(-5, 0, 10)).toBe(0);
            expect(MathUtils.clamp(15, 0, 10)).toBe(10);
        });

        test('should handle edge cases', () => {
            expect(MathUtils.clamp(0, 0, 10)).toBe(0);
            expect(MathUtils.clamp(10, 0, 10)).toBe(10);
        });
    });

    describe('lerp', () => {
        test('should interpolate between values', () => {
            expect(MathUtils.lerp(0, 10, 0.5)).toBe(5);
            expect(MathUtils.lerp(0, 10, 0)).toBe(0);
            expect(MathUtils.lerp(0, 10, 1)).toBe(10);
        });

        test('should handle negative values', () => {
            expect(MathUtils.lerp(-10, 10, 0.5)).toBe(0);
        });
    });

    describe('smoothstep', () => {
        test('should provide smooth interpolation', () => {
            const result = MathUtils.smoothstep(0, 10, 5);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThan(1);
        });

        test('should clamp at edges', () => {
            expect(MathUtils.smoothstep(0, 10, -5)).toBe(0);
            expect(MathUtils.smoothstep(0, 10, 15)).toBe(1);
        });
    });

    describe('randomRange', () => {
        test('should generate random number in range', () => {
            for (let i = 0; i < 100; i++) {
                const result = MathUtils.randomRange(0, 10);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(10);
            }
        });
    });

    describe('degToRad', () => {
        test('should convert degrees to radians', () => {
            expect(MathUtils.degToRad(180)).toBeCloseTo(Math.PI);
            expect(MathUtils.degToRad(90)).toBeCloseTo(Math.PI / 2);
            expect(MathUtils.degToRad(0)).toBe(0);
        });
    });

    describe('radToDeg', () => {
        test('should convert radians to degrees', () => {
            expect(MathUtils.radToDeg(Math.PI)).toBeCloseTo(180);
            expect(MathUtils.radToDeg(Math.PI / 2)).toBeCloseTo(90);
            expect(MathUtils.radToDeg(0)).toBe(0);
        });
    });
});
