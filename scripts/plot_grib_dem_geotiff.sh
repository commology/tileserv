GRIB=$1
COLORMAP=$2
GTIFF_OUTPUT=$3

GRIB_GTIFF="$GRIB.tif"

gdalwarp -srcnodata 9999 -dstnodata 9999 $GRIB $GRIB_GTIFF
gdaldem color-relief -nearest_color_entry $GRIB_GTIFF $COLORMAP $GTIFF_OUTPUT
