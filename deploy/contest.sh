#!/usr/bin/env bash
set -e

OUT_DIR=./build-contest

rm -rf ${OUT_DIR};
mkdir -p ${OUT_DIR};

npm run build -- --output-path=${OUT_DIR}/dist/
./deploy/copy_to_dist.sh ${OUT_DIR}/dist/

npm run build -- --output-path=${OUT_DIR}/src/ --no-optimize-minimize --devtool=source-map
rm ${OUT_DIR}/src/index.html
./deploy/copy_to_dist.sh ${OUT_DIR}/src/
