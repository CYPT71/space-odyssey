/**
 * Counts total planets in galaxy (including sub-galaxies)
 * @param {Object} galaxy - Galaxy object
 * @returns {number} Total planet count
 */
export const countPlanets = (galaxy) => {
    let count = galaxy.files.length;

    Object.values(galaxy.subGalaxies).forEach(subGalaxy => {
        count += countPlanets(subGalaxy);
    });

    return count;
};

/**
 * Generates unique color for galaxy based on name
 * @param {string} name - Galaxy name
 * @returns {number} Color hex
 */
export const getGalaxyColor = (name) => {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash = hash & hash;
    }

    // Convert to hue (0-360)
    const hue = Math.abs(hash % 360);

    // HSL to RGB conversion (saturation 70%, lightness 60%)
    const s = 0.7;
    const l = 0.6;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (val) => Math.round((val + m) * 255);

    return (toHex(r) << 16) | (toHex(g) << 8) | toHex(b);
};