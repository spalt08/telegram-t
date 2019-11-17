#!/usr/bin/env bash
set -e

if ! git diff-index --quiet HEAD --; then
    echo "[ERR] Please commit changes first"
    exit 1
fi

OUT_DIR=build-contest/tdlib

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};
npx parcel build src/index.html -d ${OUT_DIR}/ --public-url ./ --no-minify;

npx terser node_modules/tdweb/dist/2380cfa0e562e148fa50.worker.js -o ${OUT_DIR}/2380cfa0e562e148fa50.worker.js --mangle --compress
npx terser node_modules/tdweb/dist/1.2380cfa0e562e148fa50.worker.js -o ${OUT_DIR}/1.2380cfa0e562e148fa50.worker.js --mangle --compress
cp node_modules/tdweb/dist/*.wasm ${OUT_DIR}/;
