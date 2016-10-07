(function(){
"use strict";

var app = angular.module('app', ['ui.bootstrap','mapModule']);

app.constant('FLAT_UI_COLORS', {
	turquoise: '#1abc9c',
	emerland: '#2ecc71',
	peterriver: '#3498db',
	amethyst: '#9b59b6',
	wetasphalt: '#34495e',
	greensea: '#16a085',
	nephritis: '#27ae60',
	belizehole: '#2980b9',
	wisteria: '#8e44ad',
	midnightblue: '#2c3e50',
	sunflower: '#f1c40f',
	carrot: '#e67e22',
	alizarin: '#e74c3c',
	clouds: '#ecf0f1',
	concrete: '#95a5a6',
	orange: '#f39c12',
	pumpkin: '#d35400',
	pomegranate: '#c0392b',
	silver: '#bdc3c7',
	asbestos: '#7f8c8d',
});

var _SECTOR_COLORS = [  // TODO: cambiar a app.const()
	{ sector: 'ALIMENTACION', color: '#f1c40f'},
	{ sector: 'AUTO', color: '#2c3e50'},
	{ sector: 'BELLEZA', color: '#8e44ad'},
	{ sector: 'HOGAR', color: '#c0392b'},
	{ sector: 'MODA Y COMPLEMENTOS', color: '#c06'},
	{ sector: 'OCIO Y TIEMPO LIBRE', color: '#e67e22'},
	{ sector: 'OTROS', color: '#7f8c8d'},
	{ sector: 'RESTAURACION', color: '#d35400'},
	{ sector: 'SALUD', color: '#2ecc71'},
	{ sector: 'TECNOLOGIA', color: '#2980b9'},
];

var _MONTH_NAMES = "-EFMAMJJASOND".split('');  // TODO: cambiar a app.const()
var _DAY_OF_WEEK_NAMES = "LMXJVSD".split('');  // TODO: cambiar a app.const()

app.constant('MONTHS', [
	{ index:  0, initial: '-', name: 'Todos los meses' },
	{ index:  1, initial: 'E', name: 'Enero' },
	{ index:  2, initial: 'F', name: 'Febrero' },
	{ index:  3, initial: 'M', name: 'Marzo' },
	{ index:  4, initial: 'A', name: 'Abril' },
	{ index:  5, initial: 'M', name: 'Mayo' },
	{ index:  6, initial: 'J', name: 'Junio' },
	{ index:  7, initial: 'J', name: 'Julio' },
	{ index:  8, initial: 'A', name: 'Agosto' },
	{ index:  9, initial: 'S', name: 'Septiembre' },
	{ index: 10, initial: 'O', name: 'Octubre' },
	{ index: 11, initial: 'N', name: 'Noviembre' },
	{ index: 12, initial: 'D', name: 'Diciembre' },
]);

app.constant('WEATHER_TYPES', {
	'clear-day':           'B',
	'partly-cloudy-day':   'H',
	'partly-cloudy-night': 'I',
	'wind':                'F',
	'cloudy':              'N',
	'fog':                 'M',
	'rain':                'R',
});

app.service('backendApi', function($http)
{
	var psv = d3.dsv('|','text/plain');

	return {
		getCardsData: function(params)
		{
			console.log('requesting:', params);
			return $http.get('/api/cards/', {params: params}).then(function(response)
			{
				var cards = psv.parse(response.data, function(r)
				{
					r.DIA = new Date(r.DIA);
					r.IMPORTE = +r.IMPORTE / 1000;
					r.IMPORTE_MEDIO = +r.IMPORTE_MEDIO / 1000;
					r.NUM_OP = + r.NUM_OP;
					r.MES = +r.MES;
					r.SEMANA = moment(r.DIA).isoWeek();
					// r.DIA_SEMANA = +r.DIA_SEMANA;
					return r;
				});

				return cards;
			});
		},
		getSectores: function()
		{
			return $http.get('/api/sectores/').then(function(response)
			{
				return response.data;
			});
		},
		getWeather: function()
		{
			return $http.get('/api/weather/', {cache:true}).then(function(response)
			{
				var weather = psv.parse(response.data, function(r)
				{
					r.day = new Date(r.day);
					r.temp_min = +r.temp_min;
					r.temp_max = +r.temp_max;
					r.humidity = +r.humidity;
					r.moon_phase =  +r.moon_phase;
					return r;
				});

				return weather;
			});
		},
	};
});

function slug(s)
{
	return _.kebabCase(_.deburr(s));
}

app.controller('MainCtrl', function($scope, backendApi, $q, MONTHS, WEATHER_TYPES, FLAT_UI_COLORS, $window, $timeout)
{
	var windowWidth = $window.innerWidth;
	var colWidth = windowWidth / 12;
	var verticalStretch = 0.8;
	var padding = 15 * 2;
	var fgColor = FLAT_UI_COLORS.nephritis;  // FLAT_UI_COLORS.nephritis;
	var defaultMargins = { top: 10, right: 10, bottom: 20, left: 25 };


	var ALL_SECTORS = { id:'*', name: 'Todos los Sectores' };

	/* variables */
	$scope.months = MONTHS;
	$scope.selected = {
		month: $scope.months[0],
		sector: ALL_SECTORS,
	};
	$scope.mapSelection = {
		cpComercio: null,
	};
	$scope.mapColorBy = 'IMPORTE';

	/* funciones */
	$scope.selectSector = function(s)
	{
		$scope.selected.sector = s;
	};

	$scope.selectMonth = function(m)
	{
		$scope.selected.month = m;
	};

	/* init */
	backendApi.getSectores().then(function(sectores)
	{
		$scope.sectores = _.map(sectores, function(s)
		{
			return {
				id: slug(s),
				name: s,
			};
		});
		$scope.sectores.unshift(ALL_SECTORS);
		console.table($scope.sectores);
		console.log(_.map($scope.sectores,'id'));
	});

	$scope.$watch('selected', function()
	{
		var params = {
			month: $scope.selected.month.index? $scope.selected.month.index : undefined,
			sector: $scope.selected.sector.id == '*' ? '*' : $scope.selected.sector.name,
		};
		$scope.loading = true;
		$q.all([backendApi.getWeather(), backendApi.getCardsData(params)]).then(function(results)
		{
			var weather = results[0];
			var data    = results[1];

			$scope.loading = false;

			$scope.weather = weather;
			console.table(weather.slice(0,10));

			$scope.data = data;
			console.table($scope.data.slice(0,5));

			_.each($scope.data, function(d)
			{
				var w = _.find($scope.weather, {day: d.DIA});
				_.extend(d, w);
			});

			var ndx = crossfilter($scope.data);

			var dims = {
				timeofday: ndx.dimension(dc.pluck('FRANJA_HORARIA')),
				weather: ndx.dimension(dc.pluck('icon')),
				dayofweek: ndx.dimension(function(d) { return [0, d.DIA_SEMANA]; }),//ndx.dimension(dc.pluck('DIA_SEMANA')),
				month    : ndx.dimension(dc.pluck('MES')),
				sector   : ndx.dimension(dc.pluck('SECTOR')),
				cpCliente: ndx.dimension(dc.pluck('CP_CLIENTE')),
				cpComercio: ndx.dimension(dc.pluck('CP_COMERCIO')),
				// calendar : ndx.dimension(dc.pluck('DIA'));
				calendar : ndx.dimension(function(d) { return [d.DIA_SEMANA,d.SEMANA]; }),
			};

			var all = ndx.groupAll();
			var importePerSector    = dims.sector.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerMonth     = dims.month.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerTimeofday = dims.timeofday.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerWeather   = dims.weather.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerDayofweek = dims.dayofweek.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerCpCliente  = dims.cpCliente.group().reduceSum(function(d) { return d.IMPORTE; }),
				importePerCpComercio = dims.cpComercio.group().reduceSum(function(d) { return d.IMPORTE; }),
				ccppClientesPerCpComercio = dims.cpComercio.group().reduce(
					function reduceAdd(p, row) {
						if( !p[row.CP_CLIENTE] )
							p[row.CP_CLIENTE] = 0;
						p[row.CP_CLIENTE] += row.IMPORTE;
						return p;},
					function reduceRemove(p, row) {
						p[row.CP_CLIENTE] -= row.IMPORTE;
						return p;},
					function reduceInitial() {
						return {};
					}
				),
				importePerDay       = dims.calendar.group().reduceSum(function(d) { return d.IMPORTE; });

			$scope.ccppComercios = _.map(importePerCpComercio.all(),'key');

			$scope.dataByCp = {
				importe: importePerCpCliente,
				ccppClientes: ccppClientesPerCpComercio,
			};
			$scope.$watch('mapSelection.cpComercio', function()
			{
				dims.cpComercio.filter($scope.mapSelection.cpComercio);
				dc.redrawAll();
			});

			$scope.resetFilters = function()
			{
				$scope.mapSelection.cpComercio = null;
				dc.filterAll();
				dc.redrawAll();
			};

			function updateMap(chart, filter)
			{
				$scope.$broadcast('filters-changed');
				console.log(chart.filters());
			}


			var sectorChart = dc.rowChart('.sector-chart'),
				monthChart = dc.barChart('.month-chart'),
				timeofdayChart = dc.timeSector('.timeofday-chart'),
				weatherChart = dc.timeSector('.weather-chart'),
				// dayofweekChart = dc.bubbleChart('.dayofweek-chart');
				dayofweekChart = dc.heatMap('.dayofweek-chart'),
				calendarChart = dc.heatMap('.calendar');

			// sectores
			sectorChart
				.width(colWidth * 3 - padding)
				.height(verticalStretch * colWidth * 2)
				.margins(defaultMargins)
				.dimension(dims.sector)
				.group(importePerSector)
				.ordinalColors(_.map(_SECTOR_COLORS,'color')) // los sectores aparecen en orden alfabético
				.colorAccessor(function(d){ return d.key; })
				.gap(0)
				.elasticX(true)
				.on('filtered', updateMap);


			monthChart
				.width(colWidth * 3 - padding)
				.height(verticalStretch * colWidth * 1.5)
				.margins(defaultMargins)
				.dimension(dims.month)
				.group(importePerMonth)
				.x( d3.scale.ordinal())
				.xUnits(dc.units.ordinal)
				.colors([fgColor])
				.elasticY(true)
				.on('filtered', updateMap);

			monthChart.xAxis().tickFormat(function(v) { return _MONTH_NAMES[v]; });

			var extent = d3.extent(importePerDayofweek.all(), function(d) { return d.value; });
			dayofweekChart
				.width(colWidth * 3 - padding)
				.height(colWidth * 0.6)
				.margins(defaultMargins)
				.dimension(dims.dayofweek)
				.group(importePerDayofweek)
				.xBorderRadius(5)
				.yBorderRadius(5)
				.valueAccessor(function() { return 0; })
				.linearColors([
					d3.rgb(fgColor).darker(3),
					fgColor,
					d3.rgb(fgColor).brighter(3),
				])
				.colorAccessor(function(d) { return d.value; })
				.calculateColorDomain()
				.colsLabel(function(v) { return _DAY_OF_WEEK_NAMES[v[1]];})
				.rowsLabel('')
				.on('filtered', updateMap);
				// .x( d3.scale.ordinal().domain([0,1,2,3,4,5,6]))
				// .xUnits(dc.units.ordinal)
				// .y( d3.scale.linear().domain([-10000,10000]))
				// .valueAccessor(function() { return 0; })
				// // .r( d3.scale.log().base(10).domain([0,100]).range([0,50]))
				// .r( d3.scale.linear().domain(extent).range([0,1]) ) // [0,10000000]
				// .radiusValueAccessor(function(d) {
				// 	// console.log(d);
				// 	return d.value; /// 100000;
				// })
				// .elasticRadius(false);
			// dayofweekChart.xAxis().tickFormat(function(v) { return _DAY_OF_WEEK_NAMES[v]; });
			dayofweekChart.on('preRedraw', function()
			{
				dayofweekChart.calculateColorDomain();
			});

			// time of day
			timeofdayChart
				.width(colWidth * 1.5 - padding - 10)
				.height(colWidth * 1.5 - padding - 10)
				.dimension(dims.timeofday)
				.group(importePerTimeofday)
				.ordinalColors([
					d3.rgb(FLAT_UI_COLORS.midnightblue).darker(0.5),
					FLAT_UI_COLORS.midnightblue,
					d3.rgb(FLAT_UI_COLORS.midnightblue).brighter(1),
					FLAT_UI_COLORS.pumpkin,
					FLAT_UI_COLORS.carrot,
					FLAT_UI_COLORS.orange,
					FLAT_UI_COLORS.orange,
					FLAT_UI_COLORS.sunflower,
					FLAT_UI_COLORS.sunflower,
					FLAT_UI_COLORS.nephritis,
					FLAT_UI_COLORS.belizehole,
					d3.rgb(FLAT_UI_COLORS.belizehole).darker(0.5),
				])
				.externalLabels(-15)
				.innerRadius(20)
				.on('filtered', updateMap);


			// weather
			weatherChart
				.width(colWidth * 1.5 - padding - 10)
				.height(colWidth * 1.5 - padding - 10)
				.dimension(dims.weather)
				.group(importePerWeather)
				.ordinalColors([
					FLAT_UI_COLORS.sunflower,
					FLAT_UI_COLORS.belizehole,
					FLAT_UI_COLORS.concrete,
					FLAT_UI_COLORS.carrot,
					FLAT_UI_COLORS.midnightblue,
					FLAT_UI_COLORS.greensea,
					FLAT_UI_COLORS.wisteria,
				])
				.label(function(d) { return WEATHER_TYPES[d.key]; })
				.externalLabels(-25)
				.innerRadius(0)
				.on('filtered', updateMap);



			calendarChart
				.width(colWidth * 9 - padding - 10)
				.height(200)
				.dimension(dims.calendar)
				.group(importePerDay)
				.xBorderRadius(1)
				.yBorderRadius(1)
				.rowsLabel(function(v) { return _DAY_OF_WEEK_NAMES[v[0]];})
				.valueAccessor(function(d) { return d.key[0]; })
				.keyAccessor(function(d) { return d.key[1]; })
				.linearColors([
					d3.rgb(fgColor).darker(3),
					fgColor,
					d3.rgb(fgColor).brighter(3),
				])
				.colorAccessor(function(d) { return d.value; })
				.calculateColorDomain()
				.on('filtered', updateMap);

			calendarChart.on('preRedraw', function()
			{
				calendarChart.calculateColorDomain();
			});

			dc.renderAll();

			// var calendarData = _.map(importePerDay.all(), function(d)
			// {
			// 	return {
			// 		date: d.key,
			// 		count: d.value,
			// 	};
			// });

			// var calendar = calendarHeatmap()
			// 	.data(calendarData)
			// 	.selector('.calendar')
			// 	.tooltipEnabled(true)
			// 	.colorRange(['#f4f7f7', '#79a8a9'])
			// 	.onClick(function (data) {
			// 		console.log('data', data);
			// 	});
			// calendar();

			//http://bl.ocks.org/eesur/5fbda7f410d31da35e42  calendar
			//http://angularscript.com/angular-directive-for-d3-js-calendar-heatmap/
		});
	}, true);
});

}());
