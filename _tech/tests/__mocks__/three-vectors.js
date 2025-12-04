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

export { Euler, Vector3 };
