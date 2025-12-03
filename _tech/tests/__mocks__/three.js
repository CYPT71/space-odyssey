import { Line, Mesh, Points } from './three-meshes.js';
import { Group, Object3D, PerspectiveCamera } from './three-scene.js';
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  QuadraticBezierCurve3,
  RingGeometry,
  SphereGeometry
} from './three-geometry.js';
import {
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointsMaterial
} from './three-materials.js';
import { Euler, Vector3 } from './three-vectors.js';

const exportsList = {
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

export default exportsList;
