# Space Odyssey Architecture

## Layout & Delivery
- **Theme gem** lives in `_tech/theme` and is consumed via `theme: jekyll-theme-space-odyssey`.
- Assets are served directly from `_tech/theme/assets`, no copying into project root is required.
- Native WASM binaries are expected in `_tech/native/*.wasm`; JS fallbacks keep runtime working when binaries are absent.

## Core Systems (JS)
- **Galaxy/Nebula parsing**: `_tech/theme/assets/js/galaxy/space-tree-internal.js` builds the content graph (galaxies for pages, nebulae for posts). Renderer choice is controlled by `HIERARCHY_NODE_PROPS`.
- **Object management**: `_tech/theme/assets/js/core/space-object-utils.js` and friends manage spatial data (octree, physics helpers).
- **Rendering & HUD**: systems under `_tech/theme/assets/js/systems` (scanner, audio, navigation HUD, gas-cloud, etc.).
- **Workers**: `_tech/theme/assets/js/workers/parse-worker.js` offloads parsing; it prefers WASM parser when available.

## Native / WASM
- **fast-math**: `_tech/native/cpp/fast_math.cpp` → `_tech/native/fast-math.wasm`, wrapped by `_tech/theme/assets/js/native/fast-math.js` (dist3/lerp/clamp/smoothstep/dot/mag).
- **fast-parser**: `_tech/native/cpp/fast_parser.cpp` → `_tech/native/fast-parser.wasm`, wrapped by `_tech/theme/assets/js/native/fast-parser.js`. Currently logs counts and falls back to JS parse.
- Build helper: `_tech/bin/setup_and_run.sh` optionally builds WASM via `emcc` when available.

## Testing & CI
- Jest lives under `_tech/tests`, with extensive Three.js mocks in `__mocks__/three.js`. Coverage thresholds are 99% global.
- CI runs Jest then Jekyll build (`_tech/package.json` scripts).
- Babel vendor shim is auto-patched via `scripts/patch-babel-vendor.js` to satisfy Jest dependencies.

## Observability
- `core/profiler.js` exposes `startMark/endMark`. Parsing now emits timing marks (`space-parse`, `space-parse-classify`, `space-parse-hierarchy`).
- Add more marks around hot paths (physics, HUD updates) as needed; keep logs concise to avoid console noise.

## Next Steps
- Swap more distance/curve math to the fast-math wrapper.
- Expand fast-parser to emit the full tree in WASM and switch the worker to prefer it when present.
- Keep docs in `_tech/docs` alongside setup/run instructions.
- Document wiki structure: pages for content graph, rendering pipeline, WASM build notes, and CI.
