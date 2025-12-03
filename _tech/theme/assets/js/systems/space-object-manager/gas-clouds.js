export const createGasCloudsFromPosts = (postsData, createGasCloudsFn, scene) => {
  return createGasCloudsFn(scene, postsData);
};
