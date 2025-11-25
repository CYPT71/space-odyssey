/**
 * @fileoverview Settings panel for control configuration
 * @author CYPT71
 * @version 2.0.0
 */

/**
 * Creates settings panel manager
 * @returns {Object} Settings panel functions
 */
export const createSettingsPanel = () => {
    const panel = document.getElementById('settings-panel');
    const settingsBtn = document.getElementById('settings-button');
    const closeBtn = panel?.querySelector('.close-settings');
    const saveBtn = panel?.querySelector('.settings-btn:not(.reset)');
    const resetBtn = panel?.querySelector('.settings-btn.reset');

    let currentRecording = null;
    const defaultControls = {
        forward: 'z',
        backward: 's',
        yawLeft: 'q',
        yawRight: 'd',
        pitchUp: 'w',
        pitchDown: 'x',
        rollLeft: 'r',
        rollRight: 'f',
        strafeLeft: 'a',
        strafeRight: 'e',
        moveUp: ' ',
        moveDown: 'Shift',
        stop: 'c'
    };

    let controls = { ...defaultControls };

    /**
     * Loads controls from localStorage
     */
    const loadControls = () => {
        const saved = localStorage.getItem('shipControls');
        if (saved) {
            controls = JSON.parse(saved);
            updateButtonLabels();
        }
    };

    /**
     * Saves controls to localStorage
     */
    const saveControls = () => {
        localStorage.setItem('shipControls', JSON.stringify(controls));
    };

    /**
     * Updates button labels with current keys
     */
    const updateButtonLabels = () => {
        Object.entries(controls).forEach(([action, key]) => {
            const btn = panel?.querySelector(`[data-action="${action}"]`);
            if (btn) {
                btn.textContent = key === ' ' ? 'SPACE' : key.toUpperCase();
            }
        });
    };

    /**
     * Opens settings panel
     */
    const open = () => {
        panel?.classList.add('active');
    };

    /**
     * Closes settings panel
     */
    const close = () => {
        panel?.classList.remove('active');
        if (currentRecording) {
            currentRecording.classList.remove('recording');
            currentRecording = null;
        }
    };

    /**
     * Starts recording a key for an action
     */
    const startRecording = (button, action) => {
        if (currentRecording) {
            currentRecording.classList.remove('recording');
        }

        currentRecording = button;
        button.classList.add('recording');
        button.textContent = 'PRESS KEY...';

        const handleKey = (e) => {
            e.preventDefault();

            const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
            controls[action] = key;

            button.textContent = key === ' ' ? 'SPACE' : key.toUpperCase();
            button.classList.remove('recording');
            currentRecording = null;

            // Auto-save and update immediately
            saveControls();
            window.dispatchEvent(new CustomEvent('controlsUpdated'));

            document.removeEventListener('keydown', handleKey);
        };

        document.addEventListener('keydown', handleKey, { once: true });
    };

    /**
     * Resets controls to default
     */
    const reset = () => {
        controls = { ...defaultControls };
        updateButtonLabels();
        saveControls();
    };

    // Setup event listeners
    if (settingsBtn) {
        settingsBtn.addEventListener('click', open);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', close);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveControls();

            // Dispatch event for real-time update
            window.dispatchEvent(new CustomEvent('controlsUpdated'));

            close();
            // NO RELOAD - Controls will be applied on next use
            // User feedback
            const feedback = document.createElement('div');
            feedback.textContent = '✅ Controls saved!';
            feedback.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,240,255,0.9);color:#000;padding:20px;border-radius:10px;font-family:monospace;z-index:10000;';
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', reset);
    }

    // Setup key button listeners
    panel?.querySelectorAll('.key-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action) {
                startRecording(btn, action);
            }
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel?.classList.contains('active')) {
            close();
        }
    });

    // Load saved controls
    loadControls();

    // Load autopilot confirmation setting
    const autopilotCheckbox = document.getElementById('autopilot-confirmation');
    if (autopilotCheckbox) {
        const saved = localStorage.getItem('autopilotConfirmation');
        autopilotCheckbox.checked = saved !== 'false'; // Default to true

        autopilotCheckbox.addEventListener('change', () => {
            localStorage.setItem('autopilotConfirmation', autopilotCheckbox.checked);
        });
    }

    return {
        open,
        close,
        getControls: () => controls,
        reset
    };
};
