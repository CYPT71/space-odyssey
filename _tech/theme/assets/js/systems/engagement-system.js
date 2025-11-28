/**
 * @fileoverview Engagement system to reward exploration and scanning.
 * @description Tracks discovery points and emits milestones for UI/UX hooks.
 */

import { onGameplayEvent, emitGameplayEvent } from './gameplay-hooks.js';

const STORAGE_KEY = 'ag_discovery_points';
const MILESTONES = [10, 25, 50, 100, 250];

const safeLoad = () => {
    try {
        return Number.parseInt(localStorage.getItem(STORAGE_KEY), 10) || 0;
    } catch (e) {
        return 0;
    }
};

const safeSave = (points) => {
    try {
        localStorage.setItem(STORAGE_KEY, `${points}`);
    } catch (e) {
        /* ignore persistence errors */
    }
};

export const createEngagementSystem = () => {
    let points = safeLoad();
    const milestonesHit = new Set(MILESTONES.filter(m => points >= m));

    const award = (delta, reason) => {
        points += delta;
        safeSave(points);
        emitGameplayEvent('engagementUpdate', { points, reason });
        MILESTONES.forEach(m => {
            if (!milestonesHit.has(m) && points >= m) {
                milestonesHit.add(m);
                emitGameplayEvent('engagementMilestone', { points, milestone: m, reason });
            }
        });
    };

    const disposers = [
        onGameplayEvent('scanComplete', () => award(1, 'scan')),
        onGameplayEvent('objectDiscovered', () => award(2, 'discovery'))
    ];

    return {
        getPoints: () => points,
        dispose: () => disposers.forEach(fn => fn && fn())
    };
};
