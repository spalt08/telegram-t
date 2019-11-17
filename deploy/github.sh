#!/usr/bin/env bash
set -e

if ! git diff-index --quiet HEAD --; then
    echo "[ERR] Please commit changes first"
    exit 1
fi

rm -rf docs/*;
npx parcel build src/index.html -d docs/ --public-url ./;

npx terser node_modules/tdweb/dist/2380cfa0e562e148fa50.worker.js -o docs/2380cfa0e562e148fa50.worker.js --mangle --compress
npx terser node_modules/tdweb/dist/1.2380cfa0e562e148fa50.worker.js -o docs/1.2380cfa0e562e148fa50.worker.js --mangle --compress
cp node_modules/tdweb/dist/*.wasm docs/;

git add -A;
git ci -a -m 'Build update'
