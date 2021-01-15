#!/bin/sh
convert $1 -resize 16x16 "${1%.*}-16x16.png"
convert $1 -resize 32x32 "${1%.*}-32x32.png"
convert $1 -resize 96x96 "${1%.*}-96x96.png"