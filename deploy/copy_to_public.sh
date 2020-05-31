#!/usr/bin/env bash

cp ./node_modules/opus-media-recorder/OggOpusEncoder.wasm ${1:-"dist"}
cp -R ./node_modules/emoji-data-ios/img-apple-64 ${1:-"dist/"}
cp -R ./node_modules/emoji-data-ios/img-apple-160 ${1:-"dist/"}
cp -R ./public/data ${1:-"dist/"}
