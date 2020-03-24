#!/usr/bin/env bash
set -e

#if ! git diff-index --quiet HEAD --; then
#    echo "[ERR] Please commit changes first"
#    exit 1
#fi

rm -rf docs/*;
npx parcel build src/index.html -d docs/ --public-url ./;
./deploy/copy_opus_wasm.sh ${OUT_DIR}/dist

git add -A;
git ci -a -m 'Build update'
