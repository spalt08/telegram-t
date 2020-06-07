#!/usr/bin/env bash

# We don't use `copy-webpack-plugin` as it's too slow with tons of files
cp -R ./node_modules/emoji-data-ios/img-apple-64 ${1:-"dist"}
cp -R ./node_modules/emoji-data-ios/img-apple-160 ${1:-"dist"}
