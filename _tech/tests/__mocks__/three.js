// Functional, lightweight stubs for THREE primitives used in tests

function Vector3(x = 0, y = 0, z = 0) {
  if (!(this instanceof Vector3)) return new Vector3(x, y, z);
  this.x = x; this.y = y; this.z = z;
}
Vector3.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
Vector3.prototype.add = function (v) { this.x += v.x || 0; this.y += v.y || 0; this.z += v.z || 0; return this; };
Vector3.prototype.sub = function (v) { this.x -= v.x || 0; this.y -= v.y || 0; this.z -= v.z || 0; return this; };
Vector3.prototype.addVectors = function (a, b) { this.x = a.x + b.x; this.y = a.y + b.y; this.z = a.z + b.z; return this; };
Vector3.prototype.multiplyScalar = function (s) { this.x *= s; this.y *= s; this.z *= s; return this; };
Vector3.prototype.distanceTo = function (v) { const dx = this.x - v.x; const dy = this.y - v.y; const dz = this.z - v.z; return Math.sqrt(dx*dx + dy*dy + dz*dz); };
Vector3.prototype.clone = function () { return new Vector3(this.x, this.y, this.z); };
Vector3.prototype.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
Vector3.prototype.clamp = function (min, max) {
  this.x = Math.max(min.x, Math.min(max.x, this.x));
  this.y = Math.max(min.y, Math.min(max.y, this.y));
  this.z = Math.max(min.z, Math.min(max.z, this.z));
  return this;
};
Vector3.prototype.lerpVectors = function (a, b, t) {
  this.x = a.x + (b.x - a.x) * t;
  this.y = a.y + (b.y - a.y) * t;
  this.z = a.z + (b.z - a.z) * t;
  return this;
};
Vector3.prototype.divideScalar = function (s) { if (s !== 0) { this.x /= s; this.y /= s; this.z /= s; } return this; };
Vector3.prototype.project = function () { return this; };

function Euler(x = 0, y = 0, z = 0) {
  if (!(this instanceof Euler)) return new Euler(x, y, z);
  this.x = x; this.y = y; this.z = z;
}
Euler.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };

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

function Color(hex = 0xffffff) {
  if (!(this instanceof Color)) return new Color(hex);
  this.hex = hex;
  this.r = 0; this.g = 0; this.b = 0;
}
Color.prototype.set = function (val) { this.hex = val; return this; };
Color.prototype.setHSL = function (h = 0, s = 0, l = 0) { this.h = h; this.s = s; this.l = l; return this; };
Color.prototype.clone = function () { const c = new Color(this.hex); c.r = this.r; c.g = this.g; c.b = this.b; c.h = this.h; c.s = this.s; c.l = this.l; return c; };
Color.prototype.copy = function (c) { this.hex = c.hex || this.hex; this.r = c.r || 0; this.g = c.g || 0; this.b = c.b || 0; return this; };

function Box3(min = new Vector3(), max = new Vector3()) {
  if (!(this instanceof Box3)) return new Box3(min, max);
  this.min = min; this.max = max;
}

function BufferGeometry() {
  if (!(this instanceof BufferGeometry)) return new BufferGeometry();
  this.attributes = {};
}
BufferGeometry.prototype.setAttribute = function (name, attr) { this.attributes[name] = attr; };
BufferGeometry.prototype.getAttribute = function (name) { return this.attributes[name]; };
BufferGeometry.prototype.setFromPoints = function (points) {
  const arr = new Float32Array(points.length * 3);
  points.forEach((p, i) => { arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z; });
  this.setAttribute('position', new BufferAttribute(arr, 3));
  this.attributes.position.count = points.length;
  return this;
};

function BufferAttribute(array, itemSize) {
  if (!(this instanceof BufferAttribute)) return new BufferAttribute(array, itemSize);
  this.array = array;
  this.itemSize = itemSize;
  this.count = array ? array.length / itemSize : 0;
}

function Points(geometry = null, material = null) {
  if (!(this instanceof Points)) return new Points(geometry, material);
  Object3D.call(this);
  this.geometry = geometry;
  this.material = material;
}
Points.prototype = Object.create(Object3D.prototype);

function PerspectiveCamera() {
  if (!(this instanceof PerspectiveCamera)) return new PerspectiveCamera();
  Object3D.call(this);
}
PerspectiveCamera.prototype = Object.create(Object3D.prototype);
PerspectiveCamera.prototype.position = new Vector3();
PerspectiveCamera.prototype.rotation = { set: function (x, y, z) { this.x = x; this.y = y; this.z = z; } };
PerspectiveCamera.prototype.updateProjectionMatrix = function () {};

function SphereGeometry() { if (!(this instanceof SphereGeometry)) return new SphereGeometry(); }

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

function RingGeometry(inner = 1, outer = 2, segments = 8) {
  if (!(this instanceof RingGeometry)) return new RingGeometry(inner, outer, segments);
  this.innerRadius = inner;
  this.outerRadius = outer;
  this.segments = segments;
}

function QuadraticBezierCurve3(v0, v1, v2) {
  if (!(this instanceof QuadraticBezierCurve3)) return new QuadraticBezierCurve3(v0, v1, v2);
  this.v0 = v0; this.v1 = v1; this.v2 = v2;
}
QuadraticBezierCurve3.prototype.getPoints = function (segments) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * this.v0.x + 2 * oneMinusT * t * this.v1.x + t * t * this.v2.x;
    const y = oneMinusT * oneMinusT * this.v0.y + 2 * oneMinusT * t * this.v1.y + t * t * this.v2.y;
    const z = oneMinusT * oneMinusT * this.v0.z + 2 * oneMinusT * t * this.v1.z + t * t * this.v2.z;
    pts.push(new Vector3(x, y, z));
  }
  return pts;
};

export {
  Vector3,
  Euler,
  Object3D,
  Group,
  Color,
  Box3,
  BufferGeometry,
  BufferAttribute,
  Points,
  PerspectiveCamera,
  SphereGeometry,
  Line,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PointsMaterial,
  QuadraticBezierCurve3,
  LineBasicMaterial,
  RingGeometry
};

export default {
  Vector3,
  Euler,
  Object3D,
  Group,
  Color,
  Box3,
  BufferGeometry,
  BufferAttribute,
  Points,
  PerspectiveCamera,
  SphereGeometry,
  Line,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PointsMaterial,
  QuadraticBezierCurve3,
  LineBasicMaterial,
  RingGeometry
};
