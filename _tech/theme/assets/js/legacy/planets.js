// Planets Module
// Manages static and procedural planet generation

import * as THREE from 'three';
import { CSS2DObject } from './css2d-renderer.js';

export class PlanetManager {
    constructor(scene) {
        this.scene = scene;
        this.planetMeshes = [];
        this.planetGeometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.DodecahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0)
        ];

        this.createStaticPlanets();
        this.createProceduralPlanets(50);
    }

    createStaticPlanets() {
        // Get pages from Jekyll
        const pages = window.sitePages || [];

        // Define specific positions for main pages
        const mainPages = {
            '/': { position: { x: 0, y: 0, z: -30 }, color: 0xFFFFFF, size: 6, geometry: new THREE.SphereGeometry(6, 32, 32) },
            '/about/': { position: { x: -50, y: 10, z: -50 }, color: 0x00F0FF, size: 8, geometry: new THREE.IcosahedronGeometry(8, 2) },
            '/experience/': { position: { x: 60, y: -20, z: -80 }, color: 0xFF4040, size: 10, geometry: new THREE.DodecahedronGeometry(10, 1) },
            '/projects/': { position: { x: 0, y: 40, z: -120 }, color: 0x7B61FF, size: 12, geometry: new THREE.OctahedronGeometry(12, 2) }
        };

        pages.forEach((page, index) => {
            const url = page.url;
            const mainPageConfig = mainPages[url];

            if (mainPageConfig) {
                // Main page with specific position
                this.createPlanet({
                    name: page.title.toUpperCase(),
                    url: url,
                    ...mainPageConfig,
                    isProcedural: false
                });
            } else {
                // Other pages - position dynamically
                const angle = (index * Math.PI * 2) / pages.length;
                const radius = 150 + Math.random() * 100;
                const height = (Math.random() - 0.5) * 100;

                const size = Math.random() * 4 + 6;
                const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
                const geometry = this.planetGeometries[Math.floor(Math.random() * this.planetGeometries.length)].clone();
                geometry.scale(size, size, size);

                this.createPlanet({
                    name: page.title.toUpperCase() || page.name.toUpperCase(),
                    url: url,
                    position: {
                        x: Math.cos(angle) * radius,
                        y: height,
                        z: Math.sin(angle) * radius
                    },
                    color: color.getHex(),
                    size: size,
                    geometry: geometry,
                    isProcedural: false
                });
            }
        });
    }

    createProceduralPlanets(count) {
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 4 + 2;
            const x = (Math.random() - 0.5) * 800;
            const y = (Math.random() - 0.5) * 400;
            const z = (Math.random() - 0.5) * 800;

            if (Math.abs(x) < 100 && Math.abs(z) < 100) continue;

            const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
            const geometry = this.planetGeometries[Math.floor(Math.random() * this.planetGeometries.length)].clone();
            geometry.scale(size, size, size);

            this.createPlanet({
                name: `SEC-${Math.floor(Math.random() * 900) + 100}`,
                url: null,
                position: { x, y, z },
                color: color.getHex(),
                size: size,
                geometry: geometry,
                isProcedural: true
            });
        }
    }

    createPlanet(data) {
        const material = new THREE.MeshStandardMaterial({
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.5,
            roughness: 0.7,
            metalness: 0.3
        });

        const planet = new THREE.Mesh(data.geometry, material);
        planet.position.set(data.position.x, data.position.y, data.position.z);
        this.scene.add(planet);
        this.planetMeshes.push(planet);

        // Add rings randomly
        if (Math.random() > 0.7) {
            const ringGeo = new THREE.TorusGeometry(data.size * 1.5, 0.5, 2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }

        // Label
        const div = document.createElement('div');
        div.className = 'planet-label';
        div.textContent = data.name;
        const label = new CSS2DObject(div);
        // Fix: CSS2DObject position is a plain object, not Vector3
        label.position = { x: 0, y: data.size + 10, z: 0 };
        planet.add(label);

        // Content div
        const contentDiv = document.createElement('div');
        contentDiv.className = 'planet-content';
        contentDiv.innerHTML = `
            <div class="terminal-header">${data.name}</div>
            <p>DISTANCE: Calculating...</p>
            ${data.url ? `<p>SYSTEM: ${data.name}</p>` : '<p>STATUS: UNCHARTED</p>'}
        `;
        const contentLabel = new CSS2DObject(contentDiv);
        // Fix: CSS2DObject position is a plain object, not Vector3
        contentLabel.position = { x: 0, y: -(data.size + 5), z: 0 };
        planet.add(contentLabel);

        planet.userData = {
            contentLabel: contentDiv,
            titleLabel: div,
            planetData: data
        };
    }

    spawnProceduralPlanet(shipPosition) {
        const distance = 1500 + Math.random() * 1000;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 1000;

        const x = shipPosition.x + Math.cos(angle) * distance;
        const y = shipPosition.y + height;
        const z = shipPosition.z + Math.sin(angle) * distance;

        const size = Math.random() * 6 + 3;
        const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
        const geometry = this.planetGeometries[Math.floor(Math.random() * this.planetGeometries.length)].clone();
        geometry.scale(size, size, size);

        this.createPlanet({
            name: `SEC-${Math.floor(Math.random() * 9000) + 1000}`,
            url: null,
            position: { x, y, z },
            color: color.getHex(),
            size: size,
            geometry: geometry,
            isProcedural: true
        });
    }

    findClosestPlanet(shipPosition) {
        let closestDist = Infinity;
        let closestPlanet = null;

        this.planetMeshes.forEach(mesh => {
            const dist = shipPosition.distanceTo(mesh.position);
            if (dist < closestDist && dist < 40) {
                closestDist = dist;
                closestPlanet = mesh.userData;
            }
        });

        return closestPlanet;
    }

    update(shipPosition) {
        // Rotate planets
        this.planetMeshes.forEach(mesh => {
            mesh.rotation.y += 0.005;

            const dist = shipPosition.distanceTo(mesh.position);
            const contentDiv = mesh.userData.contentLabel;
            const titleDiv = mesh.userData.titleLabel;

            if (titleDiv && contentDiv) {
                // Title visibility
                if (dist < 100) {
                    titleDiv.style.opacity = 1;
                } else {
                    titleDiv.style.opacity = 0;
                }

                // Content visibility
                if (dist < 40) {
                    contentDiv.classList.add('visible');
                    contentDiv.style.opacity = Math.max(0, 1 - (dist - 20) / 20);
                    contentDiv.style.pointerEvents = 'auto';
                    titleDiv.style.pointerEvents = 'auto';
                } else {
                    contentDiv.classList.remove('visible');
                    contentDiv.style.opacity = 0;
                    contentDiv.style.pointerEvents = 'none';
                    titleDiv.style.pointerEvents = 'none';
                }
            }
        });

        // Spawn new procedural planets occasionally
        if (Math.random() < 0.001) {
            this.spawnProceduralPlanet(shipPosition);
        }
    }
}
