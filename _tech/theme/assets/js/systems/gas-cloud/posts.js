import * as THREE from 'three';
import { createGasCloud } from './create.js';
import { createNebula } from '../nebula-system.js';

const collectPostsDeep = (node) => {
  const own = Array.isArray(node.posts) ? node.posts : [];
  const children = Object.values(node.nebulae || {}).flatMap(collectPostsDeep);
  return own.concat(children);
};

export const createPostsGasClouds = (scene, postsData) => {
  const gasClouds = [];
  const cloudNames = Object.keys(postsData.gasClouds);

  cloudNames.forEach((cloudName, index) => {
    const cloudData = postsData.gasClouds[cloudName];
    const totalPosts =
      cloudData.posts.length + Object.values(cloudData.nebulae).reduce((sum, neb) => sum + neb.posts.length, 0);

    const angle = (index / cloudNames.length) * Math.PI * 2;
    const radius = 4000000000;
    const center = new THREE.Vector3(Math.cos(angle) * radius, (Math.random() - 0.5) * 500000000, Math.sin(angle) * radius);

    const gasCloud = createGasCloud(scene, center, cloudName, totalPosts);
    gasCloud.userData.cloudData = cloudData;
    gasClouds.push(gasCloud);

    const createNebulaTree = (parentGroup, nebulaNode, nodeIndex, count, level = 0, parentColor = null) => {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const angleLocal = nodeIndex * goldenAngle;
      const baseRadius = 160000 * (1 + level * 0.8);
      const jitter = 40000 * Math.random();
      const radiusLocal = baseRadius + jitter;
      const vertical = (Math.random() - 0.5) * 50000 * Math.max(1, 1 + level * 0.3);

      const centerPos = new THREE.Vector3(Math.cos(angleLocal) * radiusLocal, vertical, Math.sin(angleLocal) * radiusLocal);

      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(centerPos);

      const neb = createNebula(scene, new THREE.Vector3(0, 0, 0), nebulaNode.name, collectPostsDeep(nebulaNode).length, parentColor);
      neb.userData.parentGasCloud = cloudName;
      neb.userData.posts = collectPostsDeep(nebulaNode);

      if (neb.userData.posts.length > 0 && typeof neb.visualizePosts === 'function') {
        neb.visualizePosts(neb.userData.posts);
      }

      nodeGroup.add(neb);
      parentGroup.add(nodeGroup);

      const children = Object.values(nebulaNode.nebulae || {});
      children.forEach((child, i) => {
        createNebulaTree(nodeGroup, child, i, children.length, level + 1, neb.userData.baseColor);
      });
    };

    const topNebulae = Object.values(cloudData.nebulae);
    if (topNebulae.length === 0 && cloudData.posts?.length) {
      const neb = createNebula(scene, new THREE.Vector3(0, 0, 0), 'cluster', cloudData.posts.length);
      neb.userData.parentGasCloud = cloudName;
      neb.userData.posts = cloudData.posts;
      gasCloud.add(neb);
    } else {
      topNebulae.forEach((node, i) => createNebulaTree(gasCloud, node, i, topNebulae.length, 0));
    }
  });

  return gasClouds;
};
