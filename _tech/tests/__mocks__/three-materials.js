function MeshStandardMaterial(opts = {}) {
  if (!(this instanceof MeshStandardMaterial)) return new MeshStandardMaterial(opts);
  Object.assign(this, opts);
}

function MeshBasicMaterial(opts = {}) {
  if (!(this instanceof MeshBasicMaterial)) return new MeshBasicMaterial(opts);
  Object.assign(this, opts);
}

function PointsMaterial(opts = {}) {
  if (!(this instanceof PointsMaterial)) return new PointsMaterial(opts);
  Object.assign(this, opts);
}

function LineBasicMaterial(opts = {}) {
  if (!(this instanceof LineBasicMaterial)) return new LineBasicMaterial(opts);
  Object.assign(this, opts);
}

export {
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointsMaterial
};
