/**
 * @fileoverview Shared volumetric cloud factory for galaxy-like and nebula-like clouds.
 * @description High-performance point cloud generator with configurable behavior.
 */

import * as THREE from 'three';
import { CSS2DObject } from '../infrastructure/css2d-renderer.js';
import { mulAdd } from '../native/native-math.js';
import { openObjectTerminal } from '../core/hud/index.js';
import { isMobile } from '../utils/device.js';

const colorCache = new Map();
const materialCache = new Map();
const geometryPool = new Map(); // key: particleCount -> BufferGeometry
const scratchColor = new THREE.Color();
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Hash string to a stable color (cached)
 * @param {string} str - Source string
 * @returns {THREE.Color} Color
 */
export const hashStringToColor = (str = '') => {
    if (!str) return new THREE.Color(1, 1, 1);
    const cached = colorCache.get(str);
    if (cached) return cached.clone();

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = (hash % 360) / 360;
    const color = new THREE.Color().setHSL(hue, 0.7, 0.6);
    colorCache.set(str, color);
    return color.clone();
};

/**
 * Creates a volumetric particle cloud according to the provided config.
 * Does not add to a scene; callers keep control over scene graph placement.
 *
 * @param {Object} params
 * @param {THREE.Vector3} params.center - Cloud center
 * @param {string} params.name - Identifier for hashing/labels
 * @param {number} params.count - Logical item count (posts/files)
 * @param {Object} params.config - Behavior configuration
 * @param {THREE.Color|null} [params.parentColor] - Optional parent color hint
 * @param {Object|Function} [params.extraUserData] - Extra userData payload or factory
 * @returns {THREE.Points} Configured particle cloud
 */
export const createVolumetricCloud = ({
    center = new THREE.Vector3(),
    name = 'cloud',
    count = 0,
    config,
    parentColor = null,
    extraUserData = {}
}) => {
    const {
        particleMultiplier = 1,
        particleCap = 1,
        baseRadius = 1,
        radiusPerUnit = 0,
        distributionPower = 0.5,
        baseColorFn = hashStringToColor,
        colorJitterFn = (c) => c,
        sizeFn = null,
        material = {},
        labelClass = 'planet-label',
        labelTextFn = (n) => n,
        labelHeightFn = () => 0,
        spaceType = 'nebula'
    } = config || {};

    const particleCount = Math.max(1, Math.min(Math.floor((count || 1) * particleMultiplier), particleCap));
    // WASM-accelerated mulAdd; falls back to JS without blocking
    const radius = mulAdd(Math.floor(count || 0), Math.floor(radiusPerUnit), Math.floor(baseRadius));

    let geometry = geometryPool.get(particleCount);
    let positions, colors, sizes;
    if (!geometry) {
        geometry = new THREE.BufferGeometry();
        positions = new Float32Array(particleCount * 3);
        colors = new Float32Array(particleCount * 3);
        sizes = sizeFn ? new Float32Array(particleCount) : null;
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        if (sizes) geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometryPool.set(particleCount, geometry);
    } else {
        positions = geometry.getAttribute('position').array;
        colors = geometry.getAttribute('color').array;
        sizes = sizeFn ? (geometry.getAttribute('size')?.array || new Float32Array(particleCount)) : null;
        if (sizeFn && !geometry.getAttribute('size')) {
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        }
    }

    const baseColor = baseColorFn(name, parentColor).clone();

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = radius * Math.pow(Math.random(), distributionPower);
        const distRatio = r / radius;

        positions[i3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = r * Math.cos(phi);

        const c = colorJitterFn(baseColor, distRatio, scratchColor);
        colors[i3] = clamp01(c.r);
        colors[i3 + 1] = clamp01(c.g);
        colors[i3 + 2] = clamp01(c.b);

        if (sizes) {
            sizes[i] = sizeFn(distRatio);
        }
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    if (sizes && geometry.attributes.size) geometry.attributes.size.needsUpdate = true;

    const materialOptions = {
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        ...material
    };
    const matKey = JSON.stringify(materialOptions);
    const cachedMat = materialCache.get(matKey);
    const matInstance = cachedMat || new THREE.PointsMaterial(materialOptions);
    if (!cachedMat) materialCache.set(matKey, matInstance);

    const points = new THREE.Points(geometry, matInstance);
    points.position.copy(center);

    const labelDiv = document.createElement('div');
    labelDiv.className = labelClass;
    labelDiv.textContent = labelTextFn(name);
    labelDiv.style.pointerEvents = 'auto';
    labelDiv.style.cursor = 'pointer';
    labelDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isMobile()) return;
        if (openObjectTerminal(points)) return;
        if (window.teleportTo) window.teleportTo(points.uuid);
    });
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, labelHeightFn(radius), 0);
    points.add(label);

    const userDataPayload = typeof extraUserData === 'function'
        ? extraUserData({ name, count, radius, baseColor })
        : extraUserData;

    points.userData = {
        center: center.clone(),
        baseColor: baseColor.clone(),
        radius,
        spaceType,
        ...userDataPayload
    };

    if (typeof config.onCreated === 'function') {
        config.onCreated({ cloud: points, radius, baseColor, count, name });
    }

    return points;
};
