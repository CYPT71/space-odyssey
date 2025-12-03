import { parseSpaceTree } from '../domain/space-tree.js';
import { createGalaxy, updateGalaxy } from '../galaxy/renderer.js';
import { createNavigationSystem } from '../galaxy/navigation.js';
import { createPlanetLikeProcedural } from '../entities/planet-factory.js';
import { createGalaxyTrails, createAnimatedTrails, updateAnimatedTrails } from './galaxy-trails.js';
import { createPostsGasClouds, updateGasClouds } from './gas-cloud-system.js';
import { getObjectType, getDetectionRange } from '../core/space-object-utils.js';
import { Octree } from '../core/octree.js';
import { startMark, endMark, getDuration } from '../core/profiler.js';
import { hashFiles, loadCachedTree, saveCachedTree } from './space-object-manager/cache.js';
import { createRootPlanets } from './space-object-manager/placement.js';
import { createGalaxies } from './space-object-manager/galaxies.js';
import { createGasCloudsFromPosts } from './space-object-manager/gas-clouds.js';
import { getAllObjectsFactory, findClosestFactory } from './space-object-manager/finders.js';

export const createSpaceObjectManager = (scene, audioSystem, overrides = {}) => {
  const {
    parseTree = parseSpaceTree,
    createGalaxyFn = createGalaxy,
    updateGalaxyFn = updateGalaxy,
    createNavigationFn = createNavigationSystem,
    createPlanetFn = createPlanetLikeProcedural,
    createTrailsFn = createGalaxyTrails,
    createAnimatedTrailsFn = createAnimatedTrails,
    updateAnimatedTrailsFn = updateAnimatedTrails,
    createGasCloudsFn = createPostsGasClouds,
    updateGasCloudsFn = updateGasClouds,
    objectTypeFn = getObjectType,
    detectionRangeFn = getDetectionRange,
    octreeClass = Octree
  } = overrides;

  let spaceTree = null;
  let galaxies = [];
  let gasClouds = [];
  let rootPlanets = [];
  let animatedTrails = [];

  const navigation = createNavigationFn(audioSystem);
  const octree = new octreeClass(15000000000);

  const createRootPlanetsLocal = (files) => createRootPlanets(files, createPlanetFn);
  const createGalaxiesLocal = (galaxiesData) =>
    createGalaxies(galaxiesData, {
      scene,
      navigation,
      createGalaxyFn,
      createTrailsFn,
      createAnimatedTrailsFn,
      animatedTrails
    });
  const createGasCloudsLocal = (postsData) => createGasCloudsFromPosts(postsData, createGasCloudsFn, scene);

  const getAllObjects = getAllObjectsFactory(galaxies, gasClouds, rootPlanets);
  const findClosest = findClosestFactory(octree, objectTypeFn, detectionRangeFn);

  const populateFromTree = (tree) => {
    spaceTree = tree;
    navigation.setGalaxyTree(spaceTree);

    rootPlanets = createRootPlanetsLocal(spaceTree.root.files);
    rootPlanets.forEach((planet) => scene.add(planet));

    galaxies = createGalaxiesLocal(spaceTree.root.galaxies);
    galaxies.forEach((galaxy) => scene.add(galaxy.group));

    if (spaceTree.posts && Object.keys(spaceTree.posts.gasClouds).length > 0) {
      gasClouds = createGasCloudsLocal(spaceTree.posts);
    } else {
      gasClouds = [];
    }

    const allObjects = getAllObjects();
    octree.rebuild(allObjects);
  };

  const parseAndPopulate = (hash) => {
    const tree = parseTree(window.fileSystem);
    saveCachedTree(hash, tree);
    populateFromTree(tree);
  };

  const initialize = () => {
    if (!window.fileSystem) {
      console.warn('⚠️ No file system data found');
      return;
    }

    try {
      const hash = hashFiles(window.fileSystem);
      const cached = loadCachedTree(hash);
      if (cached) {
        populateFromTree(cached);
        return;
      }

      const workerUrl = '/_tech/theme/assets/js/workers/parse-worker.js';
      if (window.Worker) {
        const worker = new Worker(workerUrl, { type: 'module' });
        worker.onmessage = (e) => {
          if (e.data && e.data.error) {
            parseAndPopulate(hash);
            return;
          }
          saveCachedTree(hash, e.data);
          populateFromTree(e.data);
        };
        worker.onerror = () => parseAndPopulate(hash);
        worker.postMessage({ files: window.fileSystem, hash });
      } else {
        parseAndPopulate(hash);
      }
    } catch (e) {
      console.warn('Worker parse unavailable, using main thread:', e);
      const hash = hashFiles(window.fileSystem);
      const cached = loadCachedTree(hash);
      if (cached) {
        populateFromTree(cached);
      } else {
        parseAndPopulate(hash);
      }
    }
  };

  const update = () => {
    startMark('galaxies');
    galaxies.forEach((galaxy) => updateGalaxyFn(galaxy));
    endMark('galaxies');

    startMark('trails');
    animatedTrails.forEach((trail) => updateAnimatedTrailsFn(trail, 0.016));
    endMark('trails');

    startMark('gasClouds');
    updateGasCloudsFn(gasClouds, 0.016);
    endMark('gasClouds');

    const g = getDuration('galaxies');
    const c = getDuration('gasClouds');
    const t = getDuration('trails');
    if (g > 10 || c > 10 || t > 10) {
      console.warn('⏱️ Frame budget warning', {
        galaxies: g?.toFixed?.(2),
        gasClouds: c?.toFixed?.(2),
        trails: t?.toFixed?.(2)
      });
    }
  };

  return {
    initialize,
    update,
    getAllObjects,
    findClosest,
    getTree: () => spaceTree,
    getGalaxies: () => galaxies,
    getGasClouds: () => gasClouds
  };
};

export const createGalaxyManager = createSpaceObjectManager;
