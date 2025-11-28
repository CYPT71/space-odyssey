/**
 * Simple radar/minimap rendering closest objects.
 */
import * as THREE from 'three';

export const createRadar = (systems) => {
    const { galaxyManager, shipGroup } = systems;
    const canvas = document.getElementById('radar-canvas');
    const overlay = document.getElementById('radar-overlay');
    const toggle = document.getElementById('radar-toggle');
    if (!canvas || !overlay || !toggle) return { update: () => {} };
    const ctx = canvas.getContext('2d');
    let isOpen = false;

    toggle.addEventListener('click', () => {
        isOpen = !isOpen;
        overlay.classList.toggle('hidden', !isOpen);
    });

    const draw = () => {
        if (!isOpen) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const RADAR_SCALE = 1 / 80_000_000; // adjust scale

        ctx.strokeStyle = 'rgba(0,240,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx, cy, cx - 10, 0, Math.PI * 2);
        ctx.stroke();

        const all = galaxyManager.getAllObjects();
        all.forEach(obj => {
            const ud = obj.userData || {};
            if (!ud.planetData && !ud.isGasCloud && !ud.isNebula && !ud.galaxyData) return;
            const pos = new THREE.Vector3();
            obj.getWorldPosition(pos);
            const dx = (pos.x - shipGroup.position.x) * RADAR_SCALE;
            const dz = (pos.z - shipGroup.position.z) * RADAR_SCALE;
            const x = cx + dx * (cx - 12);
            const y = cy + dz * (cy - 12);
            if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;
            ctx.fillStyle = ud.isGasCloud ? '#0F8' : ud.isNebula ? '#f8f' : ud.galaxyData ? '#f0f' : '#0ff';
            ctx.beginPath();
            ctx.arc(x, y, ud.isGasCloud ? 4 : ud.isNebula ? 3 : 2, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const update = () => {
        draw();
    };

    return { update };
};
