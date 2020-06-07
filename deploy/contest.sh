#!/usr/bin/env bash
set -e

OUT_DIR=build-contest/

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};

rm -rf .parcel-cache/
PARCEL_BUNDLE_ANALYZER=1 npx parcel build src/index.html --target=target:contest:dist --no-source-maps
./deploy/copy_to_public.sh ${OUT_DIR}/dist

rm -rf .parcel-cache/
PARCEL_BUNDLE_ANALYZER=1 npx parcel build src/index.html --target=target:contest:src
./deploy/copy_to_public.sh ${OUT_DIR}/dist
rm ${OUT_DIR}/src/index.html
