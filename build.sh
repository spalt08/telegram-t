#!/usr/bin/env bash
set -e


if ! git diff-index --quiet HEAD --; then
    echo "[ERR] Please commit changes first"
    exit 1
fi

rm -rf docs/*;
parcel build src/index.html -d docs/ --public-url ./;
cp node_modules/tdweb/dist/* docs/;
git add -A;
git ci -a -m 'Build update'
