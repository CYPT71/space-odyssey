#!/usr/bin/env bash
set -euo pipefail

# Lightweight bootstrap for local dev: install gems (for Jekyll) and npm deps (if any),
# then serve the site. Intended to be run from repo root.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "==> Installing Ruby gems..."
bundle install

if [ -f package.json ]; then
  echo "==> Installing npm dependencies..."
  npm install
fi

# Try to build native WASM assets if emcc is available
if command -v emcc >/dev/null 2>&1; then
  echo "==> Building native WASM (fast-math and fast-parser)..."
  emcc _tech/native/cpp/fast_math.cpp -O3 -s STANDALONE_WASM=1 \
    -s EXPORTED_FUNCTIONS='["_dist3","_lerp","_clamp","_smoothstep","_dot3","_mag3"]' \
    -o _tech/native/fast-math.wasm || true
  emcc _tech/native/cpp/fast_parser.cpp -O3 -s STANDALONE_WASM=1 \
    -s EXPORTED_FUNCTIONS='["_count_files"]' \
    -o _tech/native/fast-parser.wasm || true
else
  echo "==> Skipping native WASM build (emcc not found)"
fi

echo "==> Building & serving site on http://127.0.0.1:4001 ..."
bundle exec jekyll serve --port 4001
