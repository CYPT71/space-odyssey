/**
 * 
 * @returns Object with requestPointerLock and exitPointerLock functions
 */
export const createPointerLock = () => {
    const requestPointerLock = () => {
        if (document.pointerLockElement !== document.body && document.body.requestPointerLock) {
            document.body.requestPointerLock();
        }
    };

    const exitPointerLock = () => {
        if (document.pointerLockElement === document.body && document.exitPointerLock) {
            document.exitPointerLock();
        }
    };

    return { requestPointerLock, exitPointerLock };
};
