# Engine Practices

## Coding Standards
- ES modules everywhere; no globals.
- Pure functions where possible; otherwise keep side effects explicit.
- Immutable inputs; clone mutable Three.js objects when storing.
- Prefer typed arrays for particle/geometry data.
- No magic numbers: use named constants.
- Avoid hidden state; prefer explicit userData contracts.

## Testing Strategy
- Unit: pure helpers (color hashing, math) via Jest.
- Integration: rendering factories (volumetric clouds) with snapshot geometry counts.
- E2E: Playwright pass to load the scene and validate HUD/scanner bindings.
- Performance guards: add regression thresholds on particle counts and frame budget in CI.

## Profiling & Performance
- Use `performance.mark/measure` around heavy update loops.
- Reuse scratch objects and typed arrays; avoid allocation in hot paths.
- Prefer additive blending only where needed; reduce particle count caps in mobile UA.
- Use WASM for hot math kernels; gate with feature detection.

## CI/CD
- On push: lint -> unit -> integration -> build -> (optional) Playwright smoke.
- Require PR review; block on failing tests/lint.
- Artifact retention: built `_site` for preview; coverage reports.
