#!/usr/bin/env bash

GRIB=$1
NAME=$2
INTERVAL=$3
OUT_DIR=$4

NAME="${NAME:-contour}"
INTERVAL="${INTERVAL:-5}"
OUT_DIR="${OUT_DIR:-contour.tmp}"

gdal_contour -snodata 9999 -off 0 -i $INTERVAL -a $NAME -nln $NAME $GRIB $OUT_DIR

mv $OUT_DIR/* .
rmdir $OUT_DIR

