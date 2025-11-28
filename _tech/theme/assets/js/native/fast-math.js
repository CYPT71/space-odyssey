/**
 * @fileoverview WASM-accelerated math helpers with JS fallback.
 * Looks for _tech/native/fast-math.wasm; falls back to pure JS if absent.
 */

const wasmPath = '/_tech/native/fast-math.wasm';

const fallback = {
  dist3: (ax, ay, az, bx, by, bz) => {
    const dx = ax - bx;
    const dy = ay - by;
    const dz = az - bz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  lerp: (a, b, t) => {
    const tt = Math.max(0, Math.min(1, t));
    return a + (b - a) * tt;
  },
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
  smoothstep: (e0, e1, x) => {
    const t = fallback.clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  },
  dot3: (ax, ay, az, bx, by, bz) => ax * bx + ay * by + az * bz,
  mag3: (ax, ay, az) => Math.sqrt(ax * ax + ay * ay + az * az)
};

let ready = null;
let wasm = null;

export const fastMathReady = () => {
  if (ready) return ready;
  ready = fetch(wasmPath)
    .then(res => res.ok ? res.arrayBuffer() : Promise.reject(new Error('missing wasm')))
    .then(buf => WebAssembly.instantiate(buf, {}))
    .then(({ instance }) => {
      wasm = instance.exports;
      return wasm;
    })
    .catch(() => {
      wasm = null;
      return null;
    });
  return ready;
};

export const dist3 = (ax, ay, az, bx, by, bz) => {
  if (wasm && typeof wasm.dist3 === 'function') {
    return wasm.dist3(ax, ay, az, bx, by, bz);
  }
  return fallback.dist3(ax, ay, az, bx, by, bz);
};

export const lerpFast = (a, b, t) => {
  if (wasm && typeof wasm.lerp === 'function') {
    return wasm.lerp(a, b, t);
  }
  return fallback.lerp(a, b, t);
};

export const clampFast = (v, lo, hi) => {
  if (wasm && typeof wasm.clamp === 'function') {
    return wasm.clamp(v, lo, hi);
  }
  return fallback.clamp(v, lo, hi);
};

export const smoothstepFast = (e0, e1, x) => {
  if (wasm && typeof wasm.smoothstep === 'function') {
    return wasm.smoothstep(e0, e1, x);
  }
  return fallback.smoothstep(e0, e1, x);
};

export const dot3Fast = (ax, ay, az, bx, by, bz) => {
  if (wasm && typeof wasm.dot3 === 'function') {
    return wasm.dot3(ax, ay, az, bx, by, bz);
  }
  return fallback.dot3(ax, ay, az, bx, by, bz);
};

export const mag3Fast = (ax, ay, az) => {
  if (wasm && typeof wasm.mag3 === 'function') {
    return wasm.mag3(ax, ay, az);
  }
  return fallback.mag3(ax, ay, az);
};
