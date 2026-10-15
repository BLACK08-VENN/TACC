#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist
mkdir -p dist
cp app.js index.html style.css curtain-geometry.js signage-preview.html favicon.ico site.webmanifest dist/
cp -R assets dist/
rm -rf dist/assets/curtains/catalog-packs
mkdir -p dist/assets/curtains/catalog
for archive in assets/curtains/catalog-packs/photos-*.tar; do
  tar -xf "$archive" -C dist/assets/curtains/catalog
done
printf 'Built static studio with %s catalogue photos.\n' "$(find dist/assets/curtains/catalog -name '*.webp' | wc -l | tr -d ' ')"
