import * as THREE from 'three';
import { createStarfield, updateStarfield } from './particles/starfield.js';
import { createLightParticles, updateLightParticles } from './particles/lights.js';
import { createSpeedTrails, updateTrails } from './particles/trails.js';

const STARFIELD_SPAN = 1e8;
const UNIVERSE_SIZE = 1e8;
const STAR_COUNT = 50000;
const LIGHT_COUNT = 200;
const TRAIL_MAX = 100;

export class ParticleSystem {
  constructor(scene, shipGroup) {
    this.scene = scene;
    this.shipGroup = shipGroup;
    this.lightParticlesCount = LIGHT_COUNT;
    this.maxTrailParticles = TRAIL_MAX;
    this.trailIndexRef = { value: 0 };
    this.tempVecRef = { current: null };

    const starfield = createStarfield(scene, STARFIELD_SPAN, STAR_COUNT);
    this.starMesh = starfield.mesh;
    this.starMaterial = starfield.material;
    this.starsCount = starfield.count;

    this.lightParticles = createLightParticles(scene, this.lightParticlesCount);
    this.trailParticles = createSpeedTrails(scene, this.maxTrailParticles);
  }

  update(speed, isWarp20 = false) {
    const absSpeed = Math.abs(speed);
    updateStarfield(
      {
        mesh: this.starMesh,
        material: this.starMaterial,
        count: this.starsCount,
        span: UNIVERSE_SIZE
      },
      this.shipGroup.position,
      speed,
      isWarp20
    );

    updateLightParticles(this.lightParticles, this.lightParticlesCount, this.shipGroup.position, speed);

    updateTrails(
      this.trailParticles,
      this.maxTrailParticles,
      this.shipGroup,
      absSpeed,
      this.tempVecRef,
      this.trailIndexRef
    );
  }
}
