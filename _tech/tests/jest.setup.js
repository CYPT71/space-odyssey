// Global test harness setup for Jest (browser-ish shims)

// Worker shim
class WorkerShim {
  constructor() {}
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
  onmessage = null;
  onerror = null;
}

if (!global.Worker) {
  global.Worker = WorkerShim;
}

// URL shim for createObjectURL/revokeObjectURL
if (!global.URL) {
  global.URL = {};
}
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = () => '';
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = () => {};
}

// Minimal import.meta.url guard (used in worker instantiation)
if (typeof global.importMetaUrl === 'undefined') {
  global.importMetaUrl = 'http://localhost/';
}
