/**
 * @fileoverview Position save/load system
 * @author CYPT71
 */

export const createSaveSystem = (shipGroup) => {
    const SAVE_KEY = 'shipPosition';
    const MAX_SAVES = 3;

    const savePosition = (slotNumber = 0) => {
        if (slotNumber < 0 || slotNumber >= MAX_SAVES) {
            console.error('Invalid save slot');
            return false;
        }

        const saveData = {
            position: {
                x: shipGroup.position.x,
                y: shipGroup.position.y,
                z: shipGroup.position.z
            },
            rotation: {
                x: shipGroup.rotation.x,
                y: shipGroup.rotation.y,
                z: shipGroup.rotation.z
            },
            timestamp: Date.now()
        };

        const saves = getAllSaves();
        saves[slotNumber] = saveData;
        localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
        return true;
    };

    const loadPosition = (slotNumber = 0) => {
        const saves = getAllSaves();
        const saveData = saves[slotNumber];

        if (!saveData) {
            console.warn('No save found in slot', slotNumber);
            return false;
        }

        shipGroup.position.set(
            saveData.position.x,
            saveData.position.y,
            saveData.position.z
        );

        shipGroup.rotation.set(
            saveData.rotation.x,
            saveData.rotation.y,
            saveData.rotation.z
        );

        return true;
    };

    const getAllSaves = () => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('Failed to load saves:', e);
            }
        }
        return {};
    };

    const deleteSave = (slotNumber) => {
        const saves = getAllSaves();
        delete saves[slotNumber];
        localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    };

    // Auto-save every 30 seconds
    setInterval(() => {
        savePosition(0); // Auto-save to slot 0
    }, 30000);

    return { savePosition, loadPosition, getAllSaves, deleteSave };
};
