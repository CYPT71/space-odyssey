/**
 * @fileoverview Advanced Atmosphere System
 * @author CYPT71
 * @description High-performance atmosphere rendering using Proxies and WeakMaps
 * @version 1.0.0 (Core JS Edition)
 */

import * as THREE from 'three';

// WeakMap to store atmosphere data associated with planet meshes
// Automatically cleaned up when planet mesh is garbage collected
const atmosphereCache = new WeakMap();

/**
 * GLSL Tagged Template for syntax highlighting support in tools
 * and potential preprocessing
 */
const glsl = (strings, ...values) => String.raw({ raw: strings }, ...values);

// Vertex Shader - Fresnel Effect Calculation
const vertexShader = glsl`
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment Shader - Atmospheric Glow with Distance-based Opacity
const fragmentShader = glsl`
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    uniform vec3 color;
    uniform float intensity;
    uniform float power;
    uniform float planetRadius;
    
    void main() {
        // Calculate view direction
        vec3 viewDirection = normalize(-vPosition);
        
        // Fresnel effect: Dot product of view direction and normal
        float fresnel = dot(viewDirection, vNormal);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        
        // Exponential falloff for soft glow
        float atmosphere = pow(fresnel, power);
        
        // Distance-based opacity
        // vPosition is in view space, so length gives distance from camera
        float distanceToCamera = length(vPosition);
        
        // Normalize distance (0 = very close, 1 = far away)
        // At close range (< 2x planet radius), atmosphere becomes transparent
        // At far range (> 10x planet radius), atmosphere is opaque
        float minDist = planetRadius * 2.0;
        float maxDist = planetRadius * 10.0;
        float distanceFactor = smoothstep(minDist, maxDist, distanceToCamera);
        
        // Base opacity: more opaque when far, transparent when close
        float baseOpacity = mix(0.3, 1.0, distanceFactor);
        
        // Combine fresnel glow with distance-based opacity
        float finalAlpha = atmosphere * intensity * baseOpacity;
        
        gl_FragColor = vec4(color, finalAlpha);
    }
`;

/**
 * Creates a reactive atmosphere material using Proxy
 * @param {Object} config - Initial configuration
 * @returns {THREE.ShaderMaterial} The reactive material
 */
const createReactiveMaterial = (config = {}) => {
    const uniforms = {
        color: { value: new THREE.Color(config.color || 0x00aaff) },
        intensity: { value: config.intensity || 1.0 },
        power: { value: config.power || 2.0 },
        planetRadius: { value: config.planetRadius || 1.0 }
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    // Proxy to allow direct property access updating uniforms
    // e.g. material.atmosphereColor = 0xff0000 updates the uniform automatically
    return new Proxy(material, {
        set(target, prop, value) {
            if (prop === 'atmosphereColor') {
                target.uniforms.color.value.set(value);
                return true;
            }
            if (prop === 'atmosphereIntensity') {
                target.uniforms.intensity.value = value;
                return true;
            }
            if (prop === 'atmospherePower') {
                target.uniforms.power.value = value;
                return true;
            }
            // Default behavior for other properties
            target[prop] = value;
            return true;
        },
        get(target, prop) {
            if (prop === 'atmosphereColor') return target.uniforms.color.value;
            if (prop === 'atmosphereIntensity') return target.uniforms.intensity.value;
            if (prop === 'atmospherePower') return target.uniforms.power.value;
            return target[prop];
        }
    });
};

/**
 * Adds an atmosphere to a planet
 * @param {THREE.Mesh} planet - The target planet
 * @param {Object} options - Atmosphere options
 */
export const addAtmosphere = (planet, options = {}) => {
    // Check cache to avoid duplication
    if (atmosphereCache.has(planet)) return atmosphereCache.get(planet);

    const size = options.size || 1.2; // Atmosphere radius multiplier

    // Get planet radius from scale (assuming uniform scale)
    const planetRadius = planet.scale.x || 1.0;

    // Create atmosphere mesh
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = createReactiveMaterial({
        ...options,
        planetRadius: planetRadius
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(size, size, size);

    planet.add(mesh);

    // Store in WeakMap with material reference for updates
    atmosphereCache.set(planet, { mesh, material });

    return mesh;
};

/**
 * Updates atmosphere camera position (call this in animation loop)
 * @param {THREE.Camera} camera - The camera
 */
export const updateAtmosphereCamera = (camera) => {
    // Update all cached atmospheres with camera position
    // Note: WeakMap is not iterable, so this would need to be called
    // per-planet or we'd need a separate Set to track active atmospheres
    // For now, we'll expose this for manual updates
    return (planet) => {
        const cached = atmosphereCache.get(planet);
        if (cached && cached.material) {
            cached.material.uniforms.cameraPosition.value.copy(camera.position);
        }
    };
};

/**
 * Updates all atmospheres (e.g. pulsing effect)
 * Uses a generator for lazy iteration if needed
 */
export function* updateAtmospheres(time) {
    // This is a bit theoretical since WeakMap is not iterable
    // In a real ECS we would have a Set of active atmospheres
    // But for this demo, we assume the scene graph handles updates

    // However, if we wanted to animate them:
    // We would need to track them in a Set alongside the WeakMap
    yield "Atmospheres updated";
}
