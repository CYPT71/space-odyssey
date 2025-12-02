import { Vector3 } from 'three';
import { setupTeleportHandlers } from '../theme/assets/js/core/input/teleport-handlers.js';

describe('Teleport handlers', () => {
  let cleanup;
  const baseSystems = () => {
    const shipGroup = { position: new Vector3(0, 0, 0) };
    const shipControls = {
      setSpeed: jest.fn(() => {}),
      isFineControlActive: jest.fn(() => false),
    };
    const audioSystem = { playSound: jest.fn(() => {}) };
    const galaxyManager = { getAllObjects: jest.fn(() => []) };
    const uiManager = { closeReadingMode: jest.fn(() => {}) };
    const triggerTeleportEffect = jest.fn(() => {});
    const scratchVector = new Vector3();

    const systems = {
      shipGroup,
      shipControls,
      audioSystem,
      galaxyManager,
      uiManager,
      showTeleportConfirm: jest.fn(() => {}),
      triggerTeleportEffect,
      scratchVector,
    };
    return systems;
  };

  afterEach(() => {
    cleanup?.();
    cleanup = null;
    jest.clearAllMocks();
  });

  test('ignores invalid targets without crashing', () => {
    const systems = baseSystems();
    cleanup = setupTeleportHandlers(systems);

    expect(() => {
      window.dispatchEvent(
        new CustomEvent('teleportRequest', { detail: { uuid: 'nope', object: {} } })
      );
    }).not.toThrow();
  });

  test('calls confirm dialog for galaxy targets', () => {
    const systems = baseSystems();
    const target = {
      uuid: 'galaxy-1',
      matrixWorld: {},
      userData: { galaxyData: { name: 'Test Galaxy' } },
      getWorldPosition(vec) {
        vec.set(10, 5, 0);
      },
    };
    systems.galaxyManager.getAllObjects.mockReturnValue([target]);
    const confirm = jest.fn((title, message, cb) => cb && cb());
    systems.showTeleportConfirm = confirm;
    cleanup = setupTeleportHandlers(systems);

    window.dispatchEvent(new CustomEvent('teleportRequest', { detail: { uuid: 'galaxy-1', object: target } }));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm.mock.calls[0][1]).toContain('Teleport to galaxy');
  });

  test('teleportTo helper dispatches event with object', () => {
    const systems = baseSystems();
    const target = {
      uuid: 'planet-1',
      matrixWorld: {},
      userData: { planetData: { name: 'Planet' } },
      getWorldPosition(vec) {
        vec.set(0, 0, 0);
      },
    };
    cleanup = setupTeleportHandlers(systems);
    const listener = jest.fn();
    window.addEventListener('teleportRequest', listener);

    window.teleportTo('planet-1', target);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.object).toBe(target);

    window.removeEventListener('teleportRequest', listener);
  });
});
