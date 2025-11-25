/**
 * @fileoverview Unit Tests for Procedural Planets
 * @author CYPT71
 */

import { createProceduralPlanets } from '../../theme/assets/js/entities/procedural-planets.js';

// Mock atmosphere system
jest.mock('../../theme/assets/js/systems/atmosphere-system.js', () => ({
    addAtmosphere: jest.fn()
}));

describe('Procedural Planets', () => {
    test('should create specified number of planets', () => {
        const planets = createProceduralPlanets(10);
        expect(planets).toHaveLength(10);
    });

    test('should create planets with unique names', () => {
        const planets = createProceduralPlanets(5);
        const names = planets.map(p => p.userData.planetData.name);
        const uniqueNames = new Set(names);

        expect(uniqueNames.size).toBe(5);
    });

    test('should set isProcedural flag', () => {
        const planets = createProceduralPlanets(3);

        planets.forEach(planet => {
            expect(planet.userData.isProcedural).toBe(true);
        });
    });

    test('should assign rotation speeds', () => {
        const planets = createProceduralPlanets(3);

        planets.forEach(planet => {
            expect(planet.userData.rotationSpeed).toBeDefined();
            expect(planet.userData.rotationSpeed).toBeGreaterThan(0);
        });
    });

    test('should create planets with varying sizes', () => {
        const planets = createProceduralPlanets(10);
        const sizes = planets.map(p => p.scale.x);
        const uniqueSizes = new Set(sizes);

        // Should have variety in sizes
        expect(uniqueSizes.size).toBeGreaterThan(1);
    });

    test('should position planets in 3D space', () => {
        const planets = createProceduralPlanets(5);

        planets.forEach(planet => {
            expect(planet.position.x).toBeDefined();
            expect(planet.position.y).toBeDefined();
            expect(planet.position.z).toBeDefined();

            // Should not all be at origin
            const distance = Math.sqrt(
                planet.position.x ** 2 +
                planet.position.y ** 2 +
                planet.position.z ** 2
            );
            expect(distance).toBeGreaterThan(0);
        });
    });

    test('should add labels to planets', () => {
        const planets = createProceduralPlanets(3);

        planets.forEach(planet => {
            expect(planet.children.length).toBeGreaterThan(0);
        });
    });

    test('should create default 100 planets when no count specified', () => {
        const planets = createProceduralPlanets();
        expect(planets).toHaveLength(100);
    });
});
