#!/usr/bin/env bash
set -e

#if ! git diff-index --quiet HEAD --; then
#    echo "[ERR] Please commit changes first"
#    exit 1
#fi

OUT_DIR=build-contest/gramjs

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};
npx parcel build src/index.html -d ${OUT_DIR}/ --public-url ./ --no-minify;
