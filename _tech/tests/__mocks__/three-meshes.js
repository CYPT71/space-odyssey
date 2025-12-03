import { Object3D } from './three-scene.js';
import { Euler, Vector3 } from './three-vectors.js';

function Points(geometry = null, material = null) {
  if (!(this instanceof Points)) return new Points(geometry, material);
  Object3D.call(this);
  this.geometry = geometry;
  this.material = material;
}
Points.prototype = Object.create(Object3D.prototype);

function Line(geometry = null, material = null) {
  if (!(this instanceof Line)) return new Line(geometry, material);
  Object3D.call(this);
  this.geometry = geometry;
  this.material = material;
}
Line.prototype = Object.create(Object3D.prototype);

function Mesh(geometry = null, material = null) {
  if (!(this instanceof Mesh)) return new Mesh(geometry, material);
  Object3D.call(this);
  this.geometry = geometry;
  this.material = material;
  this.scale = new Vector3(1, 1, 1);
  this.position = new Vector3();
  this.rotation = new Euler();
}
Mesh.prototype = Object.create(Object3D.prototype);

export { Line, Mesh, Points };
