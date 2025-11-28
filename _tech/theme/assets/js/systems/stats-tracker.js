/**
 * @fileoverview Travel statistics tracker
 * @author CYPT71
 */

export const createStatsTracker = () => {
    // Load saved stats or initialize
    const loadStats = () => {
        const saved = localStorage.getItem('travelStats');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load stats:', e);
            }
        }
        return {
            totalDistance: 0,
            planetsVisited: new Set(),
            timeInWarp: 0,
            maxSpeed: 0,
            sessionStart: Date.now()
        };
    };

    const stats = loadStats();
    const lastPosition = { x: 0, y: 0, z: 0 };

    const update = (shipPosition, currentSpeed, warpLevel) => {
        // Calculate distance traveled
        const dx = shipPosition.x - lastPosition.x;
        const dy = shipPosition.y - lastPosition.y;
        const dz = shipPosition.z - lastPosition.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        stats.totalDistance += distance;

        // Update last position
        lastPosition.x = shipPosition.x;
        lastPosition.y = shipPosition.y;
        lastPosition.z = shipPosition.z;

        // Track max speed
        if (Math.abs(currentSpeed) > stats.maxSpeed) {
            stats.maxSpeed = Math.abs(currentSpeed);
        }

        // Track time in warp
        if (warpLevel > 0) {
            stats.timeInWarp += 1 / 60; // Assuming 60 FPS
        }
    };

    const visitPlanet = (planetName) => {
        stats.planetsVisited.add(planetName);
        save();
    };

    const save = () => {
        const toSave = {
            ...stats,
            planetsVisited: Array.from(stats.planetsVisited)
        };
        localStorage.setItem('travelStats', JSON.stringify(toSave));
    };

    const getStats = () => ({
        totalDistance: Math.floor(stats.totalDistance),
        planetsVisited: stats.planetsVisited.size,
        timeInWarp: Math.floor(stats.timeInWarp),
        maxSpeed: Math.floor(stats.maxSpeed),
        sessionTime: Math.floor((Date.now() - stats.sessionStart) / 1000)
    });

    const reset = () => {
        stats.totalDistance = 0;
        stats.planetsVisited = new Set();
        stats.timeInWarp = 0;
        stats.maxSpeed = 0;
        stats.sessionStart = Date.now();
        save();
    };

    return { update, visitPlanet, getStats, save, reset };
};
