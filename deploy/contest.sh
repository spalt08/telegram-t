#!/usr/bin/env bash
set -e

OUT_DIR=build-contest/

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};

rm -rf .parcel-cache/
npx parcel build src/index.html --target=target:contest:dist --no-scope-hoist --no-source-maps

rm -rf .parcel-cache/
npx parcel build src/index.html --target=target:contest:src --no-scope-hoist
