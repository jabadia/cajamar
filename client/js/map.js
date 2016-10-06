(function() {
"use strict";

var module = angular.module('mapModule', []);

module.directive('mainMap', function()
{
    var _selectedLayer;

    var _selectedFeature = "#cp_almeria_rejilla {" +
        "polygon-fill: #FF6600;" +
        "polygon-opacity: 0;" +
        "line-color: #f7ff00;" +
        "line-width: 3;" +
        "line-opacity: 1;" +
        "}";
    var _noneFeature = "#cp_almeria_rejilla {" +
        "polygon-fill: #FF6600;" +
        "polygon-opacity: 0;" +
        "line-color: #f7ff00;" +
        "line-width: 2;" +
        "line-opacity: 0;" +
        "}";

    // create layer selector
    // function _createSelector(layers) {
    //     var sql = new cartodb.SQL({user: 'documentation'});
    //
    //     // default selection
    //     layers.getSubLayer(0).show(); // todos
    //     layers.getSubLayer(1).hide(); // adultos
    //     layers.getSubLayer(2).hide(); // niños
    //
    //     var $options = $('#layer_selector li');
    //     $options.click(function (e) {
    //         // get the area of the selected layer
    //         var $li = $(e.target);
    //         var layer = $li.attr('id');
    //         if (selectedLayer != layer) {
    //             // definitely more elegant ways to do this, but went for
    //             // ease of understanding
    //             if (layer == 'abc') {
    //                 layers.getSubLayer(0).show(); // todos
    //                 layers.getSubLayer(1).hide(); // adultos
    //                 layers.getSubLayer(2).hide(); // niños
    //             }
    //             else if (layer == 'efg') {
    //                 layers.getSubLayer(0).hide();
    //                 layers.getSubLayer(1).show();
    //                 layers.getSubLayer(2).hide();
    //             }
    //             else {
    //                 layers.getSubLayer(0).hide();
    //                 layers.getSubLayer(1).hide();
    //                 layers.getSubLayer(2).show();
    //             }
    //         }
    //         selectedLayer = layer;
    //     });
    // }

    function _getCcppClientes(cp_comercio)
    {
        // TODO get real CCPP
        return ["04007", "04002", "04009", "04729", "04760", "04120"];
    }

    return {
        restrict: 'A',
        scope: {
            selectedLayer: '=',
        },
        link: function(scope, elem)
        {
            // create map
            var map = L.map(elem[0], {
                zoomControl: true,
                center: [37, -2],
                zoom: 9
            });

            // base layer
            L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
                attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
            }).addTo(map);

            // demographic layers
            cartodb.createLayer(map,
                'https://aliciapj.carto.com/api/v2/viz/a93a94c4-8bdb-11e6-99ff-0ecd1babdde5/viz.json'
            )
            .addTo(map).done(function (layers)
            {
                var i, n = layers.getSubLayerCount();
                for(i=0; i<n; i++)
                {
                    layers.getSubLayer(i).hide();
                }
                // scope.$watch('selectedLayer', function()
                // {
                //     _.each()
                // });
                /*
                _createSelector(layers);
                */

                // interactivity

                // selection layer
                cartodb.createLayer(map, {
                    user_name: 'aliciapj',
                    type: 'cartodb',
                    sublayers: [{
                        sql: "SELECT * FROM cp_almeria_rejilla",
                        cartocss: _noneFeature,
                        interactivity: "cartodb_id,cod_postal"
                    }]
                }, {
                    // options here
                })
                .addTo(map) // add the layer to our map which already contains 1 sublayer
                .done(function(layer) {
                    /*
                    layer.setZIndex(2);
                    layer.setInteraction(true);

                    // create and add a new sublayer to receive the "featureclick" event
                    layer.createSubLayer({
                            sql: "SELECT * FROM cp_almeria_rejilla",
                            cartocss: _noneFeature
                    });

                    layer.createSubLayer({
                        sql: "SELECT * FROM cp_almeria_rejilla",
                        cartocss: _noneFeature
                    });

                    layer.getSubLayer(0).setInteraction(true);
                    layer.getSubLayer(0).setInteractivity('cartodb_id,cod_postal'); // need to include at least one column to enable interactivity
                    layer.getSubLayer(0).on('featureClick', function(e, latlng, pos, data)
                    {
                        // ???
                        for (var i in map._layers) {
                            if(map._layers[i]._path !== undefined) {
                                try {
                                    map.removeLayer(map._layers[i]);
                                } catch (ex) {
                                    console.log("problem with " + ex + map._layers[i]);
                                }
                            }
                        }

                        console.log(data.cod_postal);  // CODIGO POSTAL DE ORIGEN

                        var ccppClientes = _getCcppClientes(data.cod_postal);
                        var sqlCcppClientes = 'SELECT * FROM cp_almeria_rejilla where cod_postal IN ("' + ccppClientes.join('","') + '"")';

                        var subLayerOptions = {
                            sql: sqlCcppClientes,
                            cartocss: selectedFeature
                        };
                        layer.getSubLayer(1).set(subLayerOptions);

                        var _drawLine = function(bounds)
                        {
                            // get the center of the polygon
                            var center_x = bounds[0][0] + ((bounds[1][0] - bounds[0][0]) / 2);
                            var center_y = bounds[0][1] + ((bounds[1][1] - bounds[0][1]) / 2);
                            L.polyline([[latlng[0], latlng[1]], [ center_x, center_y]]).addTo(map);
                        };

                        var sql = new cartodb.SQL({ user: 'aliciapj' });
                        sql.execute(sqlCcppClientes)
                        .done(function (data) {
                            for (var i = 0; i < data.total_rows; i++) {
                                sql.getBounds("SELECT * FROM cp_almeria_rejilla where cartodb_id = " + data.rows[i].cartodb_id).done(_drawLine);
                            }
                        }); // done
                    });
                    */
                });
            })
            .error(function (err) {
                console.log(err);
            });
        },
    };
});

})();
