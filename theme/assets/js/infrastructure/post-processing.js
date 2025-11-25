// Custom Post-Processing
// Minimal bloom effect without three/examples dependencies

import * as THREE from 'three';

export class SimpleComposer {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Create bloom render target
        this.bloomTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        );

        // Simple bloom material
        this.bloomMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                bloomStrength: { value: 0.5 },
                bloomRadius: { value: 0.4 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float bloomStrength;
                uniform float bloomRadius;
                varying vec2 vUv;
                
                void main() {
                    vec4 color = texture2D(tDiffuse, vUv);
                    
                    // Simple bloom by brightening bright areas
                    float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
                    if (brightness > 0.8) {
                        color.rgb += color.rgb * bloomStrength;
                    }
                    
                    gl_FragColor = color;
                }
            `
        });

        // Fullscreen quad for post-processing
        this.quad = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            this.bloomMaterial
        );
        this.quadScene = new THREE.Scene();
        this.quadScene.add(this.quad);
        this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    setSize(width, height) {
        this.bloomTarget.setSize(width, height);
    }

    render() {
        // Render scene to texture
        this.renderer.setRenderTarget(this.bloomTarget);
        this.renderer.render(this.scene, this.camera);

        // Apply bloom and render to screen
        this.bloomMaterial.uniforms.tDiffuse.value = this.bloomTarget.texture;
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.quadScene, this.quadCamera);
    }
}
