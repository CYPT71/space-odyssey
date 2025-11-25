// Custom CSS2D Renderer
// Minimal implementation without three/examples dependency

import * as THREE from 'three';

export class CSS2DObject extends THREE.Object3D {
    constructor(element) {
        super();
        this.element = element;
        this.element.style.position = 'absolute';
        this.element.style.pointerEvents = 'auto';
    }
}

export class CSS2DRenderer {
    constructor() {
        this.domElement = document.createElement('div');
        this.domElement.style.position = 'absolute';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.pointerEvents = 'none';
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';

        this.cache = new Map();
    }

    setSize(width, height) {
        this.domElement.style.width = width + 'px';
        this.domElement.style.height = height + 'px';
    }

    render(scene, camera) {
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;

        // Traverse scene and render CSS2D objects
        scene.traverse((object) => {
            if (object instanceof CSS2DObject) {
                // Get world position
                const vector = new THREE.Vector3();
                object.getWorldPosition(vector);
                vector.project(camera);

                const x = (vector.x * widthHalf) + widthHalf;
                const y = -(vector.y * heightHalf) + heightHalf;

                // Update element position
                object.element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
                object.element.style.zIndex = (vector.z > 1) ? '0' : '1';
                object.element.style.display = (vector.z > 1) ? 'none' : 'block';

                // Add to DOM if not already there
                if (!object.element.parentNode) {
                    this.domElement.appendChild(object.element);
                }
            }
        });
    }
}
