/**
 * Procedural Texture Generator
 * Generates seamless planet textures using Canvas API
 */

export const createPlanetTexture = (seed = Math.random()) => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base color
    const hue = Math.floor(Math.random() * 360);
    const sat = 50 + Math.random() * 30;
    const lig = 40 + Math.random() * 20;

    ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lig}%)`;
    ctx.fillRect(0, 0, size, size);

    // Noise layers
    for (let i = 0; i < 5; i++) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = size;
        layerCanvas.height = size;
        const layerCtx = layerCanvas.getContext('2d');

        const scale = 2 + Math.random() * 5;

        // Draw random clouds/noise
        for (let j = 0; j < 200; j++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = (Math.random() * size) / scale;

            layerCtx.beginPath();
            layerCtx.arc(x, y, r, 0, Math.PI * 2);
            layerCtx.fillStyle = `hsla(${hue + (Math.random() - 0.5) * 60}, ${sat}%, ${lig + (Math.random() - 0.5) * 40}%, 0.1)`;
            layerCtx.fill();

            // Wrap around for seamlessness (simplified)
            layerCtx.beginPath();
            layerCtx.arc(x + size, y, r, 0, Math.PI * 2);
            layerCtx.fill();
            layerCtx.beginPath();
            layerCtx.arc(x - size, y, r, 0, Math.PI * 2);
            layerCtx.fill();
        }

        ctx.drawImage(layerCanvas, 0, 0);
    }

    // Atmosphere glow
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, `hsla(${hue}, ${sat}%, 80%, 0.5)`);
    grad.addColorStop(0.5, `hsla(${hue}, ${sat}%, 50%, 0)`);
    grad.addColorStop(1, `hsla(${hue}, ${sat}%, 20%, 0.5)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    return canvas;
};
