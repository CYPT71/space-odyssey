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

echo "==> Building & serving site on http://127.0.0.1:4001 ..."
bundle exec jekyll serve --port 4001
