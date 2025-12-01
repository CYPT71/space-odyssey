import * as THREE from 'three';
import { createProceduralPlanets } from '../theme/assets/js/entities/procedural-planets.js';

describe('procedural planets separation', () => {
  test('planets do not overlap after generation', () => {
    const planets = createProceduralPlanets(25);
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const a = planets[i];
        const b = planets[j];
        const minDist = (a.scale.x + b.scale.x) * 1.5 - 1e-6;
        const d = a.position.distanceTo(b.position);
        expect(d).toBeGreaterThanOrEqual(minDist);
      }
    }
  });
});
