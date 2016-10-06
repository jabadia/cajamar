#!/bin/bash

ogr2ogr -overwrite \
    -t_srs EPSG:4326 \
    -sql "SELECT COD_POSTAL, Pob_TOTAL, Pob_ESP, Pob_MAG, Edad_0_16, Edad_65 FROM almeria" \
    processed/almeria_wm.shp  \
    ./almeria.shp

topojson -p COD_POSTAL \
    --simplify-proportion 0.20 \
    -o ../client/map/almeria_20.json \
    processed/almeria_wm.shp

