#!/usr/bin/env bash
set -e

#if ! git diff-index --quiet HEAD --; then
#    echo "[ERR] Please commit changes first"
#    exit 1
#fi

OUT_DIR=build-contest/

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};

rm -rf .cache/ dist/;
npx parcel build src/index.html -d ${OUT_DIR}/dist --public-url ./ --no-source-maps;
./deploy/copy_to_public.sh ${OUT_DIR}/dist

rm -rf .cache/ dist/;
npx parcel build src/index.html -d ${OUT_DIR}/src --public-url ./ --no-minify;
./deploy/copy_to_public.sh ${OUT_DIR}/dist
rm ${OUT_DIR}/src/index.html
