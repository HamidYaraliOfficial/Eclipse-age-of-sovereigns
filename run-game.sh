#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20.19+ is required. Install it from https://nodejs.org/"
  exit 1
fi
if [ ! -f "node_modules/vite/bin/vite.js" ]; then
  echo "Installing game dependencies (internet access is required the first time)..."
  npm install
fi
npm run dev -- --open
