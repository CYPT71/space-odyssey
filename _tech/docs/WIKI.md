# Wiki Outline

This repository’s wiki should mirror the docs under `_tech/docs`. Suggested pages:

- **Content Graph & Parsing**
  - How pages/posts become galaxies/nebulae.
  - Base URL handling and exclusion rules.
  - Worker + WASM flow (parse-worker → fast-parser → JS fallback).
- **Rendering Pipeline**
  - Scene bootstrap, object placement, HUD systems.
  - Gas clouds vs galaxies rendering flags.
  - Performance knobs (LOD, culling, octree usage).
- **Native/WASM**
  - Building `fast-math.wasm` and `fast-parser.wasm` with `emcc`.
  - JS wrappers and fallbacks; where they are consumed.
- **Testing & CI**
  - Jest setup, Three.js mocks, coverage thresholds.
  - CI workflow steps (npm install/test, bundle exec jekyll build).
- **Ops & Tooling**
  - Setup script `_tech/bin/setup_and_run.sh`.
  - Babel vendor patcher (`scripts/patch-babel-vendor.js`).
  - Logging/tracing via `core/profiler`.
