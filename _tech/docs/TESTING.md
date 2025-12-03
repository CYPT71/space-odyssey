# Testing Strategy

## Unit Tests
- Scope: pure helpers (color hashing, math, parser utilities).
- Tooling: Jest (`npm test`).
- Goal: fast feedback, deterministic outcomes.

## Integration Tests
- Scope: rendering factories (volumetric-cloud-factory) for geometry counts and attribute presence.
- Tooling: Jest + @testing-library/three or custom geometry assertions.
- Goal: catch structural regressions without a browser.

## End-to-End (E2E)
- Scope: scene boot, HUD bindings, scanner trigger.
- Tooling: Playwright (headless) with basic navigation and canvas presence.
- Goal: smoke confidence on real builds.

## Performance Guards
- Scope: budget thresholds on frame loop sections and particle caps.
- Tooling: custom profiler hooks + Jest to assert ceiling values where feasible.

## Commands
- Run all commands from the `_tech` directory so the Jest configuration resolves the mocks and assets correctly.
- `npm test` — unit/integration.
- `npm run test:e2e` — Playwright smoke.
- `node _tech/tests/parser-structure.test.js` — parser structure smoke test.
