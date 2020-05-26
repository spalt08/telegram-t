#!/usr/bin/env bash

cp ./node_modules/opus-media-recorder/OggOpusEncoder.wasm ${1:-"dist/"}
cp -R ./public/data ${1:-"dist/"}
