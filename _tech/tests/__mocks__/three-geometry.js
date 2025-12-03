import { Vector3 } from './three-vectors.js';

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

function SphereGeometry() { if (!(this instanceof SphereGeometry)) return new SphereGeometry(); }

export {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  QuadraticBezierCurve3,
  RingGeometry,
  SphereGeometry
};
