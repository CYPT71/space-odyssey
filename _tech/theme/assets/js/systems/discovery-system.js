/**
 * @fileoverview Discovery system for planets
 * @author CYPT71
 */

export const createDiscoverySystem = () => {
    const DISCOVERY_KEY = 'discoveredPlanets';
    const DISCOVERY_RANGE = 50000; // Distance pour découvrir une planète

    const discovered = new Set(loadDiscovered());

    function loadDiscovered() {
        const saved = localStorage.getItem(DISCOVERY_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load discoveries:', e);
            }
        }
        return [];
    }

    const checkDiscovery = (shipPosition, planets) => {
        const newDiscoveries = [];

        planets.forEach(planet => {
            const planetData = planet.userData?.planetData;
            if (!planetData) return;

            const name = planetData.name || planetData.title;
            if (!name || discovered.has(name)) return;

            // Calculate distance
            const dx = planet.position.x - shipPosition.x;
            const dy = planet.position.y - shipPosition.y;
            const dz = planet.position.z - shipPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < DISCOVERY_RANGE) {
                discovered.add(name);
                newDiscoveries.push(name);
            }
        });

        if (newDiscoveries.length > 0) {
            save();
        }

        return newDiscoveries;
    };

    const save = () => {
        localStorage.setItem(DISCOVERY_KEY, JSON.stringify(Array.from(discovered)));
    };

    const isDiscovered = (planetName) => discovered.has(planetName);

    const getDiscoveryCount = () => discovered.size;

    const getDiscoveryPercentage = (totalPlanets) => {
        if (totalPlanets === 0) return 0;
        return Math.floor((discovered.size / totalPlanets) * 100);
    };

    const reset = () => {
        discovered.clear();
        save();
    };

    return {
        checkDiscovery,
        isDiscovered,
        getDiscoveryCount,
        getDiscoveryPercentage,
        reset
    };
};
