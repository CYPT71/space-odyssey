/**
 * @fileoverview Octree for spatial partitioning
 * @author CYPT71
 * @description Accelerates spatial queries (findClosest) from O(n) to O(log n)
 */

import * as THREE from 'three';
import { dist3 } from '../native/fast-math.js';

const MAX_DEPTH = 8;
const MAX_OBJECTS = 16; // Split if more than this

class OctreeNode {
    constructor(bounds, depth = 0) {
        this.bounds = bounds; // THREE.Box3
        this.depth = depth;
        this.objects = [];
        this.children = null; // Array of 8 nodes if split
    }

    split() {
        const min = this.bounds.min;
        const max = this.bounds.max;
        const mid = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);

        this.children = [];

        for (let x = 0; x < 2; x++) {
            for (let y = 0; y < 2; y++) {
                for (let z = 0; z < 2; z++) {
                    const childMin = new THREE.Vector3(
                        x === 0 ? min.x : mid.x,
                        y === 0 ? min.y : mid.y,
                        z === 0 ? min.z : mid.z
                    );
                    const childMax = new THREE.Vector3(
                        x === 0 ? mid.x : max.x,
                        y === 0 ? mid.y : max.y,
                        z === 0 ? mid.z : max.z
                    );
                    this.children.push(new OctreeNode(new THREE.Box3(childMin, childMax), this.depth + 1));
                }
            }
        }

        // Re-distribute existing objects
        const oldObjects = this.objects;
        this.objects = [];
        oldObjects.forEach(obj => this.insert(obj));
    }

    insert(obj) {
        const pos = new THREE.Vector3();
        obj.getWorldPosition(pos);

        if (!this.bounds.containsPoint(pos)) return false;

        if (!this.children && this.objects.length < MAX_OBJECTS || this.depth >= MAX_DEPTH) {
            this.objects.push(obj);
            return true;
        }

        if (!this.children) this.split();

        for (const child of this.children) {
            if (child.insert(obj)) return true;
        }

        // Should not happen if bounds check passed, but fallback
        return false;
    }

    findClosest(point, maxDist, bestObj = null, bestDist = Infinity) {
        // Prune if bounds are too far
        // Distance from point to box
        const clamped = point.clone().clamp(this.bounds.min, this.bounds.max);
        const distToBox = dist3(point.x, point.y, point.z, clamped.x, clamped.y, clamped.z);

        if (distToBox > bestDist && distToBox > maxDist) return { bestObj, bestDist };

        // Check local objects
        const scratchPos = new THREE.Vector3();
        for (const obj of this.objects) {
            obj.getWorldPosition(scratchPos);
            const d = dist3(point.x, point.y, point.z, scratchPos.x, scratchPos.y, scratchPos.z);
            if (d < bestDist && d < maxDist) {
                // Check type-specific range logic if needed, but for raw closest, this is fine.
                // The manager handles type checks.
                bestDist = d;
                bestObj = obj;
            }
        }

        if (this.children) {
            // Sort children by distance to point to visit likely candidates first
            const sortedChildren = this.children.map(child => {
                const c = child.bounds.getCenter(new THREE.Vector3());
                return { node: child, dist: dist3(point.x, point.y, point.z, c.x, c.y, c.z) };
            }).sort((a, b) => a.dist - b.dist);

            for (const item of sortedChildren) {
                const result = item.node.findClosest(point, maxDist, bestObj, bestDist);
                bestObj = result.bestObj;
                bestDist = result.bestDist;
            }
        }

        return { bestObj, bestDist };
    }
}

export class Octree {
    constructor(size = 100000000) { // Default 100M universe size
        const min = new THREE.Vector3(-size, -size, -size);
        const max = new THREE.Vector3(size, size, size);
        this.root = new OctreeNode(new THREE.Box3(min, max));
    }

    insert(obj) {
        this.root.insert(obj);
    }

    findClosest(point, maxDist = Infinity) {
        return this.root.findClosest(point, maxDist).bestObj;
    }

    rebuild(objects) {
        // Simple rebuild strategy
        const size = this.root.bounds.max.x;
        const min = new THREE.Vector3(-size, -size, -size);
        const max = new THREE.Vector3(size, size, size);
        this.root = new OctreeNode(new THREE.Box3(min, max));

        objects.forEach(obj => this.insert(obj));
    }
}
