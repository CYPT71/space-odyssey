import { Euler, Vector3 } from './three-vectors.js';

function Object3D() {
  if (!(this instanceof Object3D)) return new Object3D();
  this.position = new Vector3();
  this.rotation = new Euler();
  this.scale = new Vector3(1, 1, 1);
  this.scale.set = this.scale.set.bind(this.scale);
  this.children = [];
  this.userData = {};
}
Object3D.prototype.add = function (obj) { this.children.push(obj); obj.parent = this; };
Object3D.prototype.remove = function (obj) { this.children = this.children.filter(o => o !== obj); };
Object3D.prototype.traverse = function (cb) { cb(this); this.children.forEach(c => c.traverse(cb)); };
Object3D.prototype.getWorldPosition = function (target) { return target.set(this.position.x, this.position.y, this.position.z); };

function Group() { if (!(this instanceof Group)) return new Group(); Object3D.call(this); }
Group.prototype = Object.create(Object3D.prototype);

function PerspectiveCamera() {
  if (!(this instanceof PerspectiveCamera)) return new PerspectiveCamera();
  Object3D.call(this);
}
PerspectiveCamera.prototype = Object.create(Object3D.prototype);
PerspectiveCamera.prototype.position = new Vector3();
PerspectiveCamera.prototype.rotation = { set: function (x, y, z) { this.x = x; this.y = y; this.z = z; } };
PerspectiveCamera.prototype.updateProjectionMatrix = function () {};

export { Group, Object3D, PerspectiveCamera };
