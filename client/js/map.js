(function() {
"use strict";

var module = angular.module('mapModule', []);

module.directive('mainMap', function()
{
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

            var ccppCustomLayer = L.geoJson(null,
		    {
		        style: function(feature)
		        {
		            return {
		                fillColor: "#ccc",
		                className: 'ccpp',
		            };
		        },
		        onEachFeature: function(feature, layer)
		        {
		            // _ccppLayers.push(layer);

		            // _.each(scope.options.provinciaEvents, function(handler, eventName)
		            // {
		            //     layer.on(eventName, handler(layer, feature));
		            // });
		        },
		    });
            var ccpp = omnivore.topojson('./map/almeria_20.json', null, ccppCustomLayer);
            ccpp.addTo(map);

        }, // link
    };
});

})();
