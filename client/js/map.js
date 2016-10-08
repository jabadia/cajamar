(function() {
"use strict";

var module = angular.module('mapModule', []);

module.directive('mainMap', function(FLAT_UI_COLORS)
{
    var _map;
    var _demographics;
    var _ccppLayers = [];
    var _lines = [];

    function _createMap(elem, events)
    {
        // create map
        var map = L.map(elem[0], {
            zoomControl: true,
            center: [37, -2],
            zoom: 9
        });

        _map = map;

        // base layer
        L.tileLayer('https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png', {
            attribution: 'Mapbox <a href="http://mapbox.com/about/maps" target="_blank">Terms &amp; Feedback</a>'
        }).addTo(map);

        cartodb.createLayer(map,
            'https://aliciapj.carto.com/api/v2/viz/a93a94c4-8bdb-11e6-99ff-0ecd1babdde5/viz.json'
        )
        .addTo(map)
        .done(function(layer)
        {
            _demographics = layer;
        });

        var ccppCustomLayer = L.geoJson(null,
        {
            style: function(feature)
            {
                return {
                    className: 'ccpp',
                    color: '#fff',
                    weight: 1,
                    opacity: 0.2,
                    fillOpacity: 0,
                };
            },
            onEachFeature: function(feature, layer)
            {
                _ccppLayers.push(layer);

                _.each(events, function (handler, eventName) {
                    layer.on(eventName, handler(layer, feature));
                });
            },
        });
        var ccpp = omnivore.topojson('./map/almeria_20.json', null, ccppCustomLayer);
        ccpp.addTo(map);
    }

    return {
        restrict: 'A',
        scope: {
            colorBy: '=',
            dataByCp: '=byCp',
            mapSelection: '=',
        },
        link: function(scope, elem)
        {
            function repaintMap()
            {
                if( !scope.dataByCp || !scope.colorBy )
                    return;

                var importeAllCcpp = scope.dataByCp.importe.all();
                var ccppClientes = scope.dataByCp.ccppClientes.all();
                var maxImporte = Math.max(_.max(_.map(importeAllCcpp,'value')), 1);
                console.log(scope.colorBy, maxImporte);

                var layerCpComercio = _.find(_ccppLayers, function(l) { return l.feature.properties.COD_POSTAL==scope.mapSelection.cpComercio;});
                var ccppClientesComercio;
                var cpComercioCenter;
                var maxImporteCcppClientes;
                if( layerCpComercio )
                {
                    console.log('layer:', layerCpComercio);
                    ccppClientesComercio = _.find( ccppClientes, {key: scope.mapSelection.cpComercio}) || { value:{}};
                    cpComercioCenter = layerCpComercio.getBounds().getCenter();
                    maxImporteCcppClientes = Math.max(_.max(_.values(ccppClientesComercio.value)),1);
                    _.each(ccppClientesComercio, function(c)
                    {
                        console.log(c);
                    });
                }

                // remove previous lines
                _.each(_lines, function (l) {
                    _map.removeLayer(l);
                });
                _lines = [];

                _.each(_ccppLayers, function(cpLayer)
                {
                    var ccpp = cpLayer.feature.properties.COD_POSTAL;
                    var importe = _.find(importeAllCcpp, {key: ccpp});
                    importe = importe? importe.value : 0;
                    cpLayer.setStyle({fillOpacity: 0.1 + 0.9 * importe/maxImporte});

                    if( ccpp == scope.mapSelection.cpComercio )
                    {
                        cpLayer.setStyle({color: FLAT_UI_COLORS.sunflower, weight: 2, opacity: 1});
                    }
                    else
                    {
                        cpLayer.setStyle({color: '#fff', weight: 1, opacity: 0.2 });
                    }

                    if( layerCpComercio && ccppClientesComercio.value[ccpp] !== undefined )
                    {
                        var importeCcpp = ccppClientesComercio.value[ccpp];

                        if( importeCcpp > 0.001)
                        {
                            var weight = 1 + (importeCcpp / maxImporteCcppClientes * 10);
                            var cpClienteCenter = cpLayer.getBounds().getCenter();
                            var line = new L.Polyline([cpComercioCenter, cpClienteCenter]);
                            line.setStyle({
                                weight: weight,
                                opacity: 0.6,
                                color: FLAT_UI_COLORS.carrot,
                                className: 'lineaCp'
                            });
                            line.addTo(_map);
                            _lines.push(line);
                        }
                    }
                });
            }

            scope.$on('show-demographics', function(ev, show)
            {
                if(!_demographics)
                    return;

                if(show)
                    _demographics.show();
                else
                    _demographics.hide();
            });

            scope.$on('filters-changed', function()
            {
                console.log('filters-changed');
                repaintMap();
            });
            scope.$watchGroup(['colorBy','dataByCp','mapSelection.cpComercio'], repaintMap);

            var events = {
                click: function(layer, feature)
                {
                    return function(/*event*/)
                    {
                        if( scope.mapSelection.cpComercio == feature.properties.COD_POSTAL )
                            scope.mapSelection.cpComercio = null;
                        else
                            scope.mapSelection.cpComercio = feature.properties.COD_POSTAL;

                        scope.$apply(); // event coming from outside angular
                    };
                },
            };

            _createMap(elem, events);

        }, // link
    };
});

})();
